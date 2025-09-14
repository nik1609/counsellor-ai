'use client'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Eye, EyeOff, Moon, Sun, Sparkles } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";

export default function SignIn () {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    useEffect(()=>{
        setMounted(true)
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

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

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

                // Auto sign in after successful registration
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                })

                if(result?.error) {
                    toast.error('Account created but sign in failed. Please try signing in manually.')
                    setIsSignUp(false)
                    setFormData({name:'', email: formData.email, password: ''})
                } else if(result?.ok) {
                    toast.success('Account created and signed in successfully!')
                    router.push('/')
                }
            } else{
                //sign in user
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                })

                if(result?.error) {
                    throw new Error('Invalid credentials')
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
        <div className="min-h-screen bg-white dark:bg-black">

            {/* Header with logo and theme toggle - Desktop only */}
            <div className="hidden sm:block absolute top-0 left-0 right-0 z-10 p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-black dark:bg-white rounded-lg">
                            <Sparkles className="w-5 h-5 text-white dark:text-black"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-black dark:text-white">
                                CareerGenie
                            </h1>
                            <p className="text-xs text-gray-600 dark:text-gray-400">AI Career Counselor</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                        {mounted ? (
                            theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                        ) : (
                            <div className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex items-center justify-center min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardHeader className="text-center space-y-6 pt-8 sm:pt-8 pb-6">
                            {/* Mobile logo display */}
                            <div className="block sm:hidden mb-2">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="flex items-center justify-center w-6 h-6 bg-black dark:bg-white rounded-md">
                                        <Sparkles className="w-4 h-4 text-white dark:text-black"/>
                                    </div>
                                    <h1 className="text-lg font-semibold text-black dark:text-white">
                                        CareerGenie
                                    </h1>
                                </div>
                            </div>

                            <CardTitle className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
                                {isSignUp ? 'Create your account' : 'Welcome back'}
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
                                {isSignUp
                                    ? 'Get personalized AI-powered career guidance and unlock your professional potential'
                                    : 'Welcome back! Continue your career development journey with AI-powered insights'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6 sm:p-8 pt-2 sm:pt-4">
                            <form className="-mt-6 space-y-4" onSubmit={handleEmailPasswordAuth}>
                                {isSignUp && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Name</label>
                                        <Input
                                            type="text"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev =>({...prev, name: e.target.value}))}
                                            required={isSignUp}
                                            className="h-11 border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:border-black dark:focus:border-white focus:ring-0"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Email address</label>
                                    <Input
                                        type="email"
                                        placeholder="Your email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev =>({...prev, email: e.target.value}))}
                                        required
                                        className="h-11 border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:border-black dark:focus:border-white focus:ring-0"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Your password"
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev =>({...prev, password: e.target.value}))}
                                            required
                                            className="h-11 border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:border-black dark:focus:border-white focus:ring-0 pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-500"/> : <Eye className="h-4 w-4 text-gray-500"/>}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Password must be at least 6 characters long
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mt-6"
                                    size="lg"
                                >
                                    {loading ?
                                        (isSignUp ? 'Creating account...' : 'Signing in...')
                                        : (isSignUp? 'Create account' : 'Sign in')
                                    }
                                </Button>

                                <div className="text-center -mt-1">
                                    <button
                                        type="button"
                                        onClick={()=>{
                                            setIsSignUp(!isSignUp)
                                            setFormData({name:'', email:'', password:''})
                                        }}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                                    </button>
                                </div>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full border-gray-200 dark:border-gray-800"/>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white dark:bg-black px-2 text-gray-500 dark:text-gray-400">OR</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full h-11 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                size="lg"
                                variant="outline"
                            >
                                <Chrome className="mr-2 h-4 w-4"/>
                                Continue with Google
                            </Button>

                            {/* Features preview inside card */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-6">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                    Join thousands of professionals using CareerGenie for:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Career Planning</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Skills Assessment</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Interview Prep</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Growth Insights</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* App Description */}
                    <div className="mt-8 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black dark:text-white text-center mb-4">
                            What is CareerGenie?
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                            Your AI-powered career counselor that provides personalized guidance for professional growth and success.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-white dark:text-black text-xs font-bold">✓</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-black dark:text-white">Career Planning</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Personalized roadmaps for career transitions and growth</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-white dark:text-black text-xs font-bold">✓</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-black dark:text-white">Skills Assessment</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered analysis of your strengths and development areas</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-white dark:text-black text-xs font-bold">✓</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-black dark:text-white">Interview Prep</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Practice sessions and personalized feedback for interviews</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-white dark:text-black text-xs font-bold">✓</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-black dark:text-white">Growth Strategies</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Professional development insights and actionable advice</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
