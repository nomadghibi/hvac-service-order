import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaterialRow {
  id: string
  qty: string
  description: string
  unitPrice: string
  amount: string
}

interface LaborRow {
  id: string
  hours: string
  description: string
  rate: string
  amount: string
}

interface EnvItem {
  checked: boolean
  qty: string
  type: string
}

type EnvKey =
  | 'envRecovered'
  | 'envRecycled'
  | 'envReclaimed'
  | 'envReturned'
  | 'envDisposal'
  | 'envDismantled'
  | 'envChangedOut'

type ServiceType = 'cod' | 'charge' | 'no-charge' | ''
type WarrantyType = 'regular' | 'warranty' | 'service-contract' | ''

interface FormState {
  invoiceNumber: string
  serviceType: ServiceType
  billTo: string
  street: string
  city: string
  phone: string
  date: string
  promised: string
  callBeforeAM: boolean
  callBeforePM: boolean
  technician: string
  authorizedBy: string
  workToBePerformed: string
  eq1Make: string
  eq1Model: string
  eq1Serial: string
  eq2Make: string
  eq2Model: string
  eq2Serial: string
  envRecovered: EnvItem
  envRecycled: EnvItem
  envReclaimed: EnvItem
  envReturned: EnvItem
  envDisposal: EnvItem
  envDismantled: EnvItem
  envChangedOut: EnvItem
  materials: MaterialRow[]
  labor: LaborRow[]
  workPerformed: Record<string, boolean>
  description: string
  recommendations: string
  warrantyType: WarrantyType
  customerSignature: string
  signatureDate: string
  travelCharge: string
  taxRate: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hvac-service-order-v1'
const COUNTER_KEY = 'hvac-invoice-counter'
const COUNTER_START = 75977

const nextInvoiceNumber = (): string => {
  const last = parseInt(localStorage.getItem(COUNTER_KEY) ?? String(COUNTER_START), 10)
  const next = last + 1
  localStorage.setItem(COUNTER_KEY, String(next))
  return String(next)
}

const SERVICE_LABELS: Record<string, string> = {
  cod: 'C.O.D.',
  charge: 'Charge',
  'no-charge': 'No Charge',
}

const ENV_ITEMS: { key: EnvKey; label: string }[] = [
  { key: 'envRecovered', label: 'Recovered' },
  { key: 'envRecycled', label: 'Recycled' },
  { key: 'envReclaimed', label: 'Reclaimed' },
  { key: 'envReturned', label: 'Returned' },
  { key: 'envDisposal', label: 'Disposal' },
  { key: 'envDismantled', label: 'Dismantled' },
  { key: 'envChangedOut', label: 'Changed Out / Replaced' },
]

const WORK_CATEGORIES = [
  {
    title: 'Condensing Unit',
    items: [
      'Leveled',
      'Cleaned coil',
      'Checked charge',
      'Repaired leak in coil',
      'Repaired leak in copper',
      'Checked motor',
      'Changed motor',
      'Replaced belt',
      'Adjusted belt',
      'Replaced contactor',
      'Replaced start relay',
      'Replaced start capacitor',
      'Replaced run capacitor',
      'Cleaned/adjusted contactor',
      'Repaired wiring',
      'Replaced fuse',
      'Replaced compressor',
    ],
  },
  {
    title: 'Condensate Drains',
    items: [
      'Cleaned main drain',
      'Repaired main drain',
      'Cleaned pan drain',
      'Repaired pan drain',
    ],
  },
  {
    title: 'Furnace / Fan Coil',
    items: [
      'Replaced belt',
      'Adjusted belt',
      'Replaced pulley',
      'Adjusted pulley',
      'Cleaned blower',
      'Replaced bearings',
      'Oiled motor',
      'Oiled bearings',
      'Cleaned heat exchanger',
      'Replaced heat exchanger',
      'Cleaned/adjusted pilot',
      'Replaced thermocouple',
      'Repaired valve',
      'Replaced valve',
      'Cleaned burners',
    ],
  },
  {
    title: 'Evaporator Coil',
    items: [
      'Replaced expansion valve',
      'Adjusted expansion valve',
      'Replaced cap tube',
      'Cleaned cap tube',
      'Repaired coil leak',
      'Repaired copper connection',
      'Cleaned coil',
      'Leveled coil',
    ],
  },
  {
    title: 'Other',
    items: [
      'Duct repaired',
      'Duct adjusted',
      'Thermostat replaced',
      'Thermostat adjusted',
      'Electric heater repaired',
      'Cooling tower cleaned',
      'Pump greased',
      'Pump repaired',
      'Filters cleaned',
      'Filters replaced',
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10)
const parseNum = (s: string) => parseFloat(s) || 0
const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const autoAmount = (a: string, b: string): string => {
  const v = parseNum(a) * parseNum(b)
  return v > 0 ? v.toFixed(2) : ''
}

const newMaterial = (): MaterialRow => ({
  id: uid(),
  qty: '',
  description: '',
  unitPrice: '',
  amount: '',
})

const newLabor = (): LaborRow => ({
  id: uid(),
  hours: '',
  description: '',
  rate: '',
  amount: '',
})

const emptyEnv = (): EnvItem => ({ checked: false, qty: '', type: '' })

const buildDefault = (invoiceNumber = ''): FormState => ({
  invoiceNumber,
  serviceType: '',
  billTo: '',
  street: '',
  city: '',
  phone: '',
  date: new Date().toISOString().split('T')[0],
  promised: '',
  callBeforeAM: false,
  callBeforePM: false,
  technician: '',
  authorizedBy: '',
  workToBePerformed: '',
  eq1Make: '',
  eq1Model: '',
  eq1Serial: '',
  eq2Make: '',
  eq2Model: '',
  eq2Serial: '',
  envRecovered: emptyEnv(),
  envRecycled: emptyEnv(),
  envReclaimed: emptyEnv(),
  envReturned: emptyEnv(),
  envDisposal: emptyEnv(),
  envDismantled: emptyEnv(),
  envChangedOut: emptyEnv(),
  materials: [newMaterial(), newMaterial(), newMaterial(), newMaterial(), newMaterial()],
  labor: [newLabor(), newLabor(), newLabor()],
  workPerformed: {},
  description: '',
  recommendations: '',
  warrantyType: '',
  customerSignature: '',
  signatureDate: '',
  travelCharge: '',
  taxRate: '0',
})

// ─── Shared class strings ─────────────────────────────────────────────────────

const INPUT =
  'w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors'
const LABEL = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'
const CARD = 'bg-white rounded-xl border border-gray-200 shadow-sm p-5'
const SECTION_TITLE = 'text-sm font-bold text-blue-700 uppercase tracking-wide'
const TH = 'text-left px-2 py-2 text-xs font-semibold text-blue-700'

// ─── Component ────────────────────────────────────────────────────────────────

export default function HVACServiceOrderInvoiceForm() {
  const [form, setForm] = useState<FormState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as FormState
    } catch {}
    return buildDefault(nextInvoiceNumber())
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ env: true })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {}
  }, [form])

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((p) => ({ ...p, [key]: value })),
    [],
  )

  // ── Material rows ──
  const updateMaterial = (id: string, field: keyof MaterialRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, [field]: value }
        if (field === 'qty' || field === 'unitPrice') {
          next.amount = autoAmount(
            field === 'qty' ? value : row.qty,
            field === 'unitPrice' ? value : row.unitPrice,
          )
        }
        return next
      }),
    }))
  }

  const addMaterial = () => setForm((p) => ({ ...p, materials: [...p.materials, newMaterial()] }))
  const removeMaterial = (id: string) =>
    setForm((p) => ({ ...p, materials: p.materials.filter((r) => r.id !== id) }))

  // ── Labor rows ──
  const updateLabor = (id: string, field: keyof LaborRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      labor: prev.labor.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, [field]: value }
        if (field === 'hours' || field === 'rate') {
          next.amount = autoAmount(
            field === 'hours' ? value : row.hours,
            field === 'rate' ? value : row.rate,
          )
        }
        return next
      }),
    }))
  }

  const addLabor = () => setForm((p) => ({ ...p, labor: [...p.labor, newLabor()] }))
  const removeLabor = (id: string) =>
    setForm((p) => ({ ...p, labor: p.labor.filter((r) => r.id !== id) }))

  // ── Env ──
  const updateEnv = (key: EnvKey, field: keyof EnvItem, value: boolean | string) => {
    setForm((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as EnvItem), [field]: value },
    }))
  }

  // ── Work performed ──
  const toggleWork = (wkey: string) =>
    setForm((p) => ({
      ...p,
      workPerformed: { ...p.workPerformed, [wkey]: !p.workPerformed[wkey] },
    }))

  // ── Totals ──
  const totalMaterials = form.materials.reduce((s, r) => s + parseNum(r.amount), 0)
  const totalLabor = form.labor.reduce((s, r) => s + parseNum(r.amount), 0)
  const travel = parseNum(form.travelCharge)
  const subtotal = totalMaterials + totalLabor + travel
  const tax = subtotal * (parseNum(form.taxRate) / 100)
  const finalTotal = subtotal + tax

  // ── Validation + print ──
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.invoiceNumber.trim()) errs.invoiceNumber = 'Required'
    if (!form.billTo.trim()) errs.billTo = 'Required'
    if (!form.date) errs.date = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePrint = () => {
    if (validate()) window.print()
  }

  const handleClear = () => {
    if (window.confirm('Clear all form data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY)
      setForm(buildDefault(nextInvoiceNumber()))
      setErrors({})
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">

      {/* ── Sticky action bar ── */}
      <div className="no-print sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-gray-800 text-sm">HVAC Service Order</span>
            <span className="hidden sm:inline text-gray-400 text-xs ml-2">· Auto-saved</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* ── 1. Header ── */}
        <div className={CARD}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            {/* Company info */}
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-blue-700 tracking-tight leading-tight">
                SOUTHERN AIRE HEATING &amp; COOLING, INC.
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                STATE CERTIFIED CAC182660 &nbsp;·&nbsp; LICENSED &nbsp;·&nbsp; INSURED
              </p>
              <p className="text-sm text-gray-600 mt-2">1789 Canova St. SE #A, Palm Bay, FL 32909</p>
              <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
                <p>Beaches: (321) 728-0277 &nbsp;·&nbsp; Mainland: (321) 728-0374 &nbsp;·&nbsp; Fax: (321) 728-8114</p>
                <p>www.southernaireheatingflorida.com &nbsp;·&nbsp; myler2e@aol.com</p>
              </div>
            </div>

            {/* Invoice meta */}
            <div className="flex flex-col gap-3 w-full md:w-64">
              <div className="text-center bg-blue-600 text-white rounded-lg py-3 px-4">
                <p className="text-xs font-semibold tracking-widest uppercase opacity-80">HVAC</p>
                <p className="text-lg font-extrabold tracking-wide">SERVICE ORDER</p>
                <p className="text-sm font-bold tracking-widest">INVOICE</p>
              </div>

              <div>
                <label className={LABEL}>Invoice #</label>
                <input
                  className={`${INPUT} text-base font-bold text-red-600 ${errors.invoiceNumber ? 'border-red-400 focus:ring-red-400' : ''}`}
                  value={form.invoiceNumber}
                  onChange={(e) => set('invoiceNumber', e.target.value)}
                  placeholder="e.g. 75977"
                />
                {errors.invoiceNumber && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.invoiceNumber}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Service Type</label>
                <div className="flex gap-3 flex-wrap">
                  {(['cod', 'charge', 'no-charge'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="serviceType"
                        value={t}
                        checked={form.serviceType === t}
                        onChange={() => set('serviceType', t)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">{SERVICE_LABELS[t]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Customer / Bill To ── */}
        <div className={CARD}>
          <h2 className={`${SECTION_TITLE} mb-4`}>Customer / Bill To</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>
              <label className={LABEL}>Bill To (Name) *</label>
              <input
                className={`${INPUT} ${errors.billTo ? 'border-red-400' : ''}`}
                value={form.billTo}
                onChange={(e) => set('billTo', e.target.value)}
                placeholder="Customer name"
              />
              {errors.billTo && <p className="text-xs text-red-500 mt-0.5">{errors.billTo}</p>}
            </div>

            <div>
              <label className={LABEL}>Phone</label>
              <input
                className={INPUT}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>

            <div>
              <label className={LABEL}>Street Address</label>
              <input
                className={INPUT}
                value={form.street}
                onChange={(e) => set('street', e.target.value)}
                placeholder="123 Main St"
              />
            </div>

            <div>
              <label className={LABEL}>City / State / ZIP</label>
              <input
                className={INPUT}
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Palm Bay, FL 32909"
              />
            </div>

            <div>
              <label className={LABEL}>Date *</label>
              <input
                type="date"
                className={`${INPUT} ${errors.date ? 'border-red-400' : ''}`}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
              {errors.date && <p className="text-xs text-red-500 mt-0.5">{errors.date}</p>}
            </div>

            <div>
              <label className={LABEL}>Promised Date / Time</label>
              <input
                className={INPUT}
                value={form.promised}
                onChange={(e) => set('promised', e.target.value)}
                placeholder="MM/DD/YYYY HH:MM"
              />
            </div>

            <div>
              <label className={LABEL}>Technician</label>
              <input
                className={INPUT}
                value={form.technician}
                onChange={(e) => set('technician', e.target.value)}
                placeholder="Technician name"
              />
            </div>

            <div>
              <label className={LABEL}>Authorized By</label>
              <input
                className={INPUT}
                value={form.authorizedBy}
                onChange={(e) => set('authorizedBy', e.target.value)}
                placeholder="Authorized by"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-5">
              {(['callBeforeAM', 'callBeforePM'] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[k]}
                    onChange={(e) => set(k, e.target.checked)}
                    className="rounded accent-blue-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">
                    {k === 'callBeforeAM' ? 'Call Before A.M.' : 'Call Before P.M.'}
                  </span>
                </label>
              ))}
            </div>

            <div className="sm:col-span-2">
              <label className={LABEL}>Work to be Performed</label>
              <textarea
                rows={3}
                className={`${INPUT} resize-none`}
                value={form.workToBePerformed}
                onChange={(e) => set('workToBePerformed', e.target.value)}
                placeholder="Describe the work requested..."
              />
            </div>
          </div>
        </div>

        {/* ── 3. Equipment ── */}
        <div className={CARD}>
          <h2 className={`${SECTION_TITLE} mb-4`}>Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Unit 1', makeK: 'eq1Make', modelK: 'eq1Model', serialK: 'eq1Serial' },
              { label: 'Unit 2', makeK: 'eq2Make', modelK: 'eq2Model', serialK: 'eq2Serial' },
            ].map(({ label, makeK, modelK, serialK }) => (
              <div key={label} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{label}</p>
                <div>
                  <label className={LABEL}>Make</label>
                  <input
                    className={INPUT}
                    value={form[makeK as keyof FormState] as string}
                    onChange={(e) => set(makeK as keyof FormState, e.target.value)}
                    placeholder="e.g. Carrier, Lennox, Trane"
                  />
                </div>
                <div>
                  <label className={LABEL}>Model</label>
                  <input
                    className={INPUT}
                    value={form[modelK as keyof FormState] as string}
                    onChange={(e) => set(modelK as keyof FormState, e.target.value)}
                    placeholder="Model number"
                  />
                </div>
                <div>
                  <label className={LABEL}>Serial Number</label>
                  <input
                    className={INPUT}
                    value={form[serialK as keyof FormState] as string}
                    onChange={(e) => set(serialK as keyof FormState, e.target.value)}
                    placeholder="Serial number"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Environmental Checklist ── */}
        <div className={CARD}>
          <button
            type="button"
            onClick={() => setCollapsed((p) => ({ ...p, env: !p.env }))}
            className="no-print w-full flex items-center justify-between"
          >
            <h2 className={SECTION_TITLE}>Environmental Check List</h2>
            <div className="flex items-center gap-2">
              {ENV_ITEMS.filter(({ key }) => (form[key] as EnvItem).checked).length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full">
                  {ENV_ITEMS.filter(({ key }) => (form[key] as EnvItem).checked).length}
                </span>
              )}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${collapsed.env ? '' : 'rotate-180'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          <div className={`print:block ${collapsed.env ? 'hidden' : 'block'} mt-4`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-blue-50 border border-blue-200 rounded">
                    <th className={`${TH} w-10`}></th>
                    <th className={TH}>Refrigerant Disposition</th>
                    <th className={`${TH} w-28`}>Quantity</th>
                    <th className={TH}>Type / Disposition Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {ENV_ITEMS.map(({ key, label }) => {
                    const item = form[key] as EnvItem
                    return (
                      <tr key={key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => updateEnv(key, 'checked', e.target.checked)}
                            className="rounded accent-blue-600 w-4 h-4"
                          />
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-700">{label}</td>
                        <td className="px-2 py-1.5">
                          <input
                            className={`${INPUT} ${!item.checked ? 'bg-gray-50 text-gray-400' : ''}`}
                            value={item.qty}
                            onChange={(e) => updateEnv(key, 'qty', e.target.value)}
                            placeholder="Qty"
                            disabled={!item.checked}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={`${INPUT} ${!item.checked ? 'bg-gray-50 text-gray-400' : ''}`}
                            value={item.type}
                            onChange={(e) => updateEnv(key, 'type', e.target.value)}
                            placeholder="Type or disposition notes..."
                            disabled={!item.checked}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── 5. Materials & Services ── */}
        <div className={CARD}>
          <h2 className={`${SECTION_TITLE} mb-4`}>Materials &amp; Services</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-blue-50 border border-blue-200">
                  <th className={`${TH} w-20`}>Qty</th>
                  <th className={TH}>Description</th>
                  <th className={`${TH} w-28`}>Unit Price</th>
                  <th className={`${TH} w-28`}>Amount</th>
                  <th className="w-8 no-print"></th>
                </tr>
              </thead>
              <tbody>
                {form.materials.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        className={INPUT}
                        value={row.qty}
                        onChange={(e) => updateMaterial(row.id, 'qty', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className={INPUT}
                        value={row.description}
                        onChange={(e) => updateMaterial(row.id, 'description', e.target.value)}
                        placeholder="Material or service"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={INPUT}
                        value={row.unitPrice}
                        onChange={(e) => updateMaterial(row.id, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${INPUT} font-semibold`}
                        value={row.amount}
                        onChange={(e) => updateMaterial(row.id, 'amount', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-2 py-1.5 no-print">
                      <button
                        type="button"
                        onClick={() => removeMaterial(row.id)}
                        className="text-gray-300 hover:text-red-500 text-xl leading-none transition-colors"
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-blue-200 bg-blue-50">
                  <td colSpan={3} className="px-2 py-2.5 text-right text-sm font-bold text-blue-700">
                    Total Materials
                  </td>
                  <td className="px-2 py-2.5 text-sm font-bold text-red-600">{fmt(totalMaterials)}</td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <button
            type="button"
            onClick={addMaterial}
            className="no-print mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Row
          </button>
        </div>

        {/* ── 6. Labor ── */}
        <div className={CARD}>
          <h2 className={`${SECTION_TITLE} mb-4`}>Labor</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-blue-50 border border-blue-200">
                  <th className={`${TH} w-20`}>Hours</th>
                  <th className={TH}>Description</th>
                  <th className={`${TH} w-28`}>Rate / hr</th>
                  <th className={`${TH} w-28`}>Amount</th>
                  <th className="w-8 no-print"></th>
                </tr>
              </thead>
              <tbody>
                {form.labor.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className={INPUT}
                        value={row.hours}
                        onChange={(e) => updateLabor(row.id, 'hours', e.target.value)}
                        placeholder="0.0"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className={INPUT}
                        value={row.description}
                        onChange={(e) => updateLabor(row.id, 'description', e.target.value)}
                        placeholder="Labor description"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={INPUT}
                        value={row.rate}
                        onChange={(e) => updateLabor(row.id, 'rate', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${INPUT} font-semibold`}
                        value={row.amount}
                        onChange={(e) => updateLabor(row.id, 'amount', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-2 py-1.5 no-print">
                      <button
                        type="button"
                        onClick={() => removeLabor(row.id)}
                        className="text-gray-300 hover:text-red-500 text-xl leading-none transition-colors"
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-blue-200 bg-blue-50">
                  <td colSpan={3} className="px-2 py-2.5 text-right text-sm font-bold text-blue-700">
                    Total Labor
                  </td>
                  <td className="px-2 py-2.5 text-sm font-bold text-red-600">{fmt(totalLabor)}</td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <button
            type="button"
            onClick={addLabor}
            className="no-print mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Row
          </button>
        </div>

        {/* ── 7. Description of Work ── */}
        <div className={CARD}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Description of Work Performed</h2>
          <textarea
            rows={5}
            className={`${INPUT} resize-none`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe all work performed in detail..."
          />
        </div>

        {/* ── 8. Recommendations ── */}
        <div className={CARD}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Recommendations</h2>
          <textarea
            rows={4}
            className={`${INPUT} resize-none`}
            value={form.recommendations}
            onChange={(e) => set('recommendations', e.target.value)}
            placeholder="Additional recommendations for the customer..."
          />
        </div>

        {/* ── 9. Work Performed Checklist ── */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={SECTION_TITLE}>Work Performed Checklist</h2>
            <button
              type="button"
              onClick={() => {
                const allOpen = WORK_CATEGORIES.every((c) => !collapsed[c.title])
                const next: Record<string, boolean> = {}
                if (allOpen) WORK_CATEGORIES.forEach((c) => (next[c.title] = true))
                setCollapsed(next)
              }}
              className="no-print text-xs text-blue-500 hover:text-blue-700 font-medium"
            >
              {WORK_CATEGORIES.every((c) => !collapsed[c.title]) ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {WORK_CATEGORIES.map((cat) => {
              const isOpen = !collapsed[cat.title]
              const checkedCount = cat.items.filter((item) => !!form.workPerformed[`${cat.title}:${item}`]).length
              return (
                <div key={cat.title} className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCollapsed((p) => ({ ...p, [cat.title]: !p[cat.title] }))}
                    className="no-print w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{cat.title}</span>
                    <div className="flex items-center gap-2">
                      {checkedCount > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full">
                          {checkedCount}
                        </span>
                      )}
                      <svg
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {/* print: always show; screen: show when open */}
                  <div className={`print:block ${isOpen ? 'block' : 'hidden'}`}>
                    <div className="px-3 pb-3 pt-1 space-y-1 border-t border-blue-100">
                      {cat.items.map((item) => {
                        const wkey = `${cat.title}:${item}`
                        return (
                          <label
                            key={wkey}
                            className="flex items-center gap-2 cursor-pointer rounded px-1 py-0.5 hover:bg-white transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={!!form.workPerformed[wkey]}
                              onChange={() => toggleWork(wkey)}
                              className="rounded accent-blue-600 w-3.5 h-3.5 flex-shrink-0"
                            />
                            <span className="text-xs text-gray-700">{item}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 10. Warranty ── */}
        <div className={CARD}>
          <h2 className={`${SECTION_TITLE} mb-3`}>Warranty</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-gray-700 leading-relaxed mb-4">
            <strong>LIMITED WARRANTY:</strong> All materials, parts, and equipment are warranted by the
            manufacturer's or supplier's written warranty only. All labor performed by the above named
            company is warranted for 30 days unless otherwise indicated in writing. The above named
            company makes no other warranties, express or implied, and its agents or technicians are not
            authorized to make any such warranties on behalf of the above named company.
          </div>
          <div className="flex flex-wrap gap-5">
            {(['regular', 'warranty', 'service-contract'] as const).map((w) => (
              <label key={w} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="warrantyType"
                  value={w}
                  checked={form.warrantyType === w}
                  onChange={() => set('warrantyType', w)}
                  className="accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  {w === 'service-contract' ? 'Service Contract' : w.charAt(0).toUpperCase() + w.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── 11 + 12. Signature + Totals ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Signature */}
          <div className={CARD}>
            <h2 className={`${SECTION_TITLE} mb-3`}>Customer Signature</h2>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              I hereby authorize the above work to be performed and agree that the company is not
              responsible for loss or damage to vehicles or articles left in vehicles. I authorize
              the above named company to perform the services described.
            </p>
            <div className="space-y-3">
              <div>
                <label className={LABEL}>Customer Signature</label>
                <input
                  className={`${INPUT} italic`}
                  value={form.customerSignature}
                  onChange={(e) => set('customerSignature', e.target.value)}
                  placeholder="Type name as signature"
                />
                <div className="mt-1 border-b-2 border-gray-400 w-full" />
              </div>
              <div>
                <label className={LABEL}>Date</label>
                <input
                  type="date"
                  className={INPUT}
                  value={form.signatureDate}
                  onChange={(e) => set('signatureDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className={`${CARD} border-red-200`}>
            <h2 className={`${SECTION_TITLE} mb-4`}>Total Summary</h2>
            <div className="space-y-2">

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Materials</span>
                <span className="text-sm font-semibold tabular-nums text-gray-800">{fmt(totalMaterials)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Labor</span>
                <span className="text-sm font-semibold tabular-nums text-gray-800">{fmt(totalLabor)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-sm text-gray-600">Travel Charge</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                  value={form.travelCharge}
                  onChange={(e) => set('travelCharge', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-sm text-gray-600">Tax Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                  value={form.taxRate}
                  onChange={(e) => set('taxRate', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm tabular-nums text-gray-700">{fmt(tax)}</span>
              </div>

              <div className="flex justify-between items-center py-3 px-4 mt-2 bg-red-50 rounded-lg border border-red-200">
                <span className="font-bold text-gray-800 uppercase tracking-wide">Total</span>
                <span className="text-2xl font-extrabold text-red-600 tabular-nums">{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-400 text-sm italic">
          Thank you for your business — Southern Aire Heating &amp; Cooling, Inc.
        </div>

      </div>
    </div>
  )
}
