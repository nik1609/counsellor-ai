import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { CAREER_COUNSELOR_SYSTEM_PROMPT, openai } from "./openai";
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

                //format message for openApi
                const messages: any[] = [
                    {
                        role: 'system',
                        content: CAREER_COUNSELOR_SYSTEM_PROMPT
                    },
                    ...previousMessages.map(msg => ({
                        role: msg.role.toLowerCase(),
                        content: msg.content,
                    })),
                    {role:'user', content: userMessage},
                ]

                //generate AI response
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages,
                    max_tokens: 1000,
                    temperature: 0.7
                })
                console.log('response',response)

                const aiContent = response.choices[0]?.message?.content || "I apologize, but I encountered an issue generating a response. Please try again."

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

                return {
                    ...aiMessage,
                    role: aiMessage.role.toLowerCase() as 'assistant',
                }
            } catch(error) {
                console.error("OpenAI API error:", error)

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