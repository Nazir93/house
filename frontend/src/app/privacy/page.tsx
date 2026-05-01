import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, COMPANY } from "@/lib/constants";
import { loadContactConfig } from "@/lib/load-contact-config";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  robots: { index: false, follow: false },
};

export default async function PrivacyPage() {
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
          Политика конфиденциальности
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
          Действует с 1 января 2024 г. &middot; {COMPANY.shortName}
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              1. Общие положения
            </h2>
            <p>
              Настоящая политика конфиденциальности (далее — «Политика») определяет порядок
              обработки и защиты персональных данных пользователей сайта{" "}
              <a href={SITE_URL} className="underline" style={{ color: "var(--accent)" }}>{SITE_URL}</a>{" "}
              (далее — «Сайт»), принадлежащего {COMPANY.fullName} (ИНН {COMPANY.inn},
              ОГРНИП {COMPANY.ogrnip}), далее — «Оператор».
            </p>
            <p className="mt-3">
              Используя Сайт и/или отправляя свои персональные данные через формы обратной связи,
              пользователь выражает согласие с условиями данной Политики. В случае несогласия с условиями
              Политики пользователь должен прекратить использование Сайта.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              2. Персональные данные, подлежащие обработке
            </h2>
            <p>Оператор может обрабатывать следующие персональные данные пользователя:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Фамилия, имя, отчество</li>
              <li>Номер телефона</li>
              <li>Адрес электронной почты</li>
              <li>Описание объекта и параметры запроса (тип объекта, площадь, услуги)</li>
            </ul>
            <p className="mt-3">
              Оператор также автоматически получает данные, передаваемые устройством пользователя:
              IP-адрес, данные cookie-файлов, информация о браузере, операционной системе,
              время доступа, адреса запрашиваемых страниц.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              3. Цели обработки персональных данных
            </h2>
            <p>Персональные данные пользователя обрабатываются в следующих целях:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Обработка входящих запросов и связь с пользователем</li>
              <li>Предоставление консультации по услугам проектирования и строительства загородных домов</li>
              <li>Подготовка коммерческого предложения и расчёт стоимости</li>
              <li>Улучшение качества обслуживания и работы Сайта</li>
              <li>Проведение статистических и аналитических исследований</li>
              <li>Исполнение требований законодательства Российской Федерации</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              4. Правовые основания обработки
            </h2>
            <p>
              Обработка персональных данных осуществляется на основании:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»</li>
              <li>Согласия субъекта персональных данных на обработку</li>
              <li>Необходимости исполнения договора, стороной которого является субъект персональных данных</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              5. Защита персональных данных
            </h2>
            <p>
              Оператор принимает необходимые организационные и технические меры для защиты
              персональных данных от неправомерного или случайного доступа, уничтожения, изменения,
              блокирования, копирования, распространения, а также от иных неправомерных действий
              третьих лиц.
            </p>
            <p className="mt-3">
              Передача данных между пользователем и Сайтом осуществляется по защищённому
              протоколу HTTPS с использованием SSL-шифрования.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              6. Передача данных третьим лицам
            </h2>
            <p>
              Оператор не передаёт персональные данные третьим лицам, за исключением случаев:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Наличия явного согласия пользователя</li>
              <li>Требований законодательства Российской Федерации</li>
              <li>Необходимости защиты прав и законных интересов Оператора</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              7. Файлы cookie
            </h2>
            <p>
              Сайт использует файлы cookie для обеспечения корректной работы, анализа
              пользовательской активности и улучшения качества обслуживания. Используются
              следующие типы cookie:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong style={{ color: "var(--text)" }}>Необходимые</strong> — обеспечивают базовую функциональность Сайта (хранение темы, согласие на cookie)</li>
              <li><strong style={{ color: "var(--text)" }}>Аналитические</strong> — сбор анонимной статистики посещений (Яндекс.Метрика, Google Analytics)</li>
            </ul>
            <p className="mt-3">
              Пользователь может отключить использование файлов cookie в настройках своего браузера.
              Отключение cookie может повлиять на доступность отдельных функций Сайта.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              8. Сроки хранения данных
            </h2>
            <p>
              Персональные данные пользователей хранятся до момента достижения целей обработки
              или до получения запроса на удаление от субъекта персональных данных. Обработка
              персональных данных может быть прекращена по запросу пользователя — для этого
              необходимо направить письменный запрос на электронную почту Оператора.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              9. Права пользователя
            </h2>
            <p>Пользователь имеет право:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Получить информацию об обработке своих персональных данных</li>
              <li>Требовать уточнения, блокирования или уничтожения персональных данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
              <li>Обжаловать действия Оператора в Роскомнадзор</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3" style={{ color: "var(--text)" }}>
              10. Изменение политики
            </h2>
            <p>
              Оператор оставляет за собой право вносить изменения в настоящую Политику.
              Новая редакция вступает в силу с момента её публикации на Сайте. Продолжение
              использования Сайта после внесения изменений означает согласие пользователя
              с новой редакцией Политики.
            </p>
          </div>

          <div
            className="mt-12 p-6 rounded-2xl border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
          >
            <h2 className="text-lg font-heading font-bold mb-4" style={{ color: "var(--text)" }}>
              Контакты оператора
            </h2>
            <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <p>{COMPANY.fullName}</p>
              <p>ИНН: {COMPANY.inn} &middot; ОГРНИП: {COMPANY.ogrnip}</p>
              <p>Адрес: {COMPANY.postalAddress}</p>
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
