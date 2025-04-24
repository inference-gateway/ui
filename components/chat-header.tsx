import { PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import ModelSelector from '@/components/model-selector';
import ThemeToggle from '@/components/theme-toggle';
import WelcomeMessage from '@/components/welcome-message';
import { Session } from 'next-auth';

interface ChatHeaderProps {
  session?: Session | null;
  isMobile: boolean;
  showSidebar: boolean;
  selectedModel: string;
  setShowSidebar: (show: boolean) => void;
  handleNewChat: () => void;
  setSelectedModel: (model: string) => void;
}

export function ChatHeader({
  session,
  isMobile,
  selectedModel,
  handleNewChat,
  setSelectedModel,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'border-b border-[hsl(var(--chat-sidebar-border))] bg-[hsl(var(--chat-background))] px-3.5 relative flex flex-col justify-center',
        isMobile ? 'py-3 h-auto min-h-[4.5rem]' : 'py-2 h-14'
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 ml-10 my-auto">
          <WelcomeMessage session={session} />
        </div>

        <div className="flex items-center gap-3 h-full my-auto">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>

          <button
            onClick={handleNewChat}
            className="text-muted-foreground hover:text-foreground flex items-center justify-center"
            aria-label="New chat"
          >
            <PlusSquare className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isMobile ? (
        <div className="w-full flex justify-center mt-2">
          <div className="w-full px-2 py-1 rounded-md border border-[hsla(var(--model-selector-border)_/_0.5)] hover:bg-[hsla(var(--model-selector-bg)_/_0.8)] transition-colors">
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModelAction={setSelectedModel}
              isMobile={true}
            />
          </div>
        </div>
      ) : (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="px-2 py-1 rounded-md border border-[hsla(var(--model-selector-border)_/_0.5)] hover:bg-[hsla(var(--model-selector-bg)_/_0.8)] transition-colors">
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModelAction={setSelectedModel}
              isMobile={false}
            />
          </div>
        </div>
      )}
    </header>
  );
}
