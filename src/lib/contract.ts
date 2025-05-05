import { mainnet, sepolia } from 'wagmi/chains'

export const contract = {
  address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  abi: [
    {
      inputs: [],
      name: 'totalLocked',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'unlockDelay',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'token',
      outputs: [{ name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ name: 'user', type: 'address' }],
      name: 'getLocks',
      outputs: [
        {
          components: [
            { name: 'amount', type: 'uint256' },
            { name: 'unlockTime', type: 'uint256' },
            { name: 'isUnlocking', type: 'bool' },
          ],
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'amount', type: 'uint256' },
        { name: 'lockTime', type: 'uint256' },
      ],
      name: 'lock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'lockIndex', type: 'uint256' }],
      name: 'initiateUnlock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'lockIndex', type: 'uint256' }],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  chainId: sepolia.id,
} as const

// Replace with your contract address
export const contractAddress = {
  [mainnet.id]: 'YOUR_MAINNET_CONTRACT_ADDRESS',
  [sepolia.id]: '0xc29DB8E4F3606e4b2DFcCA39e73eC231114dFF96',
} as const

export const contractConfig = {
  address: contractAddress[sepolia.id] as `0x${string}`,
  abi: contract.abi,
} as const 