"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"

interface MessageInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export default function MessageInput({ value, onChange, onKeyDown }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [rows, setRows] = useState(1)

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 38), 200)
      textareaRef.current.style.height = `${newHeight}px`

      // Update rows based on content
      const lineCount = value.split("\n").length
      setRows(Math.min(Math.max(lineCount, 1), 5))
    }
  }, [value])

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="Type a message..."
      rows={rows}
      className="resize-none min-h-[38px] max-h-[200px] flex-1"
    />
  )
}

