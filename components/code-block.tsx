'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return !inline ? (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-2 bg-[hsl(var(--code-block-header-bg))] rounded-t-md">
        <span className="text-xs text-[hsl(var(--code-block-language-text))]">
          {match?.[1] || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-[hsl(var(--code-block-copy-text))] hover:text-[hsl(var(--code-block-copy-hover-text))]"
        >
          <Copy className="w-3 h-3" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={match?.[1] || 'text'}
        style={dark}
        PreTag="div"
        className="rounded-b-md"
        data-testid="code-block"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
}
