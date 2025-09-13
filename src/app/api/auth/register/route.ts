import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest){
    try{
        const body = await request.json()
        console.log("body",body)
        const {name, email, password} = registerSchema.parse(body)

        //if user exists
        const existingUser = await prisma.user.findUnique({
            where: {email}
        })

        if(existingUser) {
            return NextResponse.json(
                {error: "User with this email already exists"},
                {status:400}
            )
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password,12)

        //create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        //return user without password
        const {password:_, ...userWithoutPassword} = user
        return NextResponse.json({
            message: "User created Successfully",
            user: userWithoutPassword
        })

    } catch(error){
        console.error('Registration error:', error)
        if(error instanceof z.ZodError){
            return NextResponse.json(
                {error: 'Validation Failed', details: error.errors},
                {status: 400})
        }

        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        )
        
    }
}