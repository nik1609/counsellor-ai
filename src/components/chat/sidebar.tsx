'use client'

import { trpc } from "@/lib/trpc-client"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { LogOut, MessageSquare, MoreHorizontal, Plus, Settings } from "lucide-react"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

interface SidebarProps {
    selectedSessionId: string | null
    onSelectSession: (sessionId: string) => void
    onCloseSlider: () => void
}
export function Sidebar({selectedSessionId, onSelectSession, onCloseSlider}: SidebarProps){

    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const {data: session} = useSession()
    const {theme, setTheme} = useTheme()

    const utils = trpc.useContext()

    //fetch chat sessions
    const {data: sessionsData} = trpc.chat.getSessions.useQuery(
        {limit:20},
        {
            staleTime: 5*60*1000,
            refetchOnWindowFocus: false
        }
    )

    const createSessionMutation = trpc.chat.createSession.useMutation({
        onSuccess: (newSession) => {
            utils.chat.getMessages.invalidate().then(
                () => {
                    toast.success('New chat session created!')
                    onSelectSession(newSession.id)
                    setIsCreatingSession(false)
                }
                
            )
        },
        onError: (error) => {
            toast.error('Failed to create session')
            setIsCreatingSession(false)
        }
    })

    const handleCreateSession = async() => {
        setIsCreatingSession(true)
        createSessionMutation.mutate({})

    }

    const sessions = sessionsData?.sessions ?? []

    const handleSignOut = async () =>{
        try {
            await signOut({callbackUrl: '/auth/signin'})
        } catch (error) {
            toast.error('Failed to sign out')
        }
    }



    return (
        <div className="h-full bg-gray-50 dark:bg-gray-800 border-r flex flex-col">
            {/* header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg"> Counsellor AI</h2>
                </div>

                {/* new chat btn */}
                <Button
                    onClick={handleCreateSession}
                    disabled={isCreatingSession}
                    className="w-full justify-start"
                    variant={"outline"}
                    >
                    <Plus className="w-4 h-4 mr-2"/>
                    {isCreatingSession ? 'Creating...' : 'New Chat'}
                </Button>
            </div>
            <ScrollArea className="flex-1 py-2">
                <div className="space-y-1 py-2">
                {sessions.length === 0   ? (
                    <div className="text-center text-gray-500 dark:text-gray-400  py-8">
                        <MessageSquare className="h-8 w-8 mx-auto opacity-50"/>
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs">Start a new chat to get career guidance</p>    
                    </div>
                ): (
                    sessions.map((session) => (
                        <div key={session.id} 
                        className={`
                            group flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedSessionId === session.id ? " bg-gray-100 dark:bg-gray-700 border-l-2 border-blue-500" : ""}
                            `}
                            onClick={()=>{
                                onSelectSession(session.id)
                                onCloseSlider()
                            }}
                        >
                            <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{session.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(session.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6"
                                    >
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {/* implement delete functionality */}
                                    <DropdownMenuItem className="text-red-600">
                                    Delete chat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                        </div>
                    ))
                )}
                </div>
            </ScrollArea>
            <Separator/>
                <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 text-left flex-1">
                <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{session?.user?.email || 'user@example.com'}</p>
              </div>
              <Settings className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem> */}
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
    )
}