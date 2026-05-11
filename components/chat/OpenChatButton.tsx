'use client'

interface OpenChatButtonProps {
  className?: string
  children: React.ReactNode
}

export function OpenChatButton({ className, children }: OpenChatButtonProps) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
      className={className}
    >
      {children}
    </button>
  )
}
