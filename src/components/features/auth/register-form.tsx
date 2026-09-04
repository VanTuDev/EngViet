"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GoogleOutlined, LoadingOutlined, UserAddOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useRouter } from "@/i18n/navigation";
import { googleLoginUrl } from "@/lib/api/envelope";
import { registerAccount } from "@/lib/api/auth-actions";

/** Nền tảng UC01 — cần tài khoản giáo viên miễn phí trước khi mua gói (học sinh cũng đăng ký được ở đây). */
export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth.register");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await registerAccount({ email, password, fullName, role });
    if (res.ok && res.role) {
      router.replace(`/${res.role}/dashboard`);
      router.refresh();
    } else {
      setError(res.error ?? t("failed"));
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-headline-md text-on-surface">{t("title")}</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">{t("subtitle")}</p>

      <Tabs value={role} onValueChange={(v) => setRole(v as "teacher" | "student")} defaultValue={role} className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="teacher" className="flex-1">
            {t("roleTeacher")}
          </TabsTrigger>
          <TabsTrigger value="student" className="flex-1">
            {t("roleStudent")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">{t("nameLabel")}</Label>
          <Input id="fullName" required placeholder={t("namePlaceholder")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input id="email" type="email" required placeholder={t("emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("passwordLabel")}</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? <LoadingOutlined spin /> : <UserAddOutlined />}
          {t("submit")}
        </Button>
      </form>

      {error ? <p className="mt-3 text-center font-label-sm text-label-sm text-error">{error}</p> : null}

      <div className="my-5 flex items-center gap-3 text-label-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant/60" />
        {t("orDivider")}
        <span className="h-px flex-1 bg-outline-variant/60" />
      </div>

      <Button asChild variant="outline" className="w-full">
        <a href={googleLoginUrl(role)}>
          <GoogleOutlined />
          {t("googleButton")}
        </a>
      </Button>

      <p className="mt-6 text-center text-body-sm text-on-surface-variant">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-label-md text-label-md text-primary hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
