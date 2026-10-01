import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, Wallet, Receipt, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function EmiCalculator() {
  const [price, setPrice] = useState(300000);
  const [down, setDown] = useState(50000);
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(5);

  const r = useMemo(() => {
    const loan = Math.max(0, price - down);
    const months = tenure * 12;
    const mr = rate / 12 / 100;
    const emi = mr === 0 ? loan / months : (loan * mr * Math.pow(1 + mr, months)) / (Math.pow(1 + mr, months) - 1);
    const total = emi * months;
    return { loan, emi: Math.round(emi || 0), total: Math.round(total || 0), interest: Math.round((total - loan) || 0) };
  }, [price, down, rate, tenure]);

  const fmt = (n) => "₹" + (n || 0).toLocaleString("en-IN");

  return (
    <div className="grid lg:grid-cols-5 gap-6 items-stretch">
      {/* Inputs */}
      <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-7 sm:p-9 premium-shadow">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-solar mb-6">
          <Calculator className="w-4 h-4" /> EMI Estimator
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
          <SliderField label="System Price" value={price} setValue={setPrice} min={50000} max={2000000} step={10000} fmt={fmt} testid="emi-price" />
          <SliderField label="Down Payment" value={down} setValue={setDown} min={0} max={Math.max(10000, price)} step={5000} fmt={fmt} testid="emi-down" />
          <SliderField label="Interest Rate" value={rate} setValue={setRate} min={5} max={20} step={0.5} fmt={(n) => `${n}% p.a.`} testid="emi-rate" />
          <SliderField label="Loan Tenure" value={tenure} setValue={setTenure} min={1} max={15} step={1} fmt={(n) => `${n} years`} testid="emi-tenure" />
        </div>
        <div className="mt-7 flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4">
          <span className="text-sm font-medium text-slate-600">Loan Amount</span>
          <span className="font-heading text-xl font-bold text-navy num-animate" data-testid="emi-loan">{fmt(r.loan)}</span>
        </div>
      </div>

      {/* Result */}
      <div className="lg:col-span-2 gradient-navy rounded-3xl p-7 sm:p-8 text-white relative overflow-hidden premium-shadow flex flex-col">
        <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="relative flex flex-col h-full">
          <div className="text-sm text-slate-300">Estimated monthly EMI</div>
          <div className="font-heading text-5xl font-extrabold mt-1 num-animate" data-testid="emi-result">{fmt(r.emi)}</div>
          <div className="text-xs text-slate-300 mt-1">for {tenure} years</div>

          <div className="space-y-3 mt-7">
            <Row icon={Wallet} label="Total Repayment" value={fmt(r.total)} />
            <Row icon={Receipt} label="Total Interest" value={fmt(r.interest)} accent />
          </div>

          <p className="text-[11px] text-slate-400 mt-5 leading-relaxed">Indicative estimates only, not a financial offer.</p>
          <Button asChild className="btn-solar text-white rounded-full font-semibold w-full mt-auto h-12 border-0">
            <Link to="/quote" data-testid="emi-quote-btn">GET A FREE QUOTE <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SliderField({ label, value, setValue, min, max, step, fmt, testid }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        <span className="font-heading font-bold text-navy num-animate" data-testid={testid}>{fmt(value)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => setValue(v[0])} />
    </div>
  );
}

function Row({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center justify-between glass-dark rounded-xl px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-slate-200"><Icon className="w-4 h-4 text-solar" /> {label}</span>
      <span className={`font-heading font-bold num-animate ${accent ? "text-solar" : "text-white"}`}>{value}</span>
    </div>
  );
}
