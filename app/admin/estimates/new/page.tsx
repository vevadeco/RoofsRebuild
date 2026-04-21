'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Lead = { id: string; name: string; email: string; service_type: string };
type LineItem = { description: string; qty: number; unit_price: number };
type FlashingRow = { type: string; isNew: boolean; reused: boolean; details: string };

const FLASHING_TYPES = [
  'Chimney Step', 'Chimney', 'Step', 'Saddle', 'Counter',
  'Wall', 'Z Flashing', 'Valleys', 'Skylight', 'Drip Edges',
];

const defaultFlashing = (): FlashingRow[] =>
  FLASHING_TYPES.map(t => ({ type: t, isNew: false, reused: false, details: '' }));

function CollapsibleCard({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors">
        <h2 className="font-medium text-slate-800">{title}</h2>
        {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 sm:px-6 pb-6 space-y-4">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function NewEstimateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLeadId = searchParams.get('lead_id') ?? '';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState(preselectedLeadId);
  const [saving, setSaving] = useState(false);

  // Job Information
  const [jobLocation, setJobLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [jobDuration, setJobDuration] = useState('');

  // Existing Roof Conditions
  const [roofInspectionDate, setRoofInspectionDate] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [roofHeight, setRoofHeight] = useState('');
  const [roofSlope, setRoofSlope] = useState('');
  const [roofPlywoodSurface, setRoofPlywoodSurface] = useState('');
  const [numberOfLayers, setNumberOfLayers] = useState('1');
  const [roofShape, setRoofShape] = useState('');
  const [yearInstalled, setYearInstalled] = useState('');
  const [skylights, setSkylights] = useState('');
  const [currentlyLeaking, setCurrentlyLeaking] = useState('No');
  const [historyOfLeaking, setHistoryOfLeaking] = useState('No');
  const [leakDetails, setLeakDetails] = useState('');

  // Shingles
  const [shingleType, setShingleType] = useState('Architectural');
  const [shingleYear, setShingleYear] = useState('');
  const [shingleColour, setShingleColour] = useState('');
  const [shinglePlywood, setShinglePlywood] = useState('');

  // Underlayment
  const [felt, setFelt] = useState('None');
  const [vinylSynthetic, setVinylSynthetic] = useState('None');
  const [iceDamLeadingEdge, setIceDamLeadingEdge] = useState(false);
  const [iceDamSize, setIceDamSize] = useState('3 Feet');
  const [valley, setValley] = useState('None');

  // Flashing
  const [flashing, setFlashing] = useState<FlashingRow[]>(defaultFlashing());

  // Installation Options
  const [installOptions, setInstallOptions] = useState({
    stripExisting: false,
    roofOver: false,
    cleanGutter: false,
    removalDisposal: false,
    cleanMagnet: false,
  });

  // Line Items
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', qty: 1, unit_price: 0 }]);

  // Exclusions
  const [exclusions, setExclusions] = useState('');

  // Payment
  const [deposit, setDeposit] = useState(0);
  const [validDays, setValidDays] = useState(30);

  // Notes
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(setLeads).catch(() => toast.error('Failed to load leads'));
  }, []);

  const addItem = () => setLineItems(prev => [...prev, { description: '', qty: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setLineItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) =>
    setLineItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const subtotal = lineItems.reduce((s, i) => s + i.qty * i.unit_price, 0);
  const balanceOwing = subtotal - deposit;

  const updateFlashing = (i: number, field: keyof FlashingRow, value: boolean | string) =>
    setFlashing(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const toggleInstallOption = (key: keyof typeof installOptions) =>
    setInstallOptions(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) { toast.error('Select a lead'); return; }
    if (lineItems.some(i => !i.description)) { toast.error('All line items need a description'); return; }
    setSaving(true);

    const installationOptions: string[] = [];
    if (installOptions.stripExisting) installationOptions.push('Strip existing roof down to the roof deck');
    if (installOptions.roofOver) installationOptions.push('Roof over existing materials');
    if (installOptions.cleanGutter) installationOptions.push('Clean existing gutter system');
    if (installOptions.removalDisposal) installationOptions.push('Removal/Disposal of job debris');
    if (installOptions.cleanMagnet) installationOptions.push('Clean job site including magnet rolling');

    const items = {
      job: { location: jobLocation, startDate, duration: jobDuration },
      roofConditions: {
        inspectionDate: roofInspectionDate, squareFootage: Number(squareFootage) || 0,
        roofHeight, roofSlope, plywoodSurface: roofPlywoodSurface,
        numberOfLayers: Number(numberOfLayers), roofShape, yearInstalled: Number(yearInstalled) || 0,
        skylights, currentlyLeaking, historyOfLeaking, leakDetails,
      },
      shingles: { type: shingleType, year: shingleYear, colour: shingleColour, plywood: shinglePlywood },
      underlayment: {
        felt, vinylSynthetic,
        iceDamProtection: { leadingEdge: iceDamLeadingEdge, size: iceDamSize },
        valley,
      },
      flashing,
      installationOptions,
      lineItems,
      exclusions,
      payment: { deposit, validDays },
    };

    try {
      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, items, notes }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      const est = await res.json();
      toast.success('Proposal created');
      router.push(`/admin/estimates/${est.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create proposal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">New Roofing Proposal</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client */}
          <CollapsibleCard title="Client">
            <Field label="Select Lead">
              <Select onValueChange={setLeadId} value={leadId} required>
                <SelectTrigger className="border-slate-300"><SelectValue placeholder="Choose a lead..." /></SelectTrigger>
                <SelectContent>
                  {leads.map(l => <SelectItem key={l.id} value={l.id}>{l.name} — {l.email} ({l.service_type})</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </CollapsibleCard>

          {/* Job Information */}
          <CollapsibleCard title="Job Information">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Job Location"><Input value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="border-slate-300" placeholder="123 Main St, Toronto" /></Field>
              <Field label="Start Date"><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Job Duration"><Input value={jobDuration} onChange={e => setJobDuration(e.target.value)} className="border-slate-300" placeholder="3-5 days" /></Field>
            </div>
          </CollapsibleCard>

          {/* Existing Roof Conditions */}
          <CollapsibleCard title="Existing Roof Conditions" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Roof Inspection Date"><Input type="date" value={roofInspectionDate} onChange={e => setRoofInspectionDate(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Square Footage"><Input type="number" value={squareFootage} onChange={e => setSquareFootage(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Roof Height"><Input value={roofHeight} onChange={e => setRoofHeight(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Roof Slope"><Input value={roofSlope} onChange={e => setRoofSlope(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Roof Plywood Surface"><Input value={roofPlywoodSurface} onChange={e => setRoofPlywoodSurface(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Number of Layers">
                <Select value={numberOfLayers} onValueChange={setNumberOfLayers}>
                  <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Roof Shape"><Input value={roofShape} onChange={e => setRoofShape(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Year Installed"><Input type="number" value={yearInstalled} onChange={e => setYearInstalled(e.target.value)} className="border-slate-300" placeholder="2005" /></Field>
              <Field label="Skylights"><Input value={skylights} onChange={e => setSkylights(e.target.value)} className="border-slate-300" placeholder="None / 2 skylights" /></Field>
              <Field label="Currently Leaking">
                <Select value={currentlyLeaking} onValueChange={setCurrentlyLeaking}>
                  <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="History of Leaking">
                <Select value={historyOfLeaking} onValueChange={setHistoryOfLeaking}>
                  <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
            {(currentlyLeaking === 'Yes' || historyOfLeaking === 'Yes') && (
              <Field label="Leak Details"><Textarea value={leakDetails} onChange={e => setLeakDetails(e.target.value)} rows={2} className="border-slate-300 resize-none" placeholder="Describe leak location and severity..." /></Field>
            )}
          </CollapsibleCard>

          {/* Shingles */}
          <CollapsibleCard title="Shingles" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Type">
                <Select value={shingleType} onValueChange={setShingleType}>
                  <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 Tab (capping)">3 Tab (capping)</SelectItem>
                    <SelectItem value="Architectural">Architectural</SelectItem>
                    <SelectItem value="Specialty Architectural">Specialty Architectural</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Year"><Input value={shingleYear} onChange={e => setShingleYear(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Colour"><Input value={shingleColour} onChange={e => setShingleColour(e.target.value)} className="border-slate-300" /></Field>
              <Field label="Plywood"><Input value={shinglePlywood} onChange={e => setShinglePlywood(e.target.value)} className="border-slate-300" /></Field>
            </div>
          </CollapsibleCard>

          {/* Underlayment */}
          <CollapsibleCard title="Underlayment" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Felt">
                <Select value={felt} onValueChange={setFelt}>
                  <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 Feet">3 Feet</SelectItem><SelectItem value="6 Feet">6 Feet</SelectItem>
                    <SelectItem value="Other">Other</SelectItem><SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Vinyl/Synthetic">
                <Select value={vinylSynthetic} onValueChange={setVinylSynthetic}>
                  <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 Feet">3 Feet</SelectItem><SelectItem value="6 Feet">6 Feet</SelectItem>
                    <SelectItem value="Other">Other</SelectItem><SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Ice Dam Protection</Label>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={iceDamLeadingEdge} onChange={() => setIceDamLeadingEdge(!iceDamLeadingEdge)} className="rounded border-slate-300" />
                    Leading Edge
                  </label>
                  <Select value={iceDamSize} onValueChange={setIceDamSize}>
                    <SelectTrigger className="border-slate-300 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 Feet">3 Feet</SelectItem><SelectItem value="6 Feet">6 Feet</SelectItem><SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Field label="Valley">
                <Select value={valley} onValueChange={setValley}>
                  <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 Layer">1 Layer</SelectItem><SelectItem value="2 Layer">2 Layer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem><SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </CollapsibleCard>

          {/* Flashing */}
          <CollapsibleCard title="Flashing" defaultOpen={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2 text-left font-semibold">Type</th>
                    <th className="py-2 text-center font-semibold w-16">New</th>
                    <th className="py-2 text-center font-semibold w-16">Reused</th>
                    <th className="py-2 text-left font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flashing.map((row, i) => (
                    <tr key={row.type}>
                      <td className="py-2 text-slate-700">{row.type}</td>
                      <td className="py-2 text-center">
                        <input type="checkbox" checked={row.isNew} onChange={() => updateFlashing(i, 'isNew', !row.isNew)} className="rounded border-slate-300" />
                      </td>
                      <td className="py-2 text-center">
                        <input type="checkbox" checked={row.reused} onChange={() => updateFlashing(i, 'reused', !row.reused)} className="rounded border-slate-300" />
                      </td>
                      <td className="py-2">
                        <Input value={row.details} onChange={e => updateFlashing(i, 'details', e.target.value)} className="border-slate-300 h-8 text-sm" placeholder="Details..." />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleCard>

          {/* Installation Options */}
          <CollapsibleCard title="Installation Options" defaultOpen={false}>
            <div className="space-y-3">
              {([
                ['stripExisting', 'Strip existing roof down to the roof deck'],
                ['roofOver', 'Roof over existing materials'],
                ['cleanGutter', 'Clean existing gutter system'],
                ['removalDisposal', 'Removal/Disposal of job debris'],
                ['cleanMagnet', 'Clean job site including magnet rolling'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={installOptions[key]} onChange={() => toggleInstallOption(key)} className="rounded border-slate-300" />
                  {label}
                </label>
              ))}
            </div>
          </CollapsibleCard>

          {/* Line Items */}
          <CollapsibleCard title="Line Items (Pricing)">
            <div className="space-y-3">
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-12 sm:col-span-6">
                    <Input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="border-slate-300" required />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input type="number" min="1" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', Number(e.target.value))} className="border-slate-300" />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <Input type="number" min="0" step="0.01" placeholder="Unit price" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', Number(e.target.value))} className="border-slate-300" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                    {lineItems.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={addItem} className="gap-2 border-slate-300 text-slate-600 text-sm">
              <Plus className="h-4 w-4" /> Add Line Item
            </Button>
            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-slate-500">Subtotal</p>
                <p className="text-2xl font-bold text-slate-900">${subtotal.toFixed(2)}</p>
              </div>
            </div>
          </CollapsibleCard>

          {/* Exclusions */}
          <CollapsibleCard title="Exclusions / Additional Charges" defaultOpen={false}>
            <Textarea value={exclusions} onChange={e => setExclusions(e.target.value)} rows={4} className="border-slate-300 resize-none" placeholder="List any exclusions or additional charges..." />
          </CollapsibleCard>

          {/* Payment Terms */}
          <CollapsibleCard title="Payment Terms">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Deposit Amount ($)">
                <Input type="number" min="0" step="0.01" value={deposit} onChange={e => setDeposit(Number(e.target.value))} className="border-slate-300" />
              </Field>
              <Field label="Balance Owing on Completion">
                <div className="h-10 flex items-center text-lg font-semibold text-slate-900">${balanceOwing.toFixed(2)}</div>
              </Field>
              <Field label="Proposal Valid For (days)">
                <Input type="number" min="1" value={validDays} onChange={e => setValidDays(Number(e.target.value))} className="border-slate-300" />
              </Field>
            </div>
          </CollapsibleCard>

          {/* Notes */}
          <CollapsibleCard title="Notes" defaultOpen={false}>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="border-slate-300 resize-none" placeholder="Any additional notes for the client..." />
          </CollapsibleCard>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} className="border-slate-300">Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white px-8">
              {saving ? 'Creating...' : 'Create Proposal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewEstimatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    }>
      <NewEstimateForm />
    </Suspense>
  );
}
