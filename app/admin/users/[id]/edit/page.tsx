"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Menu, X } from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";

type RoleOption = 'COUNTER' | 'WASHER' | 'LAND_OWNER';
const ROLE_OPTIONS: RoleOption[] = ['COUNTER', 'WASHER', 'LAND_OWNER'];

type UserDetails = {
  id: string;
  fullName: string;
  address: string | null;
  nic: string | null;
  contactNo: string | null;
  email: string;
  role: string;
};

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ fullName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    nic: '',
    mobileNumber: '',
    email: '',
    role: 'COUNTER' as RoleOption,
    password: '',
    passwordConfirm: '',
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const rawId = (params as { id?: string | string[] } | null)?.id;
        const resolvedId = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!resolvedId) {
          setError("Missing user id");
          return;
        }
        if (!active) return;
        setUserId(resolvedId);
        const authRes = await fetch("/api/auth/me", { credentials: "include" });
        const authData = await authRes.json();
        if (!authRes.ok || !authData.success || authData.data?.role !== "ADMIN") {
          router.push("/sign-in");
          return;
        }
        setCurrentUser(authData.data);

        const res = await fetch(`/api/admin/users/${resolvedId}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Failed to load user");
          return;
        }
        const user: UserDetails = data.data;
        setFormData({
          fullName: user.fullName || '',
          address: user.address || '',
          nic: user.nic || '',
          mobileNumber: user.contactNo || '',
          email: user.email || '',
          role: (user.role as RoleOption) || 'COUNTER',
          password: '',
          passwordConfirm: '',
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [params, router]);

  const onChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.nic.trim()) errors.nic = 'NIC is required';
    if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!ROLE_OPTIONS.includes(formData.role)) errors.role = 'Invalid role';
    if (formData.password || formData.passwordConfirm) {
      if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = 'Passwords do not match';
    }
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      setError("Missing user id");
      return;
    }
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        fullName: formData.fullName,
        address: formData.address,
        nic: formData.nic,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) {
        payload.password = formData.password;
        payload.passwordConfirm = formData.passwordConfirm;
      }
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update user");
        return;
      }
      router.push(`/admin/users/${userId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const openSignOutModal = () => {
    setMobileMenuOpen(false);
    setShowSignOutModal(true);
  };

  const closeSignOutModal = () => setShowSignOutModal(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setShowSignOutModal(false);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      router.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    if (!showSignOutModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSignOutModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#0F172A] dark:to-[#020617] bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB]">
      <div className="hidden lg:block">
        <AdminSidebar adminName={currentUser?.fullName || "Admin"} onLogout={openSignOutModal} />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div
        className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 z-50 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          adminName={currentUser?.fullName || "Admin"}
          onLinkClick={() => setMobileMenuOpen(false)}
          onLogout={openSignOutModal}
        />
      </div>

      <div className="lg:ml-64 flex-1 w-full">
        <div className="sticky top-0 z-20 border-b transition-colors duration-300 dark:border-slate-800/60 border-slate-200/60 bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6] backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg border p-2 transition-all hover:scale-105 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 border-slate-200/60 bg-slate-50/50 text-slate-700"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex-1" />
          </div>
        </div>

        <main className="p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold dark:text-[#E5E7EB] text-[#111827]">Edit User</h1>
                <p className="mt-1 text-sm text-slate-500">Update account details.</p>
              </div>
            </div>

            {error && <div className="text-sm text-rose-400">{error}</div>}

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full Name" value={formData.fullName} error={fieldErrors.fullName} onChange={(v) => onChange('fullName', v)} />
                <Field label="Address" value={formData.address} error={fieldErrors.address} onChange={(v) => onChange('address', v)} />
                <Field label="NIC" value={formData.nic} error={fieldErrors.nic} onChange={(v) => onChange('nic', v)} />
                <Field label="Mobile Number" value={formData.mobileNumber} error={fieldErrors.mobileNumber} onChange={(v) => onChange('mobileNumber', v)} />
                <Field label="Email" value={formData.email} error={fieldErrors.email} onChange={(v) => onChange('email', v)} type="email" />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => onChange('role', e.target.value)}
                    className="w-full rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.role && <p className="text-xs text-rose-400">{fieldErrors.role}</p>}
                </div>
                <Field label="New Password (optional)" value={formData.password} error={fieldErrors.password} onChange={(v) => onChange('password', v)} type="password" />
                <Field label="Confirm New Password" value={formData.passwordConfirm} error={fieldErrors.passwordConfirm} onChange={(v) => onChange('passwordConfirm', v)} type="password" />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-lime-500 to-emerald-500 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-500/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {showSignOutModal && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSignOutModal} />
            <div className="relative z-[10000] mx-4 w-full max-w-md rounded-2xl border border-slate-700/70 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
              <h3 className="mb-2 text-center text-xl font-bold text-white">Sign Out</h3>
              <p className="mb-6 text-center text-slate-400">
                Are you sure you want to sign out? You will need to sign in again to access your account.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeSignOutModal}
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex-1 rounded-xl border border-red-500/50 bg-red-500/20 px-4 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/30 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signingOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
