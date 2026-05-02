import { useState } from 'react'
import HVACServiceOrderInvoiceForm from './components/HVACServiceOrderInvoiceForm'
import HVACServiceProposalForm from './components/HVACServiceProposalForm'
import './index.css'

type FormMode = 'invoice' | 'proposal'

export interface CompanyConfig {
  name: string
  license: string
  address: string
  cityStateZip: string
  phones: string
  website: string
  email: string
}

const COMPANY: CompanyConfig = {
  name: 'SOUTHERN AIRE HEATING & COOLING, INC.',
  license: 'STATE CERTIFIED CAC182660 · LICENSED · INSURED',
  address: '1789 Canova St. SE #A',
  cityStateZip: 'Palm Bay, FL 32909',
  phones: 'Beaches: (321) 728-0277 · Mainland: (321) 728-0374 · Fax: (321) 728-8114',
  website: 'www.southernaireheatingflorida.com',
  email: 'myler2e@aol.com',
}

export default function App() {
  const [formMode, setFormMode] = useState<FormMode>('invoice')

  return (
    <>
      <div className="no-print fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 flex items-center rounded-full shadow-lg border border-gray-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setFormMode('invoice')}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors ${
            formMode === 'invoice' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Invoice
        </button>
        <button
          type="button"
          onClick={() => setFormMode('proposal')}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors ${
            formMode === 'proposal' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Proposal
        </button>
      </div>

      {formMode === 'invoice'
        ? <HVACServiceOrderInvoiceForm company={COMPANY} />
        : <HVACServiceProposalForm company={COMPANY} />
      }
    </>
  )
}
