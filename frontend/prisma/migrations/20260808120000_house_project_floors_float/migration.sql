-- Этажность проектов: 1.5 (полутораэтажные) раньше не сохранялась (колонка INTEGER).
ALTER TABLE "HouseProject" ALTER COLUMN "floors" TYPE DOUBLE PRECISION USING ("floors"::double precision);
