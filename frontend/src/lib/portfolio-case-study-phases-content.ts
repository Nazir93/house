import type { CaseStudyTier1Chip } from "@/lib/portfolio-case-study";

/** Заготовки разделов (чипы + подпункты) под каждый этап таймлайна — редактируйте здесь или подставляйте из БД позже. */
export function getTier1ContentForPhase(phaseId: string): CaseStudyTier1Chip[] {
  const full = PHASE_TIERS[phaseId];
  if (full && full.length > 0) return full;
  return genericPhaseTiers(phaseId);
}

const genericPhaseTiers = (phaseId: string): CaseStudyTier1Chip[] => [
  {
    id: `${phaseId}-work`,
    label: "Этапы работ",
    tier2: [
      {
        id: `${phaseId}-prep`,
        label: "Подготовительные работы",
        description: "Разметка, подготовка основания и согласование объёма работ.",
      },
      {
        id: `${phaseId}-exec`,
        label: "Основной монтаж / выполнение",
        description: "Работы по разделу согласно проекту и графику.",
      },
      {
        id: `${phaseId}-qa`,
        label: "Контроль и приёмка",
        description: "Промежуточная приёмка узлов, фотоотчёт, передача исполнительной документации.",
      },
    ],
  },
];

const PHASE_TIERS: Record<string, CaseStudyTier1Chip[]> = {
  foundation: [
    {
      id: "found-slab",
      label: "Плита",
      tier2: [
        {
          id: "found-sand",
          label: "Устройство песчаного основания",
          description: "Подготовка основания под монолитную плиту.",
        },
        {
          id: "found-piles",
          label: "Свайное поле",
          description: "Устройство свай, разбивка оголовков.",
        },
        {
          id: "found-reinf",
          label: "Армирование и опалубка",
          description: "Монтаж арматурного каркаса и щиты опалубки.",
        },
        {
          id: "found-itn-arm",
          label: "Приёмка армокаркаса ИТН",
          description: "Освидетельствование армирования перед заливкой.",
        },
        {
          id: "found-concrete",
          label: "Укладка бетона",
          description: "Заливка и уход за бетоном в наборе прочности.",
        },
        {
          id: "found-seams",
          label: "Зачеканка швов",
          description: "При необходимости — гидроизоляция и заделка швов.",
        },
      ],
    },
    {
      id: "found-grillage",
      label: "Ростверк",
      tier2: [
        {
          id: "found-gr-mark",
          label: "Разметка осей ростверка",
          description: "Вынос осей на участок.",
        },
        {
          id: "found-gr-form",
          label: "Опалубка и армирование ростверка",
          description: "Устройство монолитного ростверка.",
        },
        {
          id: "found-gr-beton",
          label: "Бетонирование",
          description: "Заливка и контроль усадочных швов.",
        },
      ],
    },
  ],

  walls: [
    {
      id: "walls-type",
      label: "Монтаж стен",
      tier2: [
        {
          id: "walls-ext",
          label: "Монтаж несущих стен",
          description: "Возведение внешних стен, перемычек, армопояса по проекту.",
        },
        {
          id: "walls-lintels",
          label: "Оконные и дверные перемычки",
          description: "Устройство закладных и перемычек под проёмы.",
        },
        {
          id: "walls-insulation",
          label: "Утепление и узлы примыканий",
          description: "По спецификации проекта.",
        },
      ],
    },
  ],

  roof: [
    {
      id: "roof-stages",
      label: "Этапы работ",
      tier2: [
        {
          id: "roof-rafters",
          label: "Монтаж стропильной системы",
          description: "Установка стропил, балок, обрешётки.",
        },
        {
          id: "roof-cake",
          label: "Кровельный пирог",
          description: "Пароизоляция, утепление, контробрешётка.",
        },
        {
          id: "roof-cover",
          label: "Настил кровельного покрытия",
          description: "Металлочерепица / мягкая кровля по выбору.",
        },
        {
          id: "roof-skylight",
          label: "Монтаж мансардных окон",
          description: "При наличии в проекте.",
        },
      ],
    },
    {
      id: "roof-types",
      label: "Виды кровли",
      tier2: [
        {
          id: "roof-metal",
          label: "Металлочерепица",
          description: "Металлическое профилированное покрытие под черепицу.",
        },
        {
          id: "roof-soft",
          label: "Мягкая кровля",
          description: "Подбор слоёв под угол скатов.",
        },
        {
          id: "roof-tile",
          label: "Натуральная / композитная черепица",
          description: "Монтаж по инструкции производителя.",
        },
      ],
    },
  ],

  windows: [
    {
      id: "win-tab",
      label: "Этапы работ",
      tier2: [
        {
          id: "win-mount",
          label: "Монтаж оконных блоков",
          description: "Монтаж оконных изделий, временная входная дверь при необходимости.",
        },
        {
          id: "win-slopes",
          label: "Отливы и примыкания",
          description: "Гидроизоляция примыканий к стенам.",
        },
      ],
    },
    {
      id: "win-video",
      label: "Видеообзор",
      tier2: [
        {
          id: "win-v1",
          label: "Обход готовых проёмков",
          description: "Контроль геометрии и установки.",
        },
      ],
    },
  ],

  partitions: [
    {
      id: "part-mat",
      label: "Материалы перегородок",
      tier2: [
        { id: "part-metal", label: "Металлические каркасы", description: "ГКЛ, звукоизоляция." },
        { id: "part-brick", label: "Кирпичные / керамические перегородки", description: "Кладка по осевым." },
        { id: "part-poro", label: "Porotherm / газобетон", description: "Тонкошовная кладка." },
      ],
    },
    {
      id: "part-work",
      label: "Работы",
      tier2: [
        {
          id: "part-hydro",
          label: "Гидроизоляция и разметка",
          description: "Укладка гидроизоляции в мокрых зонах.",
        },
        {
          id: "part-mortar",
          label: "Монтаж на раствор",
          description: "Кладка на специальный состав.",
        },
        {
          id: "part-itn",
          label: "Сдача ИТН",
          description: "Промежуточная приёмка скрытых работ.",
        },
      ],
    },
  ],

  mep: [
    {
      id: "mep-heat",
      label: "Отопление",
      tier2: [
        { id: "mep-rad", label: "Разметка радиаторов и конвекторов" },
        { id: "mep-pipe", label: "Разводка трасс отопления" },
        { id: "mep-collector", label: "Коллекторные узлы" },
      ],
    },
    {
      id: "mep-water",
      label: "Водоснабжение",
      tier2: [
        { id: "mep-w1", label: "Разметка водорозеток и скрытых смесителей" },
        { id: "mep-w2", label: "Монтаж коллекторов и запорной арматуры" },
        { id: "mep-w3", label: "Опрессовка и промывка" },
      ],
    },
    {
      id: "mep-sew",
      label: "Канализация",
      tier2: [
        { id: "mep-s1", label: "Разметка точек канализации" },
        { id: "mep-s2", label: "Укладка трасс" },
        { id: "mep-s3", label: "Гидроиспытания" },
      ],
    },
    {
      id: "mep-vent",
      label: "Вентиляция",
      tier2: [
        { id: "mep-v1", label: "Разметка воздуховодов" },
        { id: "mep-v2", label: "Монтаж воздуховодов и рекуператора" },
      ],
    },
  ],

  "prep-base": [
    {
      id: "prep-main",
      label: "Подготовка основания",
      tier2: [
        {
          id: "prep-1",
          label: "Выравнивание основания",
          description: "Планировка и уплотнение под инженерные коммуникации.",
        },
        {
          id: "prep-2",
          label: "Разметка трасс",
          description: "Вынос трасс под инженерию.",
        },
        {
          id: "prep-3",
          label: "Защита перекрытий",
          description: "Временная защита при проходе коммуникаций.",
        },
      ],
    },
  ],

  electrical: [
    {
      id: "el-main",
      label: "Электрика",
      tier2: [
        { id: "el-1", label: "Штробление и закладные" },
        { id: "el-2", label: "Монтаж кабельных трасс" },
        { id: "el-3", label: "Сборка щитового оборудования" },
        { id: "el-4", label: "Освещение и розеточные группы" },
      ],
    },
  ],

  floors: [
    {
      id: "fl-main",
      label: "Полы по этапам",
      tier2: [
        { id: "fl-1", label: "Полы по грунту", description: "Подготовка и стяжка." },
        { id: "fl-2", label: "Пол по плите", description: "Звукоизоляция, стяжка, тёплый пол." },
        { id: "fl-3", label: "Чистовое покрытие", description: "По проекту отделки." },
      ],
    },
  ],

  facade: [
    {
      id: "fac-main",
      label: "Фасадные работы",
      tier2: [
        { id: "fac-1", label: "Подсистема и утепление" },
        { id: "fac-2", label: "Облицовка", description: "Кирпич, плитка, штукатурка." },
        { id: "fac-3", label: "Отливы и цоколь" },
      ],
    },
  ],

  "blind-area": [
    {
      id: "ba-main",
      label: "Отмостка и ливнёвка",
      tier2: [
        { id: "ba-1", label: "Подготовка контура здания" },
        { id: "ba-2", label: "Устройство отмостки" },
        { id: "ba-3", label: "Ливневая канализация" },
      ],
    },
  ],

  landscaping: [
    {
      id: "ls-main",
      label: "Благоустройство",
      tier2: [
        { id: "ls-1", label: "Планировка территории" },
        { id: "ls-2", label: "Покрытия и освещение" },
      ],
    },
  ],

  "external-networks": [
    {
      id: "en-main",
      label: "Наружные сети",
      tier2: [
        { id: "en-1", label: "Водопровод и канализация до границы" },
        { id: "en-2", label: "Электроснабжение" },
        { id: "en-3", label: "Газопровод", description: "При наличии проекта." },
      ],
    },
  ],

  "ext-vent": [
    {
      id: "ev-main",
      label: "Внешняя вентиляция",
      tier2: [
        { id: "ev-1", label: "Вытяжные шахты и дефлекторы" },
        { id: "ev-2", label: "Кровельные выходы" },
      ],
    },
  ],

  conditioning: [
    {
      id: "ac-main",
      label: "Кондиционирование",
      tier2: [
        { id: "ac-1", label: "Закладные под фреонтрассы" },
        { id: "ac-2", label: "Монтаж внутренних и наружных блоков" },
      ],
    },
  ],
};
