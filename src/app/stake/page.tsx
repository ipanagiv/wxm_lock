'use client'

import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { Navbar } from '@/components/Navbar'

type FormData = {
  amount: string
}

export default function Stake() {
  const { address } = useAccount()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    // TODO: Implement lock function
    console.log(data)
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
                {...register('amount', { required: 'Amount is required' })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Lock Tokens
            </button>
          </form>
        ) : (
          <p className="text-muted-foreground">Please connect your wallet to lock tokens</p>
        )}
      </main>
    </div>
  )
} 