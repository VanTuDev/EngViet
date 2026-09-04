import { apiPublic, apiServer } from "@/lib/api/server";
import type { Paginated } from "@/lib/api/envelope";
import type { Plan, PlanId, Transaction } from "@/lib/types";

interface PlanDto {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number | null;
  studentSlots: number | null;
  features: { label: string; included: boolean }[];
  highlighted?: boolean;
}

function toPlan(d: PlanDto): Plan {
  return {
    id: d.id as PlanId,
    name: d.name,
    tagline: d.tagline,
    priceMonthly: d.priceMonthly,
    studentSlots: d.studentSlots === null ? "unlimited" : d.studentSlots,
    features: d.features,
    highlighted: d.highlighted,
  };
}

/**
 * Public — the marketing /pricing page and the billing plan picker. Cached 5 min
 * (plans rarely change). Resilient: returns `[]` if the API is unreachable so a
 * frontend build (which prerenders /pricing) never fails on a cold/asleep backend.
 */
export async function getPlans(): Promise<Plan[]> {
  try {
    const plans = await apiPublic<PlanDto[]>("/billing/plans", { revalidate: 300 });
    return plans.map(toPlan);
  } catch {
    return [];
  }
}

interface TransactionDto {
  id: string;
  reference: string;
  teacherId: string;
  teacherName?: string;
  planId: string;
  amount: number;
  status: Transaction["status"];
  paidAt?: string;
  createdAt: string;
}

function toTransaction(d: TransactionDto): Transaction {
  return {
    id: d.id,
    reference: d.reference,
    teacherId: d.teacherId,
    teacherName: d.teacherName ?? "",
    planId: d.planId as PlanId,
    amount: d.amount,
    status: d.status,
    createdAt: d.createdAt,
    paidAt: d.paidAt,
  };
}

export async function getMyTransactions(): Promise<Transaction[]> {
  const res = await apiServer<Paginated<TransactionDto>>("/billing/transactions/mine?limit=50");
  return res.data.map(toTransaction);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const res = await apiServer<Paginated<TransactionDto>>("/billing/transactions?limit=50");
  return res.data.map(toTransaction);
}
