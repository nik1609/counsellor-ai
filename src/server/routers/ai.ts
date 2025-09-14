import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { CAREER_COUNSELOR_SYSTEM_PROMPT, genAI } from "./openai";
import { MessageRole } from "@prisma/client";

export const aiRouter = createTRPCRouter({
    generateResponse: protectedProcedure
        .input(
            z.object({
                sessionId: z.string(),
                userMessage: z.string(),
            })  
        )
        .mutation(async ({input, ctx}) => {
            const {sessionId,userMessage} = input
            const userId = ctx.user.id!
            try {
                // verify session exists
                const session = await prisma.chatSession.findUnique({
                    where: {id: sessionId}
                })
                if(!session){
                    throw new TRPCError({
                        code:'NOT_FOUND',
                        message: "Session Not Found"
                    })
                }

                //get previous messages for context
                const previousMessages = await prisma.message.findMany({
                    where: {sessionId},
                    orderBy: {createdAt: 'asc'},
                    take: 10, // last 10 messages for context
                })

                // Create conversation history for Gemini
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    systemInstruction: CAREER_COUNSELOR_SYSTEM_PROMPT
                });

                // Build conversation history in Gemini format
                const history = previousMessages.map(msg => ({
                    role: msg.role === 'USER' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }));

                // Start chat with history
                const chat = model.startChat({
                    history: history,
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.7,
                    }
                });

                //generate AI response
                const result = await chat.sendMessage(userMessage);
                const response = result.response;
                console.log('response', response);

                const aiContent = response.text() || "I apologize, but I encountered an issue generating a response. Please try again."

                //save Ai respinse to database
                const aiMessage = await prisma.message.create({
                    data: {
                        content: aiContent,
                        role: MessageRole.ASSISTANT,
                        sessionId,
                        userId,
                    }
                })

                //update session timestamp
                await prisma.chatSession.update({
                    where: { id: sessionId},
                    data: {updatedAt: new Date()},
                })

                // If this is the first user message, generate a smart title
                // Check if this is the first USER message (previousMessages includes the user message that was just saved)
                const userMessages = previousMessages.filter(msg => msg.role === 'USER');
                console.log('Previous messages count:', previousMessages.length);
                console.log('Previous USER messages count:', userMessages.length);

                if (userMessages.length === 1) {
                    console.log('Generating title for first user message:', userMessage);
                    try {
                        const titleModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                        const titlePrompt = `Generate a short, descriptive title (3-6 words) for a career counseling chat based on this message: "${userMessage}"\n\nExamples:\n- "Career Change to Tech"\n- "Interview Preparation Help"\n- "Skills Development Planning"\n- "Resume Review Discussion"\n\nOnly return the title, nothing else:`;

                        const titleResult = await titleModel.generateContent(titlePrompt);
                        let title = titleResult.response.text().trim();
                        title = title.replace(/^["']|["']$/g, '');

                        if (title && title.length <= 50) {
                            await prisma.chatSession.update({
                                where: { id: sessionId },
                                data: { title }
                            });
                            console.log('Session title updated to:', title);
                        }
                    } catch (titleError) {
                        console.error('Failed to generate session title:', titleError);
                    }
                }

                return {
                    ...aiMessage,
                    role: aiMessage.role.toLowerCase() as 'assistant',
                }
            } catch(error) {
                console.error("Gemini API error:", error)

                //save a fallback response
                const fallbackContent = "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment, and I'll be happy to help with your career questions."

                const fallbackMessage = await prisma.message.create({
                    data:{
                        content: fallbackContent,
                        role: MessageRole.ASSISTANT,
                        sessionId,
                        userId,
                    }
                })
                return {
                    ...fallbackMessage,
                    role: fallbackMessage.role.toLowerCase() as 'assistant',
                }
             }
        })
})