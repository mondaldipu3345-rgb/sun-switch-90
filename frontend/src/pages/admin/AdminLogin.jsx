import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally { setLoading(false); }
  };

  const forgot = async () => {
    if (!email) { toast.error("Enter your email first, then click forgot password."); return; }
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("If this email exists, a reset link has been generated (check server logs).");
    } catch { toast.error("Could not process request."); }
  };

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-solar/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-navy-light/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="SUN SWITCH" className="w-20 h-20 rounded-full ring-2 ring-white shadow-lg object-cover bg-white" />
          <h1 className="font-heading text-2xl font-extrabold text-white mt-4">SUN SWITCH Admin</h1>
          <p className="text-slate-400 text-sm">Sign in to manage your website</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl p-7 shadow-xl space-y-5" data-testid="admin-login-form">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" required data-testid="login-email" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required data-testid="login-password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-solar hover:bg-solar-dark text-white rounded-full font-semibold h-11" data-testid="login-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />} Sign In
          </Button>
          <button type="button" onClick={forgot} className="w-full text-center text-sm text-slate-500 hover:text-navy" data-testid="login-forgot">Forgot password?</button>
        </form>
      </div>
    </div>
  );
}
