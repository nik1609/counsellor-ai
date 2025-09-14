'use client'
import { Loader2 } from "lucide-react"
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
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4"/>

                </div>
            </div>
        )
    }
    if(status === 'unauthenticated'){
        return null
    }
    return <>
    {children}
    </>

}