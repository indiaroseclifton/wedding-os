"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Vendor = {
  id: string;
  name: string;
  category: string;
  status: string;
  email?: string;
  phone?: string;
  notes?: string;
};

type Payment = {
  id: string;
  vendorName: string;
  label: string;
  amount: number;
  dueDate?: string;
  status: string;
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch(`/api/vendors/${id}`), fetch("/api/payments")])
      .then(async ([vr, pr]) => {
        if (!vr.ok) throw new Error("Vendor not found");
        const vdata = await vr.json();
        setVendor(vdata.vendor);
        if (pr.ok) {
          const pdata = await pr.json();
          const name = (vdata.vendor?.name || "").toLowerCase();
          setPayments(
            (pdata.payments || []).filter(
              (p: Payment) => p.vendorName.toLowerCase() === name
            )
          );
        }
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!vendor) return <p className="text-sm text-slate-600">Loading…</p>;

  const openPay = payments
    .filter((p) => p.status !== "PAID")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/vendors" className="text-xs underline">
          All vendors
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{vendor.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {vendor.category} · {vendor.status.replaceAll("_", " ")}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-2">
        {vendor.email && <p>Email: {vendor.email}</p>}
        {vendor.phone && <p>Phone: {vendor.phone}</p>}
        {vendor.notes && <p className="text-slate-600">{vendor.notes}</p>}
        {!vendor.email && !vendor.phone && !vendor.notes && (
          <p className="text-slate-500">No contact details yet.</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Payments</p>
          <Link href="/payments" className="text-xs underline">
            Add payment
          </Link>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Open for this vendor: ${openPay.toLocaleString()}
        </p>
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {payments.map((p) => (
            <li key={p.id} className="flex justify-between px-4 py-3 text-sm">
              <span>
                {p.label}
                {p.dueDate ? ` · ${p.dueDate}` : ""}
              </span>
              <span>
                ${p.amount.toLocaleString()} · {p.status}
              </span>
            </li>
          ))}
          {!payments.length && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">
              No payments matched this vendor name
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
