import { getTranslations } from "next-intl/server";
import { ReadOutlined, TeamOutlined } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ClassRoom } from "@/lib/types";

export async function ClassCard({ classRoom, href }: { classRoom: ClassRoom; href: string }) {
  const t = await getTranslations("dash.common");

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface/50 p-4 transition-colors hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-variant text-2xl text-primary">
          <ReadOutlined />
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface">{classRoom.name}</h4>
          <p className="mt-1 flex items-center gap-1 text-body-sm text-on-surface-variant">
            <TeamOutlined /> {t("studentsCount", { count: classRoom.studentCount })} · {t("codeShort", { code: classRoom.code })}
          </p>
        </div>
      </div>
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <Badge variant={classRoom.status === "active" ? "success" : "neutral"}>
          {classRoom.status === "active" ? t("statusActive") : t("statusArchived")}
        </Badge>
        <Button asChild variant="secondary" size="sm" className="flex-1 sm:flex-none">
          <Link href={href}>{t("open")}</Link>
        </Button>
      </div>
    </div>
  );
}
