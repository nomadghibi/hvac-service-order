import { useState } from 'react'
import HVACServiceOrderInvoiceForm from './components/HVACServiceOrderInvoiceForm'
import HVACServiceProposalForm from './components/HVACServiceProposalForm'
import './index.css'

type FormMode = 'invoice' | 'proposal'

export default function App() {
  const [mode, setMode] = useState<FormMode>('invoice')

  return (
    <>
      {/* Mode switcher — hidden on print */}
      <div className="no-print fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 flex rounded-full shadow-lg border border-gray-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setMode('invoice')}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors ${
            mode === 'invoice'
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Invoice
        </button>
        <button
          type="button"
          onClick={() => setMode('proposal')}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors ${
            mode === 'proposal'
              ? 'bg-green-600 text-white'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Proposal
        </button>
      </div>

      {mode === 'invoice' ? <HVACServiceOrderInvoiceForm /> : <HVACServiceProposalForm />}
    </>
  )
}
