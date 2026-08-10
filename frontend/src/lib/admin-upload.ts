/**
 * Загрузка файла в /public/uploads через защищённый /api/admin/upload
 */

export type UploadAdminMediaOptions = {
  profile?: "default" | "hero";
  /** Название/slug объекта или проекта — попадёт в имя файла вместо ChatGPT_Image… */
  nameHint?: string;
  /** plan | cover | render | video … */
  role?: string;
  purpose?: "client-document";
};

export async function uploadAdminMedia(
  file: File,
  options?: UploadAdminMediaOptions,
): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  if (options?.profile === "hero") fd.append("profile", "hero");
  if (options?.purpose === "client-document") fd.append("purpose", "client-document");
  if (options?.nameHint?.trim()) fd.append("nameHint", options.nameHint.trim());
  if (options?.role?.trim()) fd.append("role", options.role.trim());
  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
    const text = await res.text();
    let data: { url?: string; error?: string } = {};
    try {
      data = text ? (JSON.parse(text) as { url?: string; error?: string }) : {};
    } catch {
      if (res.status === 413) {
        return {
          error:
            "Файл слишком большой для прокси (часто лимит nginx client_max_body_size). Уменьшите видео или увеличьте лимит на сервере до 260 МБ.",
        };
      }
      return { error: res.status >= 500 ? "Ошибка сервера при загрузке" : "Ошибка загрузки" };
    }
    if (res.status === 401) {
      return { error: "Сессия истекла — войдите в админку снова и повторите загрузку." };
    }
    if (!res.ok) return { error: data.error || "Ошибка загрузки" };
    if (data.url) return { url: data.url };
    return { error: "Сервер не вернул адрес файла" };
  } catch {
    return { error: "Не удалось отправить файл (сеть или таймаут)" };
  }
}
