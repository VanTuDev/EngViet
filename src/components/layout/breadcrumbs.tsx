import { RightOutlined } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/structured-data";
import { Link } from "@/i18n/navigation";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items.map((i) => ({ name: i.label, path: i.href ?? "/" })))} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
        {items.map((item, index) => (
          <span key={item.label} className="flex items-center gap-1.5">
            {index > 0 ? <RightOutlined className="text-[10px]" aria-hidden="true" /> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-on-surface">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
