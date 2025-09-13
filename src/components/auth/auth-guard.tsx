'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
    children: React.ReactNode
}

export function AuthGuard ({children}: AuthGuardProps) {
    const {data: session, status} = useSession()
    const router = useRouter()

    useEffect(()=>{
        if(status === 'loading') return 
        if(status === 'unauthenticated'){
            router.push('/auth/signin')
        }
    }, [status, router])

    if(status === 'loading'){
        return (
            <div className="">
                loading
            </div>
        )
    }
    if(status === 'unauthenticated'){
        return null
    }
    return {children}

}