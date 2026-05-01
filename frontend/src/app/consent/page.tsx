import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL, COMPANY } from "@/lib/constants";
import { loadContactConfig } from "@/lib/load-contact-config";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных",
  robots: { index: false, follow: false },
};

export default async function ConsentPage() {
  const contact = await loadContactConfig();
  return (
    <section
      className="pt-32 pb-20 min-h-screen"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div className="container mx-auto max-w-3xl px-5 sm:px-8 lg:pr-[80px]">
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-4"
          style={{ color: "var(--text-subtle)" }}
        >
          Юридическая информация
        </p>
        <h1
          className="text-3xl md:text-4xl font-heading font-bold mb-3"
          style={{ color: "var(--text)" }}
        >
          Согласие на обработку персональных данных
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
          В соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных»
        </p>

        <div className="space-y-6 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>

          <p>
            Пользователь, заполняя формы обратной связи на сайте{" "}
            <a href={SITE_URL} className="underline" style={{ color: "var(--accent)" }}>{SITE_URL}</a>,
            принимает настоящее Согласие на обработку персональных данных (далее — «Согласие»).
          </p>

          <p>
            Действуя свободно, своей волей и в своём интересе, а также подтверждая свою
            дееспособность, пользователь даёт своё согласие {COMPANY.fullName} (ИНН: {COMPANY.inn},
            ОГРНИП: {COMPANY.ogrnip}), адрес: {COMPANY.postalAddress}, далее — «Оператор», на обработку
            своих персональных данных со следующими условиями:
          </p>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              1. Перечень персональных данных
            </h2>
            <p>Согласие даётся на обработку следующих персональных данных:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Имя</li>
              <li>Номер телефона</li>
              <li>Адрес электронной почты</li>
              <li>Описание проекта/объекта, площадь, тип услуги и иные данные, добровольно указанные пользователем в формах</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              2. Цели обработки
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Обработка входящих заявок и обратная связь с пользователем</li>
              <li>Предоставление информации об услугах компании</li>
              <li>Подготовка коммерческого предложения и расчёт стоимости работ</li>
              <li>Заключение и исполнение договоров</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              3. Способы обработки
            </h2>
            <p>
              Обработка персональных данных осуществляется с использованием средств автоматизации
              и без использования таких средств. Обработка включает: сбор, запись, систематизацию,
              накопление, хранение, уточнение (обновление, изменение), извлечение, использование,
              передачу (предоставление, доступ), обезличивание, блокирование, удаление, уничтожение.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              4. Срок действия согласия
            </h2>
            <p>
              Настоящее Согласие действует бессрочно до момента его отзыва пользователем.
              Отзыв Согласия может быть осуществлён путём направления письменного заявления
              на электронную почту Оператора:{" "}
              <a href={`mailto:${contact.email}`} className="underline" style={{ color: "var(--accent)" }}>{contact.email}</a>.
            </p>
            <p className="mt-3">
              В случае отзыва Согласия Оператор вправе продолжить обработку персональных данных
              при наличии оснований, предусмотренных законодательством Российской Федерации.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              5. Передача данных
            </h2>
            <p>
              Оператор не передаёт персональные данные третьим лицам без согласия субъекта,
              за исключением случаев, предусмотренных законодательством Российской Федерации.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              6. Права субъекта
            </h2>
            <p>
              Субъект персональных данных имеет право на получение сведений об обработке
              своих данных, требовать их уточнения, блокирования или уничтожения в случае,
              если данные являются неполными, устаревшими, неточными, незаконно полученными
              или не являются необходимыми для заявленной цели обработки.
            </p>
          </div>

          <div
            className="mt-8 p-6 rounded-2xl border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
          >
            <p className="text-sm mb-3" style={{ color: "var(--text)" }}>
              Отправляя форму на сайте, вы подтверждаете, что ознакомились с{" "}
              <Link href="/privacy" className="underline" style={{ color: "var(--accent)" }}>
                Политикой конфиденциальности
              </Link>{" "}
              и даёте согласие на обработку персональных данных.
            </p>
            <div className="text-sm space-y-1" style={{ color: "var(--text-muted)" }}>
              <p>
                Телефон:{" "}
                <a href={`tel:${contact.phone.replace(/\D/g, "")}`} className="underline" style={{ color: "var(--accent)" }}>{contact.phone}</a>
                {" / "}
                <a href={`tel:${contact.phone2.replace(/\D/g, "")}`} className="underline" style={{ color: "var(--accent)" }}>{contact.phone2}</a>
              </p>
              <p>
                Email:{" "}
                <a href={`mailto:${contact.email}`} className="underline" style={{ color: "var(--accent)" }}>{contact.email}</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
