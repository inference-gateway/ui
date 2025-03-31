"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CodeBlock({
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return !inline ? (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 rounded-t-md">
        <span className="text-xs text-neutral-400">{match?.[1] || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200"
        >
          <Copy className="w-3 h-3" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={match?.[1] || "text"}
        style={atomDark}
        PreTag="div"
        className="rounded-b-md"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
}
