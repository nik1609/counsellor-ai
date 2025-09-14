'use client'

import { trpc } from "@/lib/trpc-client"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState, useCallback, useRef } from "react"
import { Input } from "../ui/input"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Edit2, LogOut, MessageSquare, Moon, MoreHorizontal, Settings, Sparkles, SquarePen, Sun, Trash2, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Switch } from "../ui/switch"

interface SidebarProps {
    selectedSessionId: string | null
    onSelectSession: (sessionId: string) => void
    onCloseSlider: () => void
}
export function Sidebar({selectedSessionId, onSelectSession, onCloseSlider}: SidebarProps){

    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const {data: session} = useSession()
    const {theme, setTheme} = useTheme()

    const utils = trpc.useContext()

    //fetch chat sessions with infinite query
    const {
        data: sessionsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingSessions
    } = trpc.chat.getSessions.useInfiniteQuery(
        {limit: 20},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            staleTime: 5*60*1000,
            refetchOnWindowFocus: false
        }
    )

    const createSessionMutation = trpc.chat.createSession.useMutation({
        onSuccess: (newSession) => {
            // Invalidate and refetch sessions to update the sidebar
            utils.chat.getSessions.invalidate()
            toast.success('New chat session created!')
            onSelectSession(newSession.id)
            setIsCreatingSession(false)
        },
        onError: () => {
            toast.error('Failed to create session')
            setIsCreatingSession(false)
        }
    })

    const handleCreateSession = async() => {
        setIsCreatingSession(true)
        createSessionMutation.mutate({})

    }

    const deleteSessionMutation = trpc.chat.deleteSession.useMutation({
        onSuccess: () => {
            // Invalidate and refetch sessions to update the sidebar
            utils.chat.getSessions.invalidate()
            toast.success('Chat deleted successfully')
        },
        onError: () => {
            toast.error('Failed to delete chat')
        }
    })

    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this chat?')) {
            deleteSessionMutation.mutate({sessionId})
            // If deleting current session, clear selection
            if (selectedSessionId === sessionId) {
                onSelectSession('')
            }
        }
    }

    const sessions = sessionsData?.pages.flatMap(page => page.sessions) ?? []

    const updateSessionTitleMutation = trpc.chat.updateSessionTitle.useMutation({
        onSuccess: () => {
            utils.chat.getSessions.invalidate()
            toast.success('Session title updated!')
            setEditingSessionId(null)
            setEditTitle('')
        },
        onError: () => {
            toast.error('Failed to update session title')
        }
    })

    const handleEditTitle = (sessionId: string, currentTitle: string) => {
        setEditingSessionId(sessionId)
        setEditTitle(currentTitle)
    }

    const handleSaveTitle = () => {
        if (editingSessionId && editTitle.trim()) {
            updateSessionTitleMutation.mutate({
                sessionId: editingSessionId,
                title: editTitle.trim()
            })
        }
    }

    const handleCancelEdit = () => {
        setEditingSessionId(null)
        setEditTitle('')
    }

    const scrollRef = useRef<HTMLDivElement>(null)
    const [isScrolling, setIsScrolling] = useState(false)
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return

        // Show scrollbar while scrolling
        setIsScrolling(true)

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current)
        }

        // Hide scrollbar after scroll ends
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false)
        }, 1000)

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10

        if (isNearBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    const handleSignOut = async () =>{
        try {
            await signOut({callbackUrl: '/auth/signin'})
        } catch (error) {
            toast.error('Failed to sign out')
        }
    }



    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-800 border-r flex flex-col overflow-hidden">
            {/* header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-start mb-4">
                    <div className="flex items-center justify-center mr-2 w-6 h-6 text-black dark:text-white rounded-md">
                        <Sparkles className="w-4 h-4 text-black dark:text-white"/>
                    </div>
                    <h2 className="font-semibold text-lg">CareerGenie AI</h2>
                </div>

                {/* new chat btn */}
                <div
                    onClick={handleCreateSession}
                    className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group
                        border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50
                        hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600
                        ${isCreatingSession ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <SquarePen className="h-4 w-4 text-gray-500 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                            {isCreatingSession ? 'Creating...' : 'New Chat'}
                        </p>
                    </div>
                </div>
            </div>
            <div
                ref={scrollRef}
                className={`flex-1 overflow-y-auto py-2 scrollbar-macos ${isScrolling ? 'scrolling' : ''}`}
                onScroll={handleScroll}
            >
                <div className="space-y-1 py-2">
                {isLoadingSessions ? (
                    <div className="space-y-2 px-3">
                        {Array.from({length: 6}).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="flex items-center space-x-3 py-2">
                                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="flex-1 space-y-1">
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <MessageSquare className="h-8 w-8 mx-auto opacity-50"/>
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs">Start a new chat to get career guidance</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} 
                        className={`
                            group flex items-center space-x-3 px-3 ml-4 mr-1.5 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedSessionId === session.id ? " bg-gray-100 dark:bg-gray-700 border-l-2 border-gray-500" : ""}
                            `}
                            onClick={()=>{
                                onSelectSession(session.id)
                                onCloseSlider()
                            }}
                        >
                            <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                {editingSessionId === session.id ? (
                                    <div className="space-y-1">
                                        <Input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="text-sm h-6 p-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveTitle()
                                                if (e.key === 'Escape') handleCancelEdit()
                                            }}
                                            onBlur={handleSaveTitle}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium truncate">{session.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(session.updatedAt).toLocaleDateString()}
                                        </p>
                                    </>
                                )}
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
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditTitle(session.id, session.title)
                                        }}
                                    >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit title
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={(e) => handleDeleteSession(session.id, e)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete chat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                        </div>
                    ))
                )}

                {/* Loading indicator for infinite scroll */}
                {isFetchingNextPage && (
                    <div className="text-center py-4">
                        <div className="text-sm text-gray-500">Loading more...</div>
                    </div>
                )}
                </div>
            </div>
            <Separator/>
                  <div className="p-4 space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-sm">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>

        <Separator />
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
        </div>
    )
}