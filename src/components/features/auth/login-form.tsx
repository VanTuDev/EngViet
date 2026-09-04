"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GoogleOutlined, LoadingOutlined, LoginOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link, useRouter } from "@/i18n/navigation";
import { googleLoginUrl } from "@/lib/api/envelope";
import { loginWithPassword } from "@/lib/api/auth-actions";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(email: string, password: string) {
    setLoading(true);
    setError(null);
    const res = await loginWithPassword(email, password);
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

      <Tabs defaultValue={role} value={role} onValueChange={(v) => setRole(v as "teacher" | "student")} className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="teacher" className="flex-1">
            {t("roleTeacher")}
          </TabsTrigger>
          <TabsTrigger value="student" className="flex-1">
            {t("roleStudent")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teacher" className="mt-0">
          <AuthFields onSubmit={handleSubmit} loading={loading} />
        </TabsContent>
        <TabsContent value="student" className="mt-0">
          <AuthFields onSubmit={handleSubmit} loading={loading} />
        </TabsContent>
      </Tabs>

      {error ? <p className="mt-3 text-center font-label-sm text-label-sm text-error">{error}</p> : null}

      <div className="my-5 flex items-center gap-3 text-label-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant/60" />
        {t("orDivider")}
        <span className="h-px flex-1 bg-outline-variant/60" />
      </div>

      {/* Đăng nhập Google — điều hướng thẳng tới backend (`/auth/google`), gắn ?role theo tab đang chọn. */}
      <Button asChild variant="outline" className="w-full">
        <a href={googleLoginUrl(role)}>
          <GoogleOutlined />
          {t("googleButton")}
        </a>
      </Button>

      <p className="mt-6 text-center text-body-sm text-on-surface-variant">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-label-md text-label-md text-primary hover:underline">
          {t("registerLink")}
        </Link>{" "}
        ·{" "}
        <Link href="/join" className="font-label-md text-label-md text-primary hover:underline">
          {t("joinLink")}
        </Link>
      </p>
    </div>
  );
}

function AuthFields({
  onSubmit,
  loading,
}: {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
}) {
  const t = useTranslations("auth.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, password);
      }}
      className="mt-4 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
        {loading ? <LoadingOutlined spin /> : <LoginOutlined />}
        {t("submit")}
      </Button>
    </form>
  );
}
