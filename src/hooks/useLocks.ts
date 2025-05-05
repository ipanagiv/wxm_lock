'use client'

import { useContractRead, useContractWrite, useAccount } from 'wagmi'
import { contractConfig } from '@/lib/contract'
import { useState } from 'react'

interface Lock {
  id: number
  amount: bigint
  lockTime: bigint
  unlockTime: bigint
  withdrawn: boolean
}

export function useLocks() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  const { data: lockCount = BigInt(0) } = useContractRead({
    ...contractConfig,
    functionName: 'getLockCount',
    args: [address as `0x${string}`],
    enabled: !!address,
  })

  const { data: locks = [] } = useContractRead({
    ...contractConfig,
    functionName: 'getLock',
    args: [address as `0x${string}`, BigInt(0)],
    enabled: !!address && lockCount > BigInt(0),
  })

  const { writeAsync: initiateUnlock } = useContractWrite({
    ...contractConfig,
    functionName: 'initiateUnlock',
  })

  const { writeAsync: withdraw } = useContractWrite({
    ...contractConfig,
    functionName: 'withdraw',
  })

  return {
    locks: locks ? [{
      id: 0,
      amount: locks[0],
      lockTime: locks[1],
      unlockTime: locks[2],
      withdrawn: locks[3],
    }] : [],
    isLoading,
    initiateUnlock: async (lockId: number) => {
      try {
        setIsLoading(true)
        await initiateUnlock({ args: [BigInt(lockId)] })
      } finally {
        setIsLoading(false)
      }
    },
    withdraw: async (lockId: number) => {
      try {
        setIsLoading(true)
        await withdraw({ args: [BigInt(lockId)] })
      } finally {
        setIsLoading(false)
      }
    },
  }
} 