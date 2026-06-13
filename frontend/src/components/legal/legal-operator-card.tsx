import type { ContactConfig } from "@/lib/contact-config";

export function LegalOperatorCard({ contact }: { contact: ContactConfig }) {
  const co = contact.company;

  return (
    <div
      className="mt-12 p-6 rounded-2xl border"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
    >
      <h2 className="text-lg font-heading font-bold mb-4" style={{ color: "var(--text)" }}>
        Сведения об операторе персональных данных
      </h2>
      <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
        {co.fullName.trim() ? <p>{co.fullName}</p> : null}
        {co.shortName.trim() && co.shortName !== co.fullName ? <p>{co.shortName}</p> : null}
        {co.inn.trim() || co.ogrnip.trim() ? (
          <p>
            {co.inn.trim() ? <>ИНН: {co.inn}</> : null}
            {co.inn.trim() && co.ogrnip.trim() ? " · " : null}
            {co.ogrnip.trim() ? <>ОГРНИП: {co.ogrnip}</> : null}
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
        ) : (
          <p>
            Email для обращений по персональным данным: укажите в разделе{" "}
            <a href="/contacts" className="underline" style={{ color: "var(--accent)" }}>«Контакты»</a> или в
            админке «Настройки сайта».
          </p>
        )}
        {contact.workingHours.trim() ? <p>Режим работы: {contact.workingHours}</p> : null}
      </div>
    </div>
  );
}
