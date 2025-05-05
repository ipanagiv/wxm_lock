'use client'

import { useAccount } from 'wagmi'
import { useReadContract, useWriteContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { formatEther, parseEther } from 'viem'
import { contract } from '@/lib/contract'
import { useState } from 'react'

interface Lock {
  amount: bigint
  unlockTime: bigint
  isUnlocking: boolean
}

export function useLocks() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [lockTime, setLockTime] = useState('')

  // Read contract data
  const { data: totalLocked, isLoading: isLoadingTotal } = useReadContract({
    ...contract,
    functionName: 'totalLocked',
  })

  const { data: unlockDelay, isLoading: isLoadingDelay } = useReadContract({
    ...contract,
    functionName: 'unlockDelay',
  })

  const { data: tokenAddress, isLoading: isLoadingToken } = useReadContract({
    ...contract,
    functionName: 'token',
  })

  const { data: userLocks, isLoading: isLoadingLocks } = useReadContract({
    ...contract,
    functionName: 'getLocks',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      select: (data) => {
        if (!data) return []
        return data.map((lock: Lock) => ({
          amount: formatEther(lock.amount),
          unlockTime: Number(lock.unlockTime) * 1000,
          isUnlocking: lock.isUnlocking,
        }))
      },
    },
  })

  // Write contract functions
  const { writeContract: lock, isPending: isLocking } = useWriteContract()
  const { writeContract: initiateUnlock, isPending: isInitiatingUnlock } = useWriteContract()
  const { writeContract: withdraw, isPending: isWithdrawing } = useWriteContract()

  const handleLock = async () => {
    if (!amount || !lockTime) return
    try {
      await lock({
        ...contract,
        functionName: 'lock',
        args: [parseEther(amount), BigInt(lockTime)],
      })
      setAmount('')
      setLockTime('')
    } catch (error) {
      console.error('Error locking tokens:', error)
    }
  }

  const handleInitiateUnlock = async (lockIndex: number) => {
    try {
      await initiateUnlock({
        ...contract,
        functionName: 'initiateUnlock',
        args: [BigInt(lockIndex)],
      })
    } catch (error) {
      console.error('Error initiating unlock:', error)
    }
  }

  const handleWithdraw = async (lockIndex: number) => {
    try {
      await withdraw({
        ...contract,
        functionName: 'withdraw',
        args: [BigInt(lockIndex)],
      })
    } catch (error) {
      console.error('Error withdrawing tokens:', error)
    }
  }

  return {
    amount,
    setAmount,
    lockTime,
    setLockTime,
    totalLocked: totalLocked ? formatEther(totalLocked) : '0',
    unlockDelay: unlockDelay ? Number(unlockDelay) : 0,
    tokenAddress,
    userLocks: userLocks || [],
    isLoading: isLoadingTotal || isLoadingDelay || isLoadingToken || isLoadingLocks,
    handleLock,
    handleInitiateUnlock,
    handleWithdraw,
    isLocking,
    isInitiatingUnlock,
    isWithdrawing,
  }
} 