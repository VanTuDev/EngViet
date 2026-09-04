import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LoadingOutlined } from "@/components/icons";
import { AuthCallbackRunner } from "@/components/features/auth/auth-callback-runner";

/**
 * Trang đích sau khi Google redirect về (`${FRONTEND_URL}/auth/callback?code=...`).
 * Một client leaf gọi Server Action `establishSessionFromCode` (chạy trong ngữ
 * cảnh action nên đặt được cookie httpOnly), rồi điều hướng vào dashboard.
 */
export const dynamic = "force-dynamic";

export default async function AuthCallbackPage() {
  const t = await getTranslations("auth.callback");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-container-low px-margin-mobile text-center">
      <Suspense
        fallback={
          <>
            <LoadingOutlined spin className="text-3xl text-primary" />
            <p className="text-body-md text-on-surface-variant">{t("signingIn")}</p>
          </>
        }
      >
        <AuthCallbackRunner />
      </Suspense>
    </div>
  );
}
