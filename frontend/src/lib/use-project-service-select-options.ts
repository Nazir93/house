"use client";

import { useEffect, useState } from "react";
import {
  ADMIN_PROJECT_SERVICE_OPTIONS,
  projectServiceSelectOptionsFromCms,
  type CmsServiceForProjectSelect,
} from "@/lib/admin-service-options";

/**
 * Опции «Услуга» для формы проекта: из таблицы Service (как на сайте), иначе enum/fallback.
 */
export function useProjectServiceSelectOptions(): {
  options: { value: string; label: string }[];
  loading: boolean;
} {
  const [options, setOptions] = useState(ADMIN_PROJECT_SERVICE_OPTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/services")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        const rows = data as CmsServiceForProjectSelect[];
        const built = projectServiceSelectOptionsFromCms(rows);
        if (built.length > 0) setOptions(built);
        else setOptions(ADMIN_PROJECT_SERVICE_OPTIONS);
      })
      .catch(() => {
        if (!cancelled) setOptions(ADMIN_PROJECT_SERVICE_OPTIONS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading };
}
