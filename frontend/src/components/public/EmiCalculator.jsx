import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function EmiCalculator() {
  const [price, setPrice] = useState(300000);
  const [down, setDown] = useState(50000);
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(5); // years

  const r = useMemo(() => {
    const loan = Math.max(0, price - down);
    const months = tenure * 12;
    const mr = rate / 12 / 100;
    let emi;
    if (mr === 0) emi = loan / months;
    else emi = (loan * mr * Math.pow(1 + mr, months)) / (Math.pow(1 + mr, months) - 1);
    const total = emi * months;
    const interest = total - loan;
    return {
      loan, emi: Math.round(emi || 0), total: Math.round(total || 0), interest: Math.round(interest || 0),
    };
  }, [price, down, rate, tenure]);

  const fmt = (n) => "₹" + (n || 0).toLocaleString("en-IN");

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-7">
        <SliderField label="System Price" value={price} setValue={setPrice} min={50000} max={2000000} step={10000} fmt={fmt} testid="emi-price" />
        <SliderField label="Down Payment" value={down} setValue={setDown} min={0} max={Math.max(10000, price)} step={5000} fmt={fmt} testid="emi-down" />
        <SliderField label="Interest Rate (% p.a.)" value={rate} setValue={setRate} min={5} max={20} step={0.5} fmt={(n) => `${n}%`} testid="emi-rate" />
        <SliderField label="Loan Tenure (years)" value={tenure} setValue={setTenure} min={1} max={15} step={1} fmt={(n) => `${n} yr`} testid="emi-tenure" />
        <div className="space-y-1.5">
          <Label className="text-sm text-slate-700">Loan Amount</Label>
          <Input readOnly value={fmt(r.loan)} className="bg-slate-50 font-semibold" data-testid="emi-loan" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-navy rounded-2xl p-7 text-white">
          <div className="text-sm text-slate-300">Estimated Monthly Installment (EMI)</div>
          <div className="font-heading text-4xl font-bold mt-2" data-testid="emi-result">{fmt(r.emi)}</div>
          <div className="text-xs text-slate-300 mt-2">per month for {tenure} years</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-xs text-slate-500">Total Repayment</div>
            <div className="font-heading text-xl font-bold text-navy-dark mt-1">{fmt(r.total)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-xs text-slate-500">Total Interest</div>
            <div className="font-heading text-xl font-bold text-solar mt-1">{fmt(r.interest)}</div>
          </div>
        </div>
        <p className="text-xs text-slate-400">All figures are indicative estimates only and not a financial offer.</p>
        <Button asChild className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold w-full">
          <Link to="/quote" data-testid="emi-quote-btn">GET A QUOTE</Link>
        </Button>
      </div>
    </div>
  );
}

function SliderField({ label, value, setValue, min, max, step, fmt, testid }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm text-slate-700">{label}</Label>
        <span className="font-heading font-bold text-navy" data-testid={testid}>{fmt(value)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => setValue(v[0])} />
    </div>
  );
}
