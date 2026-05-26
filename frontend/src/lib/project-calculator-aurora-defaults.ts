import type { ProjectCalculatorUi } from "@/lib/project-calculator-types";

/** Сериализованный пресет для вставки в админке (calculatorJson). */
export function auroraCalculatorPresetJson(pretty = true): string {
  return JSON.stringify(AURORA_PROJECT_CALCULATOR_UI, null, pretty ? 2 : 0);
}

const IMG = "/images/banner/banner-hero-01.png";

/** Тексты этапов из PDF «Для сайта / калькулятор» (типовой авторский проект, уровни газоблок / керамоблок / кирпич). */
export const AURORA_PROJECT_CALCULATOR_UI: ProjectCalculatorUi = {
  partOfSoul: {
    enabled: true,
    smallHouseThresholdSqm: 100,
    shellSurchargeUnderThreshold: 0.15,
    addonsSurchargeUnderThreshold: 0.1,
    defaultRoof: "dual",
  },
  consultation: {
    name: "Специалист по комплектации",
    role: "Консультация по проекту и смете",
    online: true,
  },
  transportBands: [
    { id: "unk", label: "Неизвестно (индивид. расчёт в смете)", percent: 0 },
    { id: "30", label: "до 30 км", percent: 1.5 },
    { id: "40", label: "до 40 км", percent: 2.25 },
    { id: "50", label: "до 50 км", percent: 3 },
    { id: "100", label: "до 100 км", percent: 6.5 },
  ],
  stages: {
    prep: {
      imageUrl: IMG,
      rows: [
        { label: "Проект дома", value: "Разработка индивидуального проекта." },
        { label: "Комплект документов", value: "Подготовка комплекта документов для согласования в БТИ." },
        { label: "Оценка стройплощадки", value: "Предварительный выезд инженера на объект." },
      ],
    },
    foundation: {
      imageUrl: IMG,
      rows: [
        {
          label: "Монолитная утеплённая плита",
          value:
            "Толщина плиты 300–500 мм, выборка котлована, геотекстиль, песчаная подушка с трамбованием, гидроизоляция, пеноплекс 50 мм, двойной арматурный каркас 200×200 мм (Ø12 А-III, защитный слой 30–50 мм, П-шки Ø8 А-I), бетон М300 заводского изготовления, закладные под воду/электричество/канализацию, вибрирование, обмазочная гидроизоляция торцов в 2 слоя.",
        },
        {
          label: "Гидроизоляция",
          value: "Двойная гидроизоляция фундамента битумной мастикой.",
        },
      ],
    },
    floors: {
      imageUrl: IMG,
      rows: [
        {
          label: "Перекрытия",
          value:
            "Межэтажное: плиты шириной 1 / 1,2 / 1,5 м, длина до 9 м, утепление торцов, заделка швов. Либо чердачное (при отсутствии мансарды): балки с шагом 58 см, длина до 4,5 м, биозащита, гидроизоляция опорных концов — по несущей схеме дома.",
        },
      ],
    },
    roof: {
      imageUrl: IMG,
      rows: [
        {
          label: "Кровля",
          value:
            "Антисептирование деревянных элементов, мауэрлат 50×200 (два слоя на шпильки), стропила 50×200 шаг 580 мм, обрешётка 25×100, контробрешётка 50×50, металлочерепица (гарантия завода 20 лет), фасонные элементы, вентвыходы в цвет кровли, оцинкованный крепёж.",
        },
      ],
    },
    windows: {
      imageUrl: IMG,
      rows: [
        {
          label: "Окна",
          value:
            "Двухкамерный стеклопакет (3 стекла), 5‑камерный профиль ПВХ REHAU стандартных размеров, толщина 70 мм, белый цвет; москитные сетки, подоконники ПВХ, белые металлические отливы.",
        },
      ],
    },
    doors: {
      imageUrl: IMG,
      rows: [
        {
          label: "Двери наружные",
          value:
            "Входная металлическая дверь с зимним утеплителем, производство РФ; 4 класс взломостойкости; замковая часть 3 мм; терморазрыв, уличное исполнение.",
        },
      ],
    },
  },
  stagesByTier: {
    gas: {
      walls: {
        imageUrl: IMG,
        rows: [
          {
            label: "Несущие и перегородки",
            value:
              "Несущие стены из газобетона 375 мм (D400). Армирование: первый ряд, далее каждый 3‑й ряд, под окнами с заходом 0,5 м от края откоса; кладка на клей при t до −15 °С. Обработка проёмов, перемычки U‑блок или уголки 100×100×10 и 75×75×8, монолитный пояс под перекрытие (Бетон М300, Ø12 А-III, хомуты Ø8 А-I), вентканалы; перегородки газобетон 100 мм (D500), замазка швов.",
          },
        ],
      },
      belt: {
        imageUrl: IMG,
        rows: [
          {
            label: "Монолитный пояс",
            value:
              "Сечение 225×250 мм: несъёмная опалубка с наружной стороны газоблок 100 мм + пеноплекс 50 мм, снутри деревянная щитовая. Арматура Ø12 А-III (защита 30 мм), угловые Ø12 А-III, хомуты Ø8 А-I шаг 200–300 мм, бетон М300, вибрирование, уход за бетоном, съём деревянной опалубки (вариант 175×250 мм возможен по проекту).",
          },
        ],
      },
    },
    ceramic: {
      walls: {
        imageUrl: IMG,
        rows: [
          {
            label: "Несущие и перегородки",
            value:
              "Керамические блоки перегородки 380 мм; армирование по ГОСТ; кладка на раствор; обработка проёмов, перемычки ЖБИ; монолитный пояс или три ряда плотного кирпича (М300, Ø12 А-III); вентканалы; перегородки из двойного кирпича 2НФ.",
          },
        ],
      },
      belt: {
        imageUrl: IMG,
        rows: [
          {
            label: "Монолитный пояс",
            value:
              "Сечение 210×225 мм; несъёмная опалубка керамика 2,1 NF + 1 NF + пеноплекс 50 мм снаружи, деревянная щита снутри; арматура Ø12 А-III, хомуты Ø8 А-I шаг 200–300 мм, бетон М300.",
          },
        ],
      },
    },
    brick: {
      walls: {
        imageUrl: IMG,
        rows: [
          {
            label: "Несущие и перегородки",
            value:
              "Несущие стены из кирпича 2,1 NF (380 мм), армирование каждый 3‑й ряд Ø6 мм, кладка на ЦПС; проём и перемычки ЖБИ; монолитные пояса под пролёты или три ряда плотного кирпича; вентканалы; перегородки в полкирпича 120 мм; чердачное перекрытие брус 50×200 шаг 580 мм (по проекту).",
          },
        ],
      },
      belt: {
        imageUrl: IMG,
        rows: [
          {
            label: "Монолитный пояс",
            value:
              "Сечение 210×225 мм; несъёмная опалубка керамика 2,1 NF + 1 NF + пеноплекс 50 мм снаружи, деревянная щита снутри; арматура Ø12 А-III, хомуты Ø8 А-I, бетон М300.",
          },
        ],
      },
    },
  },
  addons: [
    {
      title: "Инженерные коммуникации",
      items: [
        {
          id: "el",
          name: "Электроснабжение",
          description: "Ставки из PDF зависят от этажности; считаются за м² строительной площади дома из карточки.",
          price: 0,
          partOfSoulAddon: { kind: "engineering", code: "electric" },
          imageUrl: "/images/banner/banner-hero-03.png",
        },
        {
          id: "water",
          name: "Разводка воды по дому",
          description: "Холодная и горячая вода — разводка по типовой схеме, уточняется при замере.",
          price: 0,
          partOfSoulAddon: { kind: "engineering", code: "water" },
          imageUrl: "/images/banner/banner-hero-04.png",
        },
        {
          id: "sew",
          name: "Канализация",
          description: "Внутренняя канализация и подключение к выбранной системе удаления стоков.",
          price: 0,
          partOfSoulAddon: { kind: "engineering", code: "sewer" },
          imageUrl: "/images/banner/banner-hero-05.png",
        },
        {
          id: "bio",
          name: "Станция биоочистки",
          description: "Фиксированная позиция по PDF (выбор модели — на консультации).",
          price: 0,
          partOfSoulAddon: { kind: "engineering", code: "bio" },
          imageUrl: "/images/banner/banner-hero-06.png",
        },
        {
          id: "rad",
          name: "Радиаторы",
          description: "Поставка и разводка приборов отопления (базовая комплектация по PDF за м²).",
          price: 0,
          partOfSoulAddon: { kind: "engineering", code: "radiators" },
          imageUrl: "/images/banner/banner-hero-01.png",
        },
        {
          id: "floor",
          name: "Тёплый пол",
          description: "Водяной тёплый пол первого этажа — ставка за м² из PDF для выбранной этажности.",
          price: 0,
          partOfSoulAddon: { kind: "engineering", code: "heatedFloor" },
          imageUrl: "/images/banner/banner-hero-02.png",
        },
        {
          id: "boiler",
          name: "Котельная",
          description: "Узел котельной и обвязка — фиксированная сумма по PDF.",
          price: 0,
          partOfSoulAddon: { kind: "engineering", code: "boiler" },
          imageUrl: "/images/banner/banner-hero-03.png",
        },
      ],
    },
    {
      title: "Отделка фасада",
      items: [
        {
          id: "fac_brick",
          name: "Облицовка кирпичом",
          description: "Для 1 этажа: ставка за м² по PDF; зависит от выбранного типа кровли (двухскатная / трёхскатная).",
          price: 0,
          partOfSoulAddon: { kind: "facade", variant: "brick" },
          imageUrl: "/images/banner/banner-hero-04.png",
        },
        {
          id: "fac_plaster",
          name: "Штукатурка с утеплением",
          description: "Ставка за м² строительной площади (PDF, 1 этаж).",
          price: 0,
          partOfSoulAddon: { kind: "facade", variant: "plaster" },
          imageUrl: "/images/banner/banner-hero-05.png",
        },
        {
          id: "fac_thermo",
          name: "Термопанели",
          description: "Ставка за м² строительной площади (PDF, 1 этаж).",
          price: 0,
          partOfSoulAddon: { kind: "facade", variant: "thermo" },
          imageUrl: "/images/banner/banner-hero-06.png",
        },
        {
          id: "fac_brick_ins",
          name: "Облицовка кирпичом с утеплением",
          description: "Ставка за м² строительной площади (PDF, 1 этаж).",
          price: 0,
          partOfSoulAddon: { kind: "facade", variant: "brick_insulated" },
          imageUrl: "/images/banner/banner-hero-01.png",
        },
      ],
    },
    {
      title: "Внутренняя отделка стен",
      items: [],
    },
    {
      title: "Дополнительные услуги",
      items: [],
    },
  ],
};
