'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { http } from 'viem'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css'
import { useState, useEffect } from 'react'

const config = getDefaultConfig({
  appName: 'WXM Lock',
  projectId: 'a830791decc3dc5a13ee339cccfb30ab',
  chains: [mainnet, sepolia, arbitrum, arbitrumSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted && (
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        )}
        {!mounted && children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 