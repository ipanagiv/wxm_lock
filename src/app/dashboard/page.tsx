'use client'

import { useAccount, useBlockNumber } from 'wagmi'
import { Navbar } from '@/components/Navbar'
import { useLocks } from '@/hooks/useLocks'
import { formatEther } from 'ethers'
import { useState } from 'react'

interface Lock {
  id: number
  amount: bigint
  lockTime: bigint
  unlockTime: bigint
  withdrawn: boolean
}

interface Transaction {
  hash: string
  to?: string
  status: string
  blockNumber?: number
}

export default function Dashboard() {
  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber()
  const { locks, isLoading, initiateUnlock, withdraw, totalLocked, unlockDelay, tokenAddress, error } = useLocks()
  const [pendingTx, setPendingTx] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const handleInitiateUnlock = async (lockId: number) => {
    try {
      setPendingTx('initiateUnlock')
      await initiateUnlock(lockId)
    } finally {
      setPendingTx(null)
    }
  }

  const handleWithdraw = async (lockId: number) => {
    try {
      setPendingTx('withdraw')
      await withdraw(lockId)
    } finally {
      setPendingTx(null)
    }
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeRemaining = (unlockTime: bigint) => {
    if (unlockTime === BigInt(0)) return null
    const now = Math.floor(Date.now() / 1000)
    const remaining = Number(unlockTime) - now
    if (remaining <= 0) return 'Ready to withdraw'
    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m remaining`
  }

  const formatDelay = (delay: bigint) => {
    const days = Number(delay) / 86400
    return `${days} days`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Your Locked Tokens
          </h2>
          {address && (
            <div className="text-sm text-gray-500">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {address ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              <div className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Contract Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Total Locked: {formatEther(totalLocked || BigInt(0))} WXM</p>
                  <p>Unlock Delay: {unlockDelay ? formatDelay(unlockDelay) : 'Loading...'}</p>
                  <p>Token Address: {tokenAddress ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}` : 'Loading...'}</p>
                </div>
              </div>

              {isLoading ? (
                <div className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : locks?.length ? (
                locks.map((lock: Lock) => (
                  <div key={lock.id} className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Lock ID: {lock.id}</p>
                        {lock.withdrawn && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Withdrawn
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          {formatEther(lock.amount || BigInt(0))} WXM
                        </p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Locked: {formatDate(lock.lockTime || BigInt(0))}</p>
                          {lock.unlockTime > BigInt(0) && (
                            <>
                              <p>Unlock Time: {formatDate(lock.unlockTime)}</p>
                              <p className="text-blue-600 font-medium">
                                {getTimeRemaining(lock.unlockTime)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {!lock.withdrawn && (
                          <>
                            {lock.unlockTime === BigInt(0) ? (
                              <button
                                onClick={() => handleInitiateUnlock(lock.id)}
                                disabled={pendingTx === 'initiateUnlock'}
                                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {pendingTx === 'initiateUnlock' ? 'Processing...' : 'Initiate Unlock'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleWithdraw(lock.id)}
                                disabled={pendingTx === 'withdraw'}
                                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {pendingTx === 'withdraw' ? 'Processing...' : 'Withdraw'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-gray-500">No locked tokens found</p>
                </div>
              )}
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Recent Transactions</h3>
              {transactions.length > 0 ? (
                <div className="rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hash</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx: Transaction) => (
                        <tr key={tx.hash} className="border-t border-white/20 hover:bg-white/20 transition-colors">
                          <td className="px-6 py-4">
                            <a
                              href={`https://etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {tx.to?.toLowerCase() === 'YOUR_CONTRACT_ADDRESS'.toLowerCase()
                              ? 'Lock/Unlock'
                              : 'Other'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                tx.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {blockNumber && tx.blockNumber
                              ? Number(blockNumber) - tx.blockNumber
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No recent transactions</p>
              )}
            </div>

            {blockNumber && (
              <div className="mt-8 text-sm text-gray-500">
                Current block: {blockNumber.toString()}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Please connect your wallet to view your locked tokens</p>
          </div>
        )}
      </main>
    </div>
  )
} 