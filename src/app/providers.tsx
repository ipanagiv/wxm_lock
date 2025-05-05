'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { http } from 'viem'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css'

const config = getDefaultConfig({
  appName: 'WXM Lock',
  projectId: 'a830791decc3dc5a13ee339cccfb30ab',
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 