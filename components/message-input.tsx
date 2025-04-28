'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  value: string;
  onChangeAction: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDownAction: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

export default function MessageInput({
  value,
  onChangeAction,
  onKeyDownAction,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 38), 200);
      textareaRef.current.style.height = `${newHeight}px`;

      const lineCount = value.split('\n').length;
      setRows(Math.min(Math.max(lineCount, 1), 5));
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChangeAction}
      onKeyDown={onKeyDownAction}
      placeholder={placeholder}
      rows={rows}
      className="resize-none min-h-[38px] max-h-[200px] flex-1"
    />
  );
}
