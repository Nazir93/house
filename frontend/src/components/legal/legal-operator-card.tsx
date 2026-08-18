import type { ContactConfig } from "@/lib/contact-config";
import {
  companyRegistrationLabels,
  keepBrandNameTogether,
  normalizeCompanyWebsiteUrl,
} from "@/lib/company-requisites";

export function LegalOperatorCard({ contact }: { contact: ContactConfig }) {
  const co = contact.company;
  const registration = companyRegistrationLabels(co);
  const websiteHref = normalizeCompanyWebsiteUrl(co.website);

  return (
    <div
      className="mt-12 p-6 rounded-2xl border"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
    >
      <h2 className="text-lg font-heading font-bold mb-4" style={{ color: "var(--text)" }}>
        Сведения об операторе персональных данных
      </h2>
      <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
        {co.fullName.trim() ? (
          <p className="hyphens-none text-pretty break-words">{keepBrandNameTogether(co.fullName)}</p>
        ) : null}
        {co.shortName.trim() && co.shortName !== co.fullName ? (
          <p className="hyphens-none text-pretty break-words">{keepBrandNameTogether(co.shortName)}</p>
        ) : null}
        {co.inn.trim() || registration.length ? (
          <p>
            {[
              co.inn.trim() ? `ИНН: ${co.inn}` : null,
              ...registration.map((row) => `${row.label}: ${row.value}`),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
        {websiteHref ? (
          <p>
            Ссылка:{" "}
            <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--accent)" }}>
              {co.website.trim() || websiteHref}
            </a>
          </p>
        ) : null}
        {co.postalAddress.trim() ? <p>Адрес: {co.postalAddress}</p> : null}
        {contact.address.trim() ? <p>Адрес офиса: {contact.address}</p> : null}
        {contact.phone.trim() || contact.phone2.trim() ? (
          <p>
            Телефон:{" "}
            {contact.phone.trim() ? (
              <a href={`tel:${contact.phoneRaw}`} className="underline" style={{ color: "var(--accent)" }}>
                {contact.phone}
              </a>
            ) : null}
            {contact.phone.trim() && contact.phone2.trim() ? " / " : null}
            {contact.phone2.trim() ? (
              <a href={`tel:${contact.phone2Raw}`} className="underline" style={{ color: "var(--accent)" }}>
                {contact.phone2}
              </a>
            ) : null}
          </p>
        ) : null}
        {contact.email.trim() ? (
          <p>
            Email для обращений по персональным данным:{" "}
            <a href={`mailto:${contact.email}`} className="underline" style={{ color: "var(--accent)" }}>
              {contact.email}
            </a>
          </p>
        ) : null}
        {contact.workingHours.trim() ? <p>Режим работы: {contact.workingHours}</p> : null}
      </div>
    </div>
  );
}
