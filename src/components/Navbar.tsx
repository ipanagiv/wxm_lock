'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">WXM Lock</h1>
        </div>
        <div className="flex items-center space-x-4">
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
} 