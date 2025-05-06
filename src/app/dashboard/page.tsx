'use client'

import { useAccount, useBlockNumber } from 'wagmi'
import { Navbar } from '@/components/Navbar'
import { useLocks } from '@/hooks/useLocks'
import { formatEther } from 'ethers'
import { useState } from 'react'
import { contract } from '@/lib/contract'

interface Lock {
  amount: string
  lockTime: number
  unlockTime: number
  isUnlocking: boolean
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
  const {
    amount,
    setAmount,
    totalLocked,
    unlockDelay,
    tokenAddress,
    tokenBalance,
    userLocks,
    isLoading,
    handleInitiateUnlock,
    handleWithdraw,
    isInitiatingUnlock,
    isWithdrawing,
  } = useLocks()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeRemaining = (unlockTime: number) => {
    if (unlockTime === 0) return null
    const now = Date.now()
    const remaining = unlockTime - now
    if (remaining <= 0) return 'Ready to withdraw'
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return `${days}d ${hours}h ${minutes}m remaining`
  }

  const formatDelay = (delay: number) => {
    const days = delay / (60 * 60 * 24)
    return `${days} days`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 gradient-text">Lock Your WXM</h1>
            <p className="text-gray-400">Lock your WXM tokens to earn rewards</p>
          </div>

          {address ? (
            <>
              <div className="glass-card p-8 mb-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-4">Lock WXM</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.0"
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button className="gradient-button">Lock</button>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Balance: {isLoading ? 'Loading...' : `${tokenBalance} WXM`}</span>
                        <button 
                          onClick={() => setAmount(tokenBalance)}
                          disabled={isLoading || tokenBalance === '0'}
                          className="text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-4">Stats</h3>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between">
                        <span>Total Locked</span>
                        <span className="font-medium">{totalLocked} WXM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unlock Delay</span>
                        <span className="font-medium">{unlockDelay ? formatDelay(unlockDelay) : 'Loading...'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token Address</span>
                        <span className="font-medium">{tokenAddress ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}` : 'Loading...'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-6 gradient-text">Your Locks</h2>
              <div className="grid gap-6">
                {isLoading ? (
                  <div className="glass-card p-6 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  </div>
                ) : userLocks?.length ? (
                  userLocks.map((lock: Lock, index: number) => (
                    <div key={index} className="glass-card p-6 hover:bg-white/10 transition-colors">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-400">Lock ID: {index}</p>
                          {lock.isUnlocking && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-900/50 text-green-400 rounded-full">
                              Unlocking
                            </span>
                          )}
                          {lock.withdrawn && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-900/50 text-gray-400 rounded-full">
                              Withdrawn
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold gradient-text">
                            {lock.amount} WXM
                          </p>
                          <div className="text-sm text-gray-400 space-y-1">
                            <p>Lock Time: {formatDate(lock.lockTime)}</p>
                            {lock.unlockTime > 0 && (
                              <>
                                <p>Unlock Time: {formatDate(lock.unlockTime)}</p>
                                <p className="text-green-400 font-medium">
                                  {getTimeRemaining(lock.unlockTime)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {!lock.withdrawn && !lock.isUnlocking && (
                            <button
                              onClick={() => handleInitiateUnlock(index)}
                              disabled={isInitiatingUnlock}
                              className="gradient-button disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isInitiatingUnlock ? 'Processing...' : 'Initiate Unlock'}
                            </button>
                          )}
                          {lock.isUnlocking && !lock.withdrawn && (
                            <button
                              onClick={() => handleWithdraw(index)}
                              disabled={isWithdrawing}
                              className="gradient-button disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isWithdrawing ? 'Processing...' : 'Withdraw'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card p-6">
                    <p className="text-gray-400">No locked tokens found</p>
                  </div>
                )}
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 gradient-text">Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <div className="glass-card overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Hash</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Block</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx: Transaction) => (
                          <tr key={tx.hash} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <a
                                href={`https://etherscan.io/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 transition-colors"
                              >
                                {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                              </a>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {tx.to?.toLowerCase() === contract.address.toLowerCase()
                                ? 'Lock/Unlock'
                                : 'Other'}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  tx.status === 'success'
                                    ? 'bg-green-900/50 text-green-400'
                                    : 'bg-red-900/50 text-red-400'
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
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
                  <p className="text-gray-400">No recent transactions</p>
                )}
              </div>

              {blockNumber && (
                <div className="mt-8 text-sm text-gray-400">
                  Current block: {blockNumber.toString()}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Please connect your wallet to view your locked tokens</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 