import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "Change Password | SUN SWITCH Admin"; }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) { toast.error("New passwords do not match."); return; }
    if (next.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await api.post("/auth/change-password", { current_password: current, new_password: next });
      toast.success("Password changed successfully.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed to change password"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md">
      <h1 className="font-heading text-2xl font-bold text-navy-dark mb-6">Change Password</h1>
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4" data-testid="change-password-form">
        <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-700">Current Password</Label><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required data-testid="cp-current" /></div>
        <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-700">New Password</Label><Input type="password" value={next} onChange={(e) => setNext(e.target.value)} required data-testid="cp-new" /></div>
        <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-700">Confirm New Password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required data-testid="cp-confirm" /></div>
        <Button type="submit" disabled={loading} className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold w-full" data-testid="cp-submit">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <KeyRound className="w-4 h-4 mr-1" />} Update Password
        </Button>
      </form>
    </div>
  );
}
