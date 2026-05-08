-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "showInTrustBlock" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Partner" ADD COLUMN "showInBankMarquee" BOOLEAN NOT NULL DEFAULT false;

-- Allow partners without logo (текст в ленте банков)
ALTER TABLE "Partner" ALTER COLUMN "logoUrl" DROP NOT NULL;

-- Банки по умолчанию для ленты (логотипы можно добавить в админке)
INSERT INTO "Partner" ("id", "name", "logoUrl", "website", "visible", "order", "showInTrustBlock", "showInBankMarquee")
VALUES
  ('cmbkpartnersber01', 'Сбербанк', NULL, 'https://www.sberbank.ru', true, 10, false, true),
  ('cmbkpartneralfa01', 'Альфа-Банк', NULL, 'https://alfabank.ru', true, 20, false, true),
  ('cmbkpartnervtb001', 'ВТБ', NULL, 'https://www.vtb.ru', true, 30, false, true),
  ('cmbkpartnerresh01', 'Россельхозбанк', NULL, 'https://www.rshb.ru', true, 40, false, true),
  ('cmbkpartnerdomrf1', 'Дом.РФ', NULL, 'https://дом.рф/', true, 50, false, true),
  ('cmbkpartnerrosb01', 'Росбанк', NULL, 'https://www.rosbank.ru', true, 60, false, true),
  ('cmbkpartnerpochta', 'Почта Банк', NULL, 'https://www.pochtabank.ru', true, 70, false, true)
ON CONFLICT ("id") DO NOTHING;
