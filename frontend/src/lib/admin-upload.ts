/**
 * Загрузка файла в /public/uploads через защищённый /api/admin/upload
 */
export async function uploadAdminMedia(file: File): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
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
