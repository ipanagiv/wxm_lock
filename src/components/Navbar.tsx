'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">WXM Lock</h1>
        </div>
        <div className="flex items-center space-x-4">
          {mounted && <ConnectButton />}
        </div>
      </div>
    </nav>
  )
} 