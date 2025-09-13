import {PrismaAdapter} from '@auth/prisma-adapter'
import { prisma } from './prisma'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user || !user.password) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            }
        }),
    ],
    callbacks: {
        session: async({session, token}) => {
            if(session?.user && token?.sub) {
                session.user.id = token.sub
            }
            return session
        },
        jwt: async({user, token}) => {
            if(user){
                token.sub = user.id
            }
            return token
        }
    },
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    }

}