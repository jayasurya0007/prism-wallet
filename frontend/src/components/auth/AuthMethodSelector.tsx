'use client'

export default function AuthMethodSelector() {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="text-yellow-800 text-sm font-medium mb-2">
        Authentication Methods Disabled
      </div>
      <div className="text-yellow-700 text-sm">
        Mock authentication methods removed per rules.md compliance.
        Use "Load My PKP" button above to load your existing PKP.
      </div>
    </div>
  )
}