'use client'

import { useAccount } from 'wagmi'
import { Navbar } from '@/components/Navbar'
import { useBlockNumber, useTransactionHistory } from 'wagmi'
import { useLocks } from '@/hooks/useLocks'
import { formatEther } from 'ethers'
import { useState } from 'react'

export default function Dashboard() {
  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber()
  const { data: transactions } = useTransactionHistory({
    address,
    limit: 10,
  })
  const { locks, isLoading, initiateUnlock, withdraw } = useLocks()
  const [pendingTx, setPendingTx] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Your Locked Tokens</h2>
        {address ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {isLoading ? (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : locks?.length ? (
                locks.map((lock) => (
                  <div key={lock.id} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Lock ID: {lock.id}</p>
                      <p className="text-lg font-semibold">
                        {formatEther(lock.amount)} WXM
                      </p>
                      <p className="text-sm">
                        Locked: {new Date(Number(lock.lockTime) * 1000).toLocaleString()}
                      </p>
                      {lock.unlockTime > 0 && (
                        <p className="text-sm">
                          Unlock Time: {new Date(Number(lock.unlockTime) * 1000).toLocaleString()}
                        </p>
                      )}
                      <div className="flex gap-2 mt-4">
                        {!lock.withdrawn && (
                          <>
                            {lock.unlockTime === 0n ? (
                              <button
                                onClick={() => handleInitiateUnlock(lock.id)}
                                disabled={pendingTx === 'initiateUnlock'}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                              >
                                {pendingTx === 'initiateUnlock' ? 'Processing...' : 'Initiate Unlock'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleWithdraw(lock.id)}
                                disabled={pendingTx === 'withdraw'}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
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
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">No locked tokens found</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
              {transactions?.length ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Hash</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.hash} className="border-t">
                          <td className="px-4 py-2">
                            <a
                              href={`https://etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                            </a>
                          </td>
                          <td className="px-4 py-2">
                            {tx.to?.toLowerCase() === 'YOUR_CONTRACT_ADDRESS'.toLowerCase()
                              ? 'Lock/Unlock'
                              : 'Other'}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                tx.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {blockNumber && tx.blockNumber
                              ? blockNumber - tx.blockNumber
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No recent transactions</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Please connect your wallet to view your locked tokens</p>
        )}
      </main>
    </div>
  )
} 