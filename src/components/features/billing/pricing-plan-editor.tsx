"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckOutlined, CloseOutlined, EditOutlined, TeamOutlined } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrencyVND } from "@/lib/utils";
import type { Plan } from "@/lib/types";

/** UC02 — lets admins tune the price/slot allowance shown to teachers on `/pricing`. Changes apply to this session only (no billing backend yet). */
export function PricingPlanEditor({ plans }: { plans: Plan[] }) {
  const t = useTranslations("dash.planEditor");
  const tc = useTranslations("common");
  const [rows, setRows] = useState(plans.map((p) => ({ ...p })));
  const [editingId, setEditingId] = useState<Plan["id"] | null>(null);
  const [draft, setDraft] = useState<{ price: string; slots: string }>({ price: "0", slots: "0" });

  function startEdit(plan: Plan) {
    setEditingId(plan.id);
    setDraft({ price: String(plan.priceMonthly ?? 0), slots: plan.studentSlots === "unlimited" ? "0" : String(plan.studentSlots) });
  }

  function saveEdit(planId: Plan["id"]) {
    setRows((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              priceMonthly: p.priceMonthly === null ? null : Number(draft.price) || 0,
              studentSlots: p.studentSlots === "unlimited" ? "unlimited" : Number(draft.slots) || 0,
            }
          : p,
      ),
    );
    setEditingId(null);
  }

  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
      {rows.map((plan) => {
        const isEditing = editingId === plan.id;
        return (
          <Card key={plan.id} className={plan.highlighted ? "border-2 border-primary" : undefined}>
            <div className="flex items-start justify-between p-6 pb-2">
              <div>
                <h3 className="font-heading text-headline-sm text-on-surface">{plan.name}</h3>
                <p className="mt-1 text-body-sm text-on-surface-variant">{plan.tagline}</p>
              </div>
              {plan.highlighted ? <Badge variant="primary">{tc("popular")}</Badge> : null}
            </div>

            <div className="flex flex-col gap-4 p-6 pt-2">
              {isEditing ? (
                <>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{t("pricePerMonth")}</span>
                    <Input
                      type="number"
                      min={0}
                      step={10000}
                      disabled={plan.priceMonthly === null}
                      value={draft.price}
                      onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{t("studentSlots")}</span>
                    <Input
                      type="number"
                      min={0}
                      disabled={plan.studentSlots === "unlimited"}
                      value={draft.slots}
                      onChange={(e) => setDraft((d) => ({ ...d, slots: e.target.value }))}
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(plan.id)} className="flex-1">
                      <CheckOutlined /> {t("save")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <CloseOutlined />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-heading text-headline-lg text-on-surface">
                    {plan.priceMonthly === null ? tc("custom") : plan.priceMonthly === 0 ? "0đ" : formatCurrencyVND(plan.priceMonthly)}
                    {plan.priceMonthly ? <span className="font-body-sm text-body-sm text-on-surface-variant">{tc("perMonth")}</span> : null}
                  </p>
                  <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <TeamOutlined />{" "}
                    {plan.studentSlots === "unlimited"
                      ? t("unlimitedStudents")
                      : t("slotsStudents", { slots: plan.studentSlots })}
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(plan)}>
                    <EditOutlined /> {t("edit")}
                  </Button>
                </>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
