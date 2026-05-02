import { useState } from 'react'
import HVACServiceOrderInvoiceForm from './components/HVACServiceOrderInvoiceForm'
import HVACServiceProposalForm from './components/HVACServiceProposalForm'
import './index.css'

type FormMode = 'invoice' | 'proposal'
type AppMode = 'southern-aire' | 'custom' | null

export interface CompanyConfig {
  name: string
  license: string
  address: string
  cityStateZip: string
  phones: string
  website: string
  email: string
}

// ─── Southern Aire hardcoded company ─────────────────────────────────────────

const SOUTHERN_AIRE: CompanyConfig = {
  name: 'SOUTHERN AIRE HEATING & COOLING, INC.',
  license: 'STATE CERTIFIED CAC182660 · LICENSED · INSURED',
  address: '1789 Canova St. SE #A',
  cityStateZip: 'Palm Bay, FL 32909',
  phones: 'Beaches: (321) 728-0277 · Mainland: (321) 728-0374 · Fax: (321) 728-8114',
  website: 'www.southernaireheatingflorida.com',
  email: 'myler2e@aol.com',
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const APP_MODE_KEY = 'hvac-app-mode'
const COMPANY_KEY = 'hvac-company-config'

const loadAppMode = (): AppMode => {
  try {
    const v = localStorage.getItem(APP_MODE_KEY)
    if (v === 'southern-aire' || v === 'custom') return v
  } catch {}
  return null
}

const saveAppMode = (m: AppMode) => {
  try { if (m) localStorage.setItem(APP_MODE_KEY, m) } catch {}
}

const loadCustomCompany = (): CompanyConfig | null => {
  try {
    const raw = localStorage.getItem(COMPANY_KEY)
    if (raw) return JSON.parse(raw) as CompanyConfig
  } catch {}
  return null
}

const saveCustomCompany = (c: CompanyConfig) => {
  try { localStorage.setItem(COMPANY_KEY, JSON.stringify(c)) } catch {}
}

const emptyCompany = (): CompanyConfig => ({
  name: '', license: '', address: '', cityStateZip: '', phones: '', website: '', email: '',
})

// ─── Company Setup / Edit Modal ───────────────────────────────────────────────

function CompanyModal({
  initial,
  onSave,
  onCancel,
  isFirstRun,
}: {
  initial: CompanyConfig
  onSave: (c: CompanyConfig) => void
  onCancel?: () => void
  isFirstRun: boolean
}) {
  const [draft, setDraft] = useState<CompanyConfig>(initial)
  const [error, setError] = useState('')

  const set = (k: keyof CompanyConfig, v: string) => setDraft((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!draft.name.trim()) { setError('Company name is required.'); return }
    saveCustomCompany(draft)
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
            <input className={FIELD} value={draft.license} onChange={(e) => set('license', e.target.value)} placeholder="STATE CERTIFIED · LICENSED · INSURED" />
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
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
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

// ─── App Mode Picker ──────────────────────────────────────────────────────────

function AppModePicker({ onPick }: { onPick: (m: 'southern-aire' | 'custom') => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">HVAC Service Forms</h1>
          <p className="text-sm text-gray-500 mt-2">Select your company to get started</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onPick('southern-aire')}
            className="w-full bg-white border-2 border-blue-200 hover:border-blue-500 rounded-2xl p-5 text-left transition-colors group"
          >
            <p className="font-extrabold text-blue-700 text-base leading-tight">Southern Aire Heating &amp; Cooling, Inc.</p>
            <p className="text-xs text-gray-400 mt-1">Palm Bay, FL · CAC182660</p>
          </button>

          <button
            type="button"
            onClick={() => onPick('custom')}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-400 rounded-2xl p-5 text-left transition-colors"
          >
            <p className="font-bold text-gray-700 text-base">Other Company</p>
            <p className="text-xs text-gray-400 mt-1">Enter your own company details</p>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(loadAppMode)
  const [formMode, setFormMode] = useState<FormMode>('invoice')
  const [customCompany, setCustomCompany] = useState<CompanyConfig | null>(loadCustomCompany)
  const [editingCompany, setEditingCompany] = useState(false)

  const handleModePick = (m: 'southern-aire' | 'custom') => {
    saveAppMode(m)
    setAppMode(m)
  }

  const handleCompanySave = (c: CompanyConfig) => {
    setCustomCompany(c)
    setEditingCompany(false)
  }

  const company = appMode === 'southern-aire' ? SOUTHERN_AIRE : customCompany

  // First run: pick company
  if (!appMode) return <AppModePicker onPick={handleModePick} />

  // Custom mode but no company entered yet
  if (appMode === 'custom' && !customCompany) {
    return <CompanyModal initial={emptyCompany()} onSave={handleCompanySave} isFirstRun />
  }

  return (
    <>
      {editingCompany && appMode === 'custom' && customCompany && (
        <CompanyModal
          initial={customCompany}
          onSave={handleCompanySave}
          onCancel={() => setEditingCompany(false)}
          isFirstRun={false}
        />
      )}

      {/* Mode switcher */}
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
        {/* Switch company */}
        <button
          type="button"
          onClick={() => {
            if (appMode === 'custom') {
              setEditingCompany(true)
            } else {
              // Switch back to picker to change company
              localStorage.removeItem(APP_MODE_KEY)
              setAppMode(null)
            }
          }}
          title={appMode === 'custom' ? 'Company settings' : 'Switch company'}
          className="px-3 py-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {formMode === 'invoice'
        ? <HVACServiceOrderInvoiceForm company={company!} />
        : <HVACServiceProposalForm company={company!} />
      }
    </>
  )
}
