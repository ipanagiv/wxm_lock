import { useAccount } from 'wagmi'
import { useReadContract, useWriteContract } from 'wagmi'
import { contractConfig } from '@/lib/contract'
import { useQuery } from '@tanstack/react-query'

export function useLocks() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  const { data: lockCount } = useReadContract({
    ...contractConfig,
    functionName: 'getLockCount',
    args: [address!],
    query: {
      enabled: !!address,
    },
  })

  const { data: locks, isLoading } = useQuery({
    queryKey: ['locks', address, lockCount],
    queryFn: async () => {
      if (!address || !lockCount) return []
      
      const locks = await Promise.all(
        Array.from({ length: Number(lockCount) }, (_, i) =>
          useReadContract({
            ...contractConfig,
            functionName: 'getLock',
            args: [address, BigInt(i)],
          }).then(({ data }) => {
            if (!data) return null
            const [amount, lockTime, unlockTime, withdrawn] = data
            return {
              id: i,
              amount,
              lockTime,
              unlockTime,
              withdrawn,
            }
          })
        )
      )
      return locks.filter(Boolean)
    },
    enabled: !!address && !!lockCount,
  })

  const initiateUnlock = async (lockId: number) => {
    return writeContract({
      ...contractConfig,
      functionName: 'initiateUnlock',
      args: [BigInt(lockId)],
    })
  }

  const withdraw = async (lockId: number) => {
    return writeContract({
      ...contractConfig,
      functionName: 'withdraw',
      args: [BigInt(lockId)],
    })
  }

  return {
    locks,
    isLoading,
    initiateUnlock,
    withdraw,
  }
} 