'use client'

import { useAccount } from 'wagmi'
import { useReadContract, useWriteContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { formatEther, parseEther } from 'viem'
import { contract, WXM_TOKEN } from '@/lib/contract'
import { useState, useEffect } from 'react'
import { useChainId } from 'wagmi'
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'wagmi/chains'

type ChainId = typeof mainnet.id | typeof sepolia.id | typeof arbitrum.id | typeof arbitrumSepolia.id

interface Lock {
  amount: bigint
  lockTime: bigint
  unlockTime: bigint
  withdrawn: boolean
}

type LockResult = [bigint, bigint, bigint, boolean]

export function useLocks() {
  const { address } = useAccount()
  const chainId = useChainId() as ChainId
  const [amount, setAmount] = useState('')
  const [lockCount, setLockCount] = useState<number>(0)
  const [locks, setLocks] = useState<Lock[]>([])

  // Read contract data
  const { data: totalLocked, isLoading: isLoadingTotal } = useReadContract({
    ...contract,
    functionName: 'totalLocked',
  })

  const { data: unlockDelay, isLoading: isLoadingDelay } = useReadContract({
    ...contract,
    functionName: 'UNLOCK_DELAY',
  })

  const { data: tokenAddress, isLoading: isLoadingToken } = useReadContract({
    ...contract,
    functionName: 'token',
  })

  // Get token balance
  const { data: tokenBalance, isLoading: isLoadingBalance } = useReadContract({
    address: WXM_TOKEN[chainId] as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  // Get lock count for the user
  const { data: userLockCount, isLoading: isLoadingLockCount } = useReadContract({
    ...contract,
    functionName: 'getLockCount',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  // Fetch all locks for the user
  useEffect(() => {
    const fetchLocks = async () => {
      if (!address || !userLockCount) return

      const lockPromises = Array.from({ length: Number(userLockCount) }, (_, i) =>
        useReadContract({
          ...contract,
          functionName: 'getLock',
          args: [address as `0x${string}`, BigInt(i)],
        }).data
      )

      const lockResults = await Promise.all(lockPromises)
      const validLocks = lockResults
        .filter((result): result is LockResult => result !== undefined)
        .map(([amount, lockTime, unlockTime, withdrawn]) => ({
          amount,
          lockTime,
          unlockTime,
          withdrawn,
        }))
      setLocks(validLocks)
    }

    fetchLocks()
  }, [address, userLockCount])

  // Write contract functions
  const { writeContract: lock, isPending: isLocking } = useWriteContract()
  const { writeContract: initiateUnlock, isPending: isInitiatingUnlock } = useWriteContract()
  const { writeContract: withdraw, isPending: isWithdrawing } = useWriteContract()

  const handleLock = async () => {
    if (!amount) return
    try {
      await lock({
        ...contract,
        functionName: 'lock',
        args: [parseEther(amount)],
      })
      setAmount('')
    } catch (error) {
      console.error('Error locking tokens:', error)
    }
  }

  const handleInitiateUnlock = async (lockId: number) => {
    try {
      await initiateUnlock({
        ...contract,
        functionName: 'initiateUnlock',
        args: [BigInt(lockId)],
      })
    } catch (error) {
      console.error('Error initiating unlock:', error)
    }
  }

  const handleWithdraw = async (lockId: number) => {
    try {
      await withdraw({
        ...contract,
        functionName: 'withdraw',
        args: [BigInt(lockId)],
      })
    } catch (error) {
      console.error('Error withdrawing tokens:', error)
    }
  }

  return {
    amount,
    setAmount,
    totalLocked: totalLocked ? formatEther(totalLocked) : '0',
    unlockDelay: unlockDelay ? Number(unlockDelay) : 0,
    tokenAddress,
    tokenBalance: tokenBalance ? formatEther(tokenBalance) : '0',
    userLocks: locks.map((lock, index) => ({
      amount: formatEther(lock.amount),
      lockTime: Number(lock.lockTime) * 1000,
      unlockTime: Number(lock.unlockTime) * 1000,
      isUnlocking: Number(lock.unlockTime) > 0,
      withdrawn: lock.withdrawn,
    })),
    isLoading: isLoadingTotal || isLoadingDelay || isLoadingToken || isLoadingLockCount || isLoadingBalance,
    handleLock,
    handleInitiateUnlock,
    handleWithdraw,
    isLocking,
    isInitiatingUnlock,
    isWithdrawing,
  }
} 