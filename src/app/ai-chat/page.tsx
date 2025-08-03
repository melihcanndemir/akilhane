import AiChatClient from "@/components/ai/ai-chat-client";
import MobileNav from "@/components/mobile-nav";

export default function AiChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MobileNav />
      <main className="flex-1">
        <AiChatClient />
      </main>
    </div>
  );
}
