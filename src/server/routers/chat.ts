import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc";
import { MessageRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {z} from 'zod'

export const chatRouter = createTRPCRouter({
    //get sessions pagination implemented
    getSessions: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(10),
                cursor: z.string().optional()
            }).default({limit:10})
        )
        .query(async ({input, ctx}) => {
            const {limit, cursor} = input
            const userId = ctx.user.id

            const sessions = await prisma.chatSession.findMany({
                where: {userId},
                orderBy: {updatedAt:'desc'},
                take: limit+1,
                cursor: cursor? {id:cursor} : undefined
            })

            let nextCursor: string | undefined = undefined
            if(sessions.length > limit){
                const nextSession = sessions.pop()
                nextCursor = nextSession!.id
            }
            return {
                sessions,
                nextCursor
            }
        }),
    //get individual session
    getSession: protectedProcedure
        .input(
            z.object({
                id:z.string()
            })
        )
        .query(async ({input,ctx}) =>{
            const session = await prisma.chatSession.findUnique({
                where: {id: input.id}
            })

            if(!session){
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Session not found',
                })
            }

            return session
        }),
    // create New session
    createSession: protectedProcedure
        .input(
            z.object({
                title: z.string().min(1).max(100).optional(),
            }).optional()
        )
        .mutation(async ({input,ctx}) => {
            const title = input?.title || 'New Career Discussion'
            const userId =ctx.user.id!

            const newSession = await prisma.chatSession.create({
                data:{
                    title,
                    userId
                }
            })
            return newSession
        }),
    //get all the messages
    getMessages: protectedProcedure
        .input(
            z.object({
                sessionId: z.string(),
                limit: z.number().min(1).max(50).default(20),
                cursor: z.string().optional()
            })
        )
        .query(async ({input,ctx}) =>{
            const {sessionId, limit, cursor} = input

            const messages = await prisma.message.findMany({
                where: {sessionId},
                orderBy: {createdAt: 'asc'},
                take: limit+1,
                cursor: cursor ? {id:cursor} : undefined,
            })
            let nextCursor: string | undefined = undefined
            if(messages.length >limit) {
                const nextMessage = messages.pop()
                nextCursor = nextMessage!.id
            }

            const formattedMessages = messages.map(msg =>({
                ...msg,
                role:msg.role.toLowerCase() as 'user' | 'assistant'
            }))

            return {
                messages: formattedMessages,
                nextCursor,
            }
        }),
    // send a message
    sendMessage: protectedProcedure
        .input(
            z.object({
                sessionId: z.string(),
                content: z.string().min(1).max(4000),
            })
        )
        .mutation(async ({input,ctx}) => {
            const {sessionId, content} = input
            const userId = ctx.user.id!

            //verify session exists
            const session =  await prisma.chatSession.findUnique({
                where: {id: sessionId},
            })

            if(!session) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Session Not Found',
                })
            }

            //save user message
            const userMessage = await prisma.message.create({
                data:{
                    content,
                    role: MessageRole.USER,
                    sessionId,
                    userId
                }
            })

            //update session timestamp
            await prisma.chatSession.update({
                where:{id:sessionId},
                data: {updatedAt: new Date()},
            })
            return {
                ...userMessage,
                role: userMessage.role.toLowerCase() as 'user' | 'assistant',
            }
        }),
    // delete session
    deleteSession: protectedProcedure
        .input(
            z.object({
                sessionId: z.string()
            })
        )
        .mutation(async ({input, ctx}) => {
            const {sessionId} = input
            const userId = ctx.user.id!

            // verify session exists and belongs to user
            const session = await prisma.chatSession.findUnique({
                where: {id: sessionId},
            })

            if(!session || session.userId !== userId) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Session not found or unauthorized',
                })
            }

            // delete all messages first (cascade should handle this, but being explicit)
            await prisma.message.deleteMany({
                where: {sessionId}
            })

            // delete the session
            await prisma.chatSession.delete({
                where: {id: sessionId}
            })

            return {success: true}
        })
})