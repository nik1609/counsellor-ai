'use client'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Chrome, Eye, EyeOff, Mail } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function SignIn () {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    useEffect(()=>{
        const checkSession = async() => {
            const session = await getSession()
            if(session){
                router.push('/')
            }
        }
        checkSession()
    },[router])

    const handleGoogleSignIn = async() =>{
        try {
            setLoading(true)
            await signIn('google', {callbackUrl:'/'})
        } catch (error){
            console.error("Sigin in error:", error)
            toast.error("Failed to signin with Google")
        } finally {
            setLoading(false)
        }
    }

    const handleEmailPasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try{
            if(isSignUp) {
                //register the user
                const response = await fetch('/api/auth/register',{
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                })
                if(!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Registration failed')
                }

                toast.success('Account Created! Please sign in.')
                setIsSignUp(false)
                setFormData({name:'', email: formData.email, password: ''})
            } else{
                //sign in user
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                })

                if(result?.error) {
                    throw new Error('Invalide credentials')
                }
                if(result?.ok){
                    router.push('/')
                }
            }
        } catch (error){
            console.error('Auth error:',error)
            toast.error(error instanceof Error ? error.message : 'Authentication failed')

        } finally{
            setLoading(false)
        }
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 md:px-8 ">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-blue-600"/>
            </div>
            <CardTitle className="text-2xl">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
                {isSignUp 
                    ? 'Create your account to start getting AI career guidance'
                    : 'Sign in to continue your career counseling journey'
                }
            </CardDescription>
        </CardHeader>
        <CardContent >
            <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
            variant="outline"
            >
                <Chrome className="mr-2 h-4 w-4"/>
                Conitue with Google
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full"/>
                </div>
                <div className="relative flex justify-center text-xs  uppercase">
                    <span className="bg-white px-2 text-muted-foreground">or</span>
                </div>
            </div>

            {/* email and password */}
            <form className="space-y-4" onSubmit={handleEmailPasswordAuth}>
                {isSignUp && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium ">Full Name</label>
                        <Input
                            type="text"
                            placeholder="Enter Your full name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev =>({...prev, name: e.target.value}))}
                            required={isSignUp}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium ">Email</label>
                        <Input
                            type="email"
                            placeholder="Enter Your email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev =>({...prev, email: e.target.value}))}
                            required
                        />
                </div>
                <div className="space-y-2" onSubmit={handleEmailPasswordAuth}>
                    <label className="text-sm font-medium ">Password</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Your password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev =>({...prev, password: e.target.value}))}
                                required
                            />
                            <Button 
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </Button>
                        </div>
                        {isSignUp && (
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 6 characters long
                            </p>
                        )}
                </div>
                <Button 
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
                >
                    <Mail className="mr-2 h-4 w-4"/>
                    {loading ?
                    (isSignUp ? 'Creating Account...' : 'Signing In...')
                    : (isSignUp? 'Create Account' : 'Sign In')
                    }
                </Button>
            </form>
            <div className="text-center">
                <button
                    type="button"
                    onClick={()=>{
                        setIsSignUp(!isSignUp)
                        setFormData({name:'', email:'', password:''})
                    }}
                    className="text-sm hover:underline text-gray-600 hover:cursor-pointer "
                >
                    {isSignUp ? "Already have an account? Sign in" : " Don't have an account? Create one"}
                </button>
            </div>
            <div className="mt-6 text-center text-xs text-gray-600">
            <p>
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </div>
<div className="mt-6 space-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Career planning and transitions
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Skills assessment and development
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Interview preparation
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Professional growth strategies
            </div>
          </div>
        </CardContent>
        </Card>
        </div>
    )
}