'use client'
import { useState } from "react";
import { ChatArea } from "./chat-area";
import { Sidebar } from "./sidebar";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

export function ChatLayout() {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

    return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
        {isSidebarOpen && (
            <div className="bg-black/20 fixed inset-0 backdrop-blur-sm z-40 md:hidden"
            onClick={()=> setIsSidebarOpen(false)}
            />
        )}
    <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-80 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <Sidebar
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            onCloseSlider={()=>setIsSidebarOpen(false)}
        />
    </div>
    {/* Main chat area */}
    <div className="flex-1 flex flex-col min-w-0 h-screen">
        <div className="md:hidden flex items-center p-4 border-b">
            <Button
            variant={"ghost"}
            size={"sm"}
            onClick={()=> setIsSidebarOpen(true)}
            >
                <Menu className="h-4 w-4"/>
            </Button>
        <h1 className="ml-2 font-semibold">CareerGenie AI</h1>

        </div>
        <ChatArea sessionId={selectedSessionId}/>
    </div>
    </div>

    )

}