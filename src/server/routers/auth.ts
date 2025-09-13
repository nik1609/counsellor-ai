import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc";


export const authRouter = createTRPCRouter({
    //what is my current session
    getSession: publicProcedure.query(({ctx})=>{
        return {
            user: ctx.session?.user || null,
            session: ctx.session || null,
        }
    }),

    //logged in user, only if authenticated
    getMe: protectedProcedure.query(({ctx})=>{
        return {
            user: ctx.user,
        }
    }),
})