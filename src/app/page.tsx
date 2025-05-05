import { Navbar } from '@/components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome to WXM Lock</h2>
        <p className="text-muted-foreground">
          Lock and unlock your WXM tokens with ease.
        </p>
      </main>
    </div>
  )
} 