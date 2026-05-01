"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Phone, ArrowRight, Send } from "lucide-react";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { SITE_NAME } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { isWorkingHours } from "@/lib/utils";
import Link from "next/link";

export function ThankYouContent() {
  const contact = useContactConfig();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const source = searchParams.get("from");

  const [countdown, setCountdown] = useState(15);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }
    setValid(true);
  }, [token, router]);

  useEffect(() => {
    if (!valid) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [valid, router]);

  if (valid === null) return null;

  if (!valid) {
    router.replace("/");
    return null;
  }

  const workingHours = isWorkingHours();

  return (
    <section className="min-h-screen bg-brand flex items-center justify-center px-4 pt-20">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-brand-accent" />
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
          Спасибо за заявку!
        </h1>

        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          Мы получили ваш запрос. Инженер {SITE_NAME} свяжется с вами{" "}
          {workingHours
            ? "в течение 30 минут"
            : "в начале следующего рабочего дня"}
          .
        </p>

        <div className="glass rounded-2xl p-6 mb-8">
          <p className="text-gray-400 text-sm mb-3">
            Если вопрос срочный — позвоните:
          </p>
          <a
            href={`tel:${contact.phoneRaw}`}
            className="flex items-center justify-center gap-3 text-brand-accent text-xl font-bold hover:text-white transition-colors"
          >
            <Phone size={22} />
            {contact.phone}
          </a>
          <a
            href={`tel:${contact.phone2Raw}`}
            className="flex items-center justify-center gap-3 text-brand-accent text-lg font-bold hover:text-white transition-colors mt-2"
          >
            <Phone size={20} />
            {contact.phone2}
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            href={contact.social.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-gray-300 hover:bg-blue-500 hover:text-white transition-all text-sm font-medium"
          >
            <Send size={18} />
            Написать в Telegram
          </a>
          {contact.social.max && (
            <a
              href={contact.social.max}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-gray-300 hover:bg-violet-600 hover:text-white transition-all text-sm font-medium"
            >
              <MaxMessengerIcon className="h-[18px] w-[18px]" />
              Написать в Max
            </a>
          )}
        </div>

        <div className="mb-8">
          <p className="text-gray-400 text-sm mb-3">
            Пока ждёте — посмотрите наши проекты:
          </p>
          <Link href="/#portfolio">
            <Button variant="outline" size="sm">
              Перейти в портфолио
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="glass rounded-xl p-4">
          <p className="text-gray-500 text-sm">
            Вы вернётесь на главную через{" "}
            <span className="text-brand-accent font-bold">{countdown}</span>{" "}
            {countdown === 1
              ? "секунду"
              : countdown < 5
                ? "секунды"
                : "секунд"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-brand-accent text-sm hover:underline mt-1"
          >
            Вернуться сейчас
          </button>
        </div>
      </div>
    </section>
  );
}
