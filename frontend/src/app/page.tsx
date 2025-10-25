import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cross-Chain AI Wallet Agent
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Autonomous portfolio management powered by Avail Nexus, Lit Protocol, and Envio
        </p>
      </div>
      
      <Dashboard />
    </main>
  )
}