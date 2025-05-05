'use client'

import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { Navbar } from '@/components/Navbar'
import { contractConfig } from '@/lib/contract'
import { useWriteContract } from 'wagmi'
import { parseEther } from 'ethers'
import { useState } from 'react'

type FormData = {
  amount: string
  lockTime: string
}

export default function Stake() {
  const { address } = useAccount()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()
  const { writeContract } = useWriteContract()
  const [isPending, setIsPending] = useState(false)

  const onSubmit = async (data: FormData) => {
    try {
      setIsPending(true)
      await writeContract({
        ...contractConfig,
        functionName: 'lock',
        args: [parseEther(data.amount), BigInt(data.lockTime)],
      })
      reset()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Lock Tokens</h2>
        {address ? (
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">
                Amount
              </label>
              <input
                type="text"
                id="amount"
                {...register('amount', { 
                  required: 'Amount is required',
                  pattern: {
                    value: /^\d*\.?\d*$/,
                    message: 'Please enter a valid number'
                  }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="lockTime" className="block text-sm font-medium mb-1">
                Lock Time (in seconds)
              </label>
              <input
                type="number"
                id="lockTime"
                {...register('lockTime', { 
                  required: 'Lock time is required',
                  min: {
                    value: 1,
                    message: 'Lock time must be at least 1 second'
                  }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter lock time in seconds"
              />
              {errors.lockTime && (
                <p className="mt-1 text-sm text-red-500">{errors.lockTime.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? 'Processing...' : 'Lock Tokens'}
            </button>
          </form>
        ) : (
          <p className="text-muted-foreground">Please connect your wallet to lock tokens</p>
        )}
      </main>
    </div>
  )
} 