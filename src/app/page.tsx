import { AuthGuard } from "@/components/auth/auth-guard";
import { ChatLayout } from "@/components/chat/chat-layout";

export default function Home() {
  return (
   <AuthGuard>
      <ChatLayout/>
   </AuthGuard>
  );
}
