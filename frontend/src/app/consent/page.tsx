import type { Metadata } from "next";
import Link from "next/link";
import { LegalOperatorCard } from "@/components/legal/legal-operator-card";
import { companyRegistrationLegalSuffix } from "@/lib/company-requisites";
import { loadContactConfig } from "@/lib/load-contact-config";
import { getPublicSiteUrl, LEGAL_DOCUMENT_EFFECTIVE_DATE } from "@/lib/legal-site";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных",
  description:
    "Согласие на обработку персональных данных при отправке заявок и использовании сайта chastdushi.ru. Цели обработки, срок действия и права субъекта по 152-ФЗ.",
  robots: { index: true, follow: true },
};

export default async function ConsentPage() {
  const contact = await loadContactConfig();
  const co = contact.company;
  const siteUrl = getPublicSiteUrl();
  const consentOperator =
    co.fullName.trim() && co.inn.trim()
      ? `${co.fullName} (ИНН: ${co.inn}${companyRegistrationLegalSuffix(co)}), адрес: ${co.postalAddress.trim() || contact.address.trim() || "—"}`
      : "оператор персональных данных (реквизиты — в разделе «Контакты» и в Политике)";

  return (
    <section
      className="page-top-offset pb-20 min-h-screen"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div className="container mx-auto max-w-3xl px-5 sm:px-8 lg:pr-[80px]">
        <p className="text-[10px] uppercase tracking-[0.25em] mb-4" style={{ color: "var(--text-subtle)" }}>
          Юридическая информация
        </p>
        <h1 className="mb-3 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl" style={{ color: "var(--text)" }}>
          Согласие на обработку персональных данных
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
          В соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» · актуально с{" "}
          {LEGAL_DOCUMENT_EFFECTIVE_DATE}
        </p>

        <div className="space-y-6 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <p>
            Пользователь, заполняя формы на сайте{" "}
            <a href={siteUrl} className="underline" style={{ color: "var(--accent)" }}>{siteUrl}</a>, принимает
            настоящее Согласие на обработку персональных данных (далее — «Согласие») и подтверждает, что
            ознакомился с{" "}
            <Link href="/privacy" className="underline" style={{ color: "var(--accent)" }}>
              Политикой в отношении обработки персональных данных
            </Link>
            .
          </p>

          <p>
            Действуя свободно, своей волей и в своём интересе, подтверждая дееспособность, пользователь даёт
            согласие {consentOperator}, далее — «Оператор», на обработку персональных данных на следующих
            условиях:
          </p>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              1. Перечень персональных данных
            </h2>
            <p>Согласие даётся на обработку следующих персональных данных:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>имя (фамилия, отчество — при указании);</li>
              <li>номер телефона;</li>
              <li>адрес электронной почты;</li>
              <li>описание проекта, объекта, площади, услуги и иные данные, добровольно указанные в формах;</li>
              <li>технические данные (IP-адрес, cookie, данные браузера) — при использовании Сайта.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              2. Цели обработки
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>обработка заявок и обратная связь;</li>
              <li>консультации и расчёт стоимости работ;</li>
              <li>подготовка коммерческих предложений;</li>
              <li>заключение и исполнение договоров;</li>
              <li>ведение личного кабинета клиента (при предоставлении доступа).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              3. Действия с персональными данными
            </h2>
            <p>
              Обработка включает: сбор, записи, систематизацию, накопление, хранение, уточнение (обновление,
              изменение), извлечение, использование, передачу (предоставление, доступ), обезличивание,
              блокирование, удаление, уничтожение — с использованием средств автоматизации и без них.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              4. Срок действия и отзыв согласия
            </h2>
            <p>
              Согласие действует до достижения целей обработки или до отзыва. Отзыв направляется Оператору
              {contact.email.trim() ? (
                <>
                  {" "}
                  на email{" "}
                  <a href={`mailto:${contact.email}`} className="underline" style={{ color: "var(--accent)" }}>
                    {contact.email}
                  </a>
                </>
              ) : (
                " (контакты — в разделе «Контакты»)"
              )}
              . При отзыве Оператор может продолжить обработку при наличии оснований, предусмотренных 152-ФЗ.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              5. Передача данных
            </h2>
            <p>
              Оператор может поручать обработку уполномоченным третьим лицам (хостинг, почта, CRM, аналитика) и
              передавать данные государственным органам в случаях, предусмотренных законом.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              6. Права субъекта
            </h2>
            <p>
              Субъект вправе получать информацию об обработке, требовать уточнения, блокирования или уничтожения
              ПДн, отозвать согласие и обжаловать действия Оператора в Роскомнадзор или суд.
            </p>
          </div>

          <div
            className="mt-8 p-6 rounded-2xl border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
          >
            <p className="text-sm mb-3" style={{ color: "var(--text)" }}>
              Отправляя форму на Сайте, вы подтверждаете согласие с настоящим документом и{" "}
              <Link href="/privacy" className="underline" style={{ color: "var(--accent)" }}>
                Политикой конфиденциальности
              </Link>
              .
            </p>
          </div>

          <LegalOperatorCard contact={contact} />
        </div>
      </div>
    </section>
  );
}
