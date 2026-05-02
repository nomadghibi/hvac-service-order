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

const COMPANY_KEY = 'hvac-company-config'

const emptyCompany = (): CompanyConfig => ({
  name: '',
  license: '',
  address: '',
  cityStateZip: '',
  phones: '',
  website: '',
  email: '',
})

const loadCompany = (): CompanyConfig | null => {
  try {
    const raw = localStorage.getItem(COMPANY_KEY)
    if (raw) return JSON.parse(raw) as CompanyConfig
  } catch {}
  return null
}

const saveCompany = (c: CompanyConfig) => {
  try { localStorage.setItem(COMPANY_KEY, JSON.stringify(c)) } catch {}
}

// ─── Company Setup / Edit Modal ───────────────────────────────────────────────

function CompanyModal({
  initial,
  onSave,
  isFirstRun,
}: {
  initial: CompanyConfig
  onSave: (c: CompanyConfig) => void
  isFirstRun: boolean
}) {
  const [draft, setDraft] = useState<CompanyConfig>(initial)
  const [error, setError] = useState('')

  const set = (k: keyof CompanyConfig, v: string) =>
    setDraft((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!draft.name.trim()) { setError('Company name is required.'); return }
    saveCompany(draft)
    onSave(draft)
  }

  const FIELD = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
  const LBL = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isFirstRun ? 'Set Up Your Company' : 'Company Settings'}
          </h2>
          {isFirstRun && (
            <p className="text-sm text-gray-500 mt-1">Enter your company details — shown on every form.</p>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={LBL}>Company Name *</label>
            <input className={FIELD} value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Acme HVAC, Inc." />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div>
            <label className={LBL}>License / Certifications</label>
            <input className={FIELD} value={draft.license} onChange={(e) => set('license', e.target.value)} placeholder="e.g. STATE CERTIFIED CAC182660 · LICENSED · INSURED" />
          </div>
          <div>
            <label className={LBL}>Street Address</label>
            <input className={FIELD} value={draft.address} onChange={(e) => set('address', e.target.value)} placeholder="123 Main St, Suite A" />
          </div>
          <div>
            <label className={LBL}>City / State / ZIP</label>
            <input className={FIELD} value={draft.cityStateZip} onChange={(e) => set('cityStateZip', e.target.value)} placeholder="Palm Bay, FL 32909" />
          </div>
          <div>
            <label className={LBL}>Phone / Fax</label>
            <input className={FIELD} value={draft.phones} onChange={(e) => set('phones', e.target.value)} placeholder="(321) 555-0100 · Fax: (321) 555-0101" />
          </div>
          <div>
            <label className={LBL}>Website</label>
            <input className={FIELD} value={draft.website} onChange={(e) => set('website', e.target.value)} placeholder="www.yourcompany.com" />
          </div>
          <div>
            <label className={LBL}>Email</label>
            <input type="email" className={FIELD} value={draft.email} onChange={(e) => set('email', e.target.value)} placeholder="info@yourcompany.com" />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          {!isFirstRun && (
            <button type="button" onClick={() => onSave(initial)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          )}
          <button type="button" onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<FormMode>('invoice')
  const [company, setCompany] = useState<CompanyConfig | null>(loadCompany)
  const [editingCompany, setEditingCompany] = useState(false)

  const handleCompanySave = (c: CompanyConfig) => {
    setCompany(c)
    setEditingCompany(false)
  }

  return (
    <>
      {/* First-run setup */}
      {!company && (
        <CompanyModal initial={emptyCompany()} onSave={handleCompanySave} isFirstRun />
      )}

      {/* Edit company modal */}
      {editingCompany && company && (
        <CompanyModal initial={company} onSave={handleCompanySave} isFirstRun={false} />
      )}

      {company && (
        <>
          {/* Mode switcher + gear */}
          <div className="no-print fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 flex items-center rounded-full shadow-lg border border-gray-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('invoice')}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors ${
                mode === 'invoice' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Invoice
            </button>
            <button
              type="button"
              onClick={() => setMode('proposal')}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors ${
                mode === 'proposal' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Proposal
            </button>
            <button
              type="button"
              onClick={() => setEditingCompany(true)}
              title="Company settings"
              className="px-3 py-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {mode === 'invoice'
            ? <HVACServiceOrderInvoiceForm company={company} />
            : <HVACServiceProposalForm company={company} />
          }
        </>
      )}
    </>
  )
}
