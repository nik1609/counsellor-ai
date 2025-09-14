import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import { authOptions } from "@/lib/auth";
import { appRouter } from "@/server";
import { getServerSession } from "next-auth";
import {type NextRequest } from "next/server";

const handler = async (req: NextRequest) =>{
    const session = await getServerSession(authOptions)

    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: ()=>({req,session}),
    })
}
export {handler as GET, handler as POST}