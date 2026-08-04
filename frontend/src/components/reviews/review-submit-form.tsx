"use client";

import { useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Star, X } from "lucide-react";

import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import { CmsImage } from "@/components/ui/cms-image";
import { METRIKA_GOALS, trackMetrikaGoal } from "@/lib/analytics-goals";
import {
  REVIEW_PHOTO_MAX_BYTES,
  REVIEW_PHOTO_MAX_COUNT,
  reviewSubmitSchema,
  type ReviewSubmitInput,
} from "@/lib/review-content";

const fieldClass =
  "w-full min-w-0 rounded-xl border px-3 py-3 text-base outline-none transition focus:border-[var(--accent)] sm:py-2.5 sm:text-sm";

async function readSubmitError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    if (data.error) return data.error;
    if (data.message) return data.message;
  } catch {
    /* */
  }
  if (response.status === 429) return "Слишком много попыток. Попробуйте позже.";
  return "Не удалось отправить отзыв. Попробуйте ещё раз.";
}

async function uploadReviewPhoto(file: File): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch("/api/reviews/upload", { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok) return { error: data.error || "Не удалось загрузить фото" };
    if (!data.url) return { error: "Сервер не вернул адрес файла" };
    return { url: data.url };
  } catch {
    return { error: "Сеть недоступна при загрузке фото" };
  }
}

function FormShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4 sm:rounded-[1.25rem] sm:p-6 md:p-8"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
    >
      {children}
    </div>
  );
}

export function ReviewSubmitForm() {
  const getSmartCaptchaToken = useSmartCaptchaToken();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewSubmitInput>({
    resolver: zodResolver(reviewSubmitSchema),
    defaultValues: {
      authorName: "",
      objectName: "",
      rating: 5,
      text: "",
      photoUrls: [],
      honeypot: "",
    },
  });

  const onPickPhotos = async (list: FileList | null) => {
    if (!list?.length) return;
    setError(null);
    const remaining = REVIEW_PHOTO_MAX_COUNT - photoUrls.length;
    if (remaining <= 0) {
      setError(`Можно прикрепить не больше ${REVIEW_PHOTO_MAX_COUNT} фото.`);
      return;
    }

    const files = Array.from(list).slice(0, remaining);
    setUploading(true);
    const next = [...photoUrls];
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("Допустимы только изображения (JPEG, PNG, WebP).");
          continue;
        }
        if (file.size > REVIEW_PHOTO_MAX_BYTES) {
          setError(`Фото «${file.name}» больше ${REVIEW_PHOTO_MAX_BYTES / 1024 / 1024} МБ.`);
          continue;
        }
        const result = await uploadReviewPhoto(file);
        if (result.error || !result.url) {
          setError(result.error || "Не удалось загрузить фото");
          continue;
        }
        if (!next.includes(result.url)) next.push(result.url);
      }
      setPhotoUrls(next);
      setValue("photoUrls", next, { shouldValidate: true });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => {
    const next = photoUrls.filter((item) => item !== url);
    setPhotoUrls(next);
    setValue("photoUrls", next, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewSubmitInput) => {
    if (data.honeypot) return;
    setError(null);
    setLoading(true);
    try {
      const recaptchaToken = await getSmartCaptchaToken();
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          rating,
          photoUrls,
          recaptchaToken: recaptchaToken || undefined,
        }),
      });
      if (!res.ok) {
        setError(await readSubmitError(res));
        return;
      }
      trackMetrikaGoal(METRIKA_GOALS.reviewSubmit, { rating });
      setDone(true);
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <FormShell>
        <p className="text-base font-semibold sm:text-lg text-[var(--text)]">Спасибо за отзыв!</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Мы проверим текст и опубликуем его на сайте после модерации. Обычно это занимает 1–2 рабочих дня.
        </p>
      </FormShell>
    );
  }

  return (
    <section aria-labelledby="review-submit-heading">
      <FormShell>
        <h2
          id="review-submit-heading"
          className="font-heading text-lg font-bold leading-tight sm:text-xl"
          style={{ color: "var(--text)" }}
        >
          Оставить отзыв на сайте
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Отзыв появится после проверки модератором — так мы защищаем раздел от спама.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
          <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...register("honeypot")} />

          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Ваше имя</label>
              <input
                {...register("authorName")}
                className={fieldClass}
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
                placeholder="Иван Иванов"
                autoComplete="name"
              />
              {errors.authorName ? (
                <p className="mt-1 text-xs text-red-600">{errors.authorName.message}</p>
              ) : null}
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Объект (необязательно)</label>
              <input
                {...register("objectName")}
                className={fieldClass}
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
                placeholder="Дом в Ленобласти"
              />
            </div>
          </div>

          <div>
            <span className="mb-2 block text-xs font-medium text-[var(--text-muted)]">Оценка</span>
            <div className="flex flex-wrap gap-0.5 sm:gap-1" role="group" aria-label="Оценка от 1 до 5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setRating(n);
                    setValue("rating", n, { shouldValidate: true });
                  }}
                  className={`flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10 ${
                    n <= rating ? "text-[var(--accent)]" : "text-[var(--border)]"
                  }`}
                  aria-label={`${n} из 5`}
                  aria-pressed={n === rating}
                >
                  <Star className="h-7 w-7 sm:h-6 sm:w-6" fill={n <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Текст отзыва</label>
            <textarea
              {...register("text")}
              rows={4}
              className={`${fieldClass} min-h-[120px] resize-y`}
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
              placeholder="Расскажите о опыте строительства или проектирования…"
            />
            {errors.text ? <p className="mt-1 text-xs text-red-600">{errors.text.message}</p> : null}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <label className="text-xs font-medium text-[var(--text-muted)]" htmlFor="review-photos">
                Фото (необязательно)
              </label>
              <span className="text-[11px] text-[var(--text-subtle)]">
                до {REVIEW_PHOTO_MAX_COUNT} шт., JPEG/PNG/WebP
              </span>
            </div>

            {photoUrls.length > 0 ? (
              <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {photoUrls.map((url) => (
                  <li key={url} className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                    <CmsImage src={url} alt="" fill className="object-cover" sizes="120px" />
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80"
                      aria-label="Удалить фото"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <input
              ref={fileInputRef}
              id="review-photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => void onPickPhotos(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading || photoUrls.length >= REVIEW_PHOTO_MAX_COUNT}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-55 sm:w-auto"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              )}
              {uploading ? "Загрузка…" : "Добавить фото"}
            </button>
          </div>

          {error ? <p className="text-sm text-red-600 break-words">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || uploading}
            className="flex w-full min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] text-[var(--accent-contrast)] transition hover:opacity-95 disabled:opacity-60 sm:tracking-[0.08em] md:w-auto md:min-w-[240px]"
          >
            {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
            <span className="text-center leading-tight">Отправить на модерацию</span>
          </button>
        </form>
      </FormShell>
    </section>
  );
}
