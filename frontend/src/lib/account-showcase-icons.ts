import {
  Bell,
  CalendarCheck,
  CreditCard,
  FileText,
  Images,
  LayoutDashboard,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import type { AccountShowcaseItem } from "@/lib/account-showcase";

export const ACCOUNT_SHOWCASE_ICON_BY_ID: Record<AccountShowcaseItem["id"], LucideIcon> = {
  dashboard: LayoutDashboard,
  stages: CalendarCheck,
  photos: Images,
  documents: FileText,
  payments: CreditCard,
  support: MessageCircle,
  notifications: Bell,
};
