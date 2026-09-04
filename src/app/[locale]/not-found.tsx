import { useTranslations } from "next-intl";
import { CompassOutlined } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tc = useTranslations("common");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-margin-mobile text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/15 text-3xl text-primary">
        <CompassOutlined />
      </div>
      <h1 className="font-heading text-headline-lg text-on-surface">{t("title")}</h1>
      <p className="max-w-sm text-body-md text-on-surface-variant">{t("description")}</p>
      <Button asChild className="mt-2">
        <Link href="/">{tc("backToHome")}</Link>
      </Button>
    </div>
  );
}
