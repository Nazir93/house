-- Просмотры и «огоньки» (лайки) на карточках проектов
ALTER TABLE "HouseProject" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "HouseProject" ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;

-- Стартовые значения как в прежней формуле на главной
UPDATE "HouseProject"
SET
  "viewCount" = 180 + "area" + "order" * 7,
  "likeCount" = 12 + (CASE WHEN "isNew" THEN 28 ELSE 0 END) + "order" * 3
WHERE "viewCount" = 0 AND "likeCount" = 0;
