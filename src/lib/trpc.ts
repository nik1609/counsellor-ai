import {initTRPC,TRPCError} from "@trpc/server"
import { type Session } from "next-auth"
import { type NextRequest } from "next/server"
import superjson from 'superjson'
import {ZodError} from 'zod'

interface Context{
    req: NextRequest
    session: Session | null
}

const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({shape, error}) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
            }
        }
    }
})

const isAuthed = t.middleware(({next,ctx})=>{
    if(!ctx.session?.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: 'You must be logged in to access this resource',
        })
    }
    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
            user: ctx.session.user,
        }
    })

})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)