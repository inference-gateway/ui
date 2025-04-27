import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { CodeBlock } from './code-block';

interface RequestBubbleProps {
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string | Record<string, unknown>;
  };
}

export default function RequestBubble({ request }: RequestBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  if (!request) {
    return null;
  }

  const generateCurlCommand = () => {
    const { method, url, headers = {}, body } = request;

    let curlCommand = `curl -X ${method} '${url}'`;

    Object.entries(headers).forEach(([key, value]) => {
      curlCommand += `\\\n  -H '${key}: ${value}'`;
    });

    if (body) {
      const bodyJson = typeof body === 'string' ? body : JSON.stringify(body, null, 2);

      const escapedBody = bodyJson.replace(/'/g, "'\\''");

      curlCommand += `\\\n  -d '${escapedBody}'`;
    }

    return curlCommand;
  };

  const curlCommand = generateCurlCommand();

  return (
    <div className="w-full relative mb-0.5">
      <div className="flex flex-col">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[hsl(var(--thinking-bubble-bg))] border border-[hsl(var(--thinking-bubble-border))] hover:bg-[hsl(var(--thinking-bubble-hover-bg))] transition-colors duration-200 text-[hsl(var(--thinking-bubble-text))] z-10"
        >
          <Terminal className="h-3 w-3" />
          <span>Request (cURL)</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex items-start gap-4 rounded-lg p-4 mt-1 mb-1 bg-[hsl(var(--thinking-bubble-content-bg))] border border-[hsl(var(--thinking-bubble-content-border))] shadow-sm transition-all overflow-x-auto">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="overflow-x-auto">
              <CodeBlock className="language-bash">{curlCommand}</CodeBlock>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
