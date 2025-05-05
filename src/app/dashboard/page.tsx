'use client'

import { useAccount } from 'wagmi'
import { Navbar } from '@/components/Navbar'
import { useBlockNumber, useTransactionHistory } from 'wagmi'

export default function Dashboard() {
  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber()
  const { data: transactions } = useTransactionHistory({
    address,
    limit: 10,
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Your Locked Tokens</h2>
        {address ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {/* Lock cards will be rendered here */}
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">No locked tokens found</p>
              </div>
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