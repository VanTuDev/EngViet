import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Avatar } from "antd";
import { ReadOutlined, TeamOutlined } from "@/components/icons";
import { JoinByCodeButton } from "@/components/features/auth/join-by-code-button";
import { getClassByCode } from "@/lib/api/classes";
import { buildMetadata } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale, code } = await params;
  const t = await getTranslations({ locale, namespace: "auth.joinByCode" });
  const classRoom = await getClassByCode(code);
  return buildMetadata({
    title: classRoom ? t("metaTitleValid", { name: classRoom.name }) : t("metaTitleInvalid"),
    description: t("metaDescription"),
    path: `/join/${code}`,
    locale: locale as AppLocale,
    noIndex: true,
  });
}

/**
 * Trang đích của mã QR mà giáo viên chiếu lên (`ClassQrModal` mã hoá đúng URL
 * này). Camera điện thoại của học sinh mở thẳng trang này — không cần app,
 * không cần gõ — chỉ xác nhận là vào lớp.
 */
export default async function JoinByCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const t = await getTranslations("auth.joinByCode");
  const classRoom = await getClassByCode(code);

  if (!classRoom) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 className="font-heading text-headline-md text-on-surface">{t("invalidTitle")}</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {t("invalidBody", { code: code.toUpperCase() })}
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <Avatar size={64} icon={<ReadOutlined />} style={{ backgroundColor: "#2563eb" }} />
      <h1 className="mt-4 font-heading text-headline-md text-on-surface">{classRoom.name}</h1>
      {classRoom.description ? <p className="mt-1 text-body-sm text-on-surface-variant">{classRoom.description}</p> : null}
      <p className="mt-3 flex items-center justify-center gap-1.5 text-body-sm text-on-surface-variant">
        <TeamOutlined /> {t("studentsAndTeacher", { count: classRoom.studentCount, teacher: classRoom.teacherName ?? "" })}
      </p>

      <div className="mt-6">
        <JoinByCodeButton code={classRoom.code} />
      </div>
    </div>
  );
}
