# WXM Lock

A web application for locking and unlocking WXM tokens.

## Features

- Connect wallet using RainbowKit
- View locked tokens in dashboard
- Lock new tokens
- Unlock tokens after lock period
- Withdraw unlocked tokens

## Tech Stack

- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- wagmi + RainbowKit
- ethers.js
- React Query
- react-hook-form

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and contract interactions

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests 