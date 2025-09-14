'use client'

import { trpc } from "@/lib/trpc-client"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Bot, Loader2, Send, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"

interface ChatAreaProps {
    sessionId: string | null
}

interface Message {
    id: string,
    content: string
    role: 'user' | 'assistant'
    createdAt: Date
}
export function ChatArea({sessionId}: ChatAreaProps) {
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const utils = trpc.useContext()

    // fetch message for the session
    const {data: messageData, isLoading: isLoadingMessages} = trpc.chat.getMessages.useQuery(
        {sessionId: sessionId!, limit:50},
        {enabled: !!sessionId}
    )

    // AI response
    const generateAiResponseMutation = trpc.ai.generateResponse.useMutation({
        onSuccess: () => {
            setMessage('')
            setIsLoading(false)
            // Invalidate queries to refresh messages and sessions
            utils.chat.getMessages.invalidate({sessionId: sessionId!})
            utils.chat.getSessions.invalidate()
            // Force refetch sessions to see title updates
            setTimeout(() => {
                utils.chat.getSessions.refetch()
            }, 1000)
        },
        onError: () => {
            toast.error('Failed to generate AI response')
            setMessage('')
            setIsLoading(false)
        }
    })

    //send message mutation
    const sendMessageMutation = trpc.chat.sendMessage.useMutation({
        onSuccess: (userMessage) => {
            // Invalidate messages to show the new user message immediately
            utils.chat.getMessages.invalidate({sessionId: sessionId!})
            // message sent success. get AI response
            generateAiResponseMutation.mutate({
                sessionId: sessionId!,
                userMessage: message
            })
        },
        onError: () => {
            toast.error("Failed to send message")
            setIsLoading(false)
        }
    })
    
    const messages = messageData?.messages ?? []
    console.log("messages", messages)
    
    //scroll to bottom
    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
        }
    }

    useEffect(()=>{
        scrollToBottom()
    },[messages])

    const handleSendMessage = async()=>{
        if(!message.trim() || !sessionId || isLoading) return
        setIsLoading(true)
        sendMessageMutation.mutate({
            sessionId,
            content: message.trim()
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
        }
    }
  
    if(!sessionId){
        return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
            Welcome to CareerWise AI
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Get personalized career guidance and advice from our AI counselor. 
            Start a new conversation to begin.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>💼 Career planning and transitions</p>
            <p>📊 Skills assessment and development</p>
            <p>🎯 Interview preparation</p>
            <p>📈 Professional growth strategies</p>
          </div>
        </div>
      </div>
    )
    }
    return(
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden">
            {/* messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto scrollbar-macos">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {isLoadingMessages ? (
                        <div className="space-y-6">
                            {Array.from({length: 3}).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex gap-4 justify-start">
                                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">Start your career conversation</h3>
                        <p className="text-gray-500">Ask me anything about your career path, job search, or professional development.</p>
                        </div>
                        ): (
                        messages.map((msg)=>(
                            <div
                            key={msg.id}
                            className={`flex gap-4 ${ msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`
                            }>
                                {/* bot icon */}
                                {msg.role === 'assistant' && (
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                    <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                )}
                                
                                <div
                                 className={`
                                    max-w-[70%] px-4 py-3 rounded-lg
                                    ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white ml-auto'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                    }
                                `}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className={`text-xs ${
                                        msg.role === 'user' 
                                            ? 'text-blue-100' 
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                        </span>
                                    </div>
                                </div>
                                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-100">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                            </div>
                        ))
                    )}

                    {/* Thinking indicator - only show when loading */}
                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                    <Bot className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg max-w-[70%]">
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Thinking...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </ScrollArea>
            <div className="border-t p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about your career goals, job search strategies, interview tips, or anything else..."
              className="pr-12 min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              size="sm"
              className="absolute right-2 bottom-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
        </div>
    )
}