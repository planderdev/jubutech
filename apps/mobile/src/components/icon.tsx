import {
  Baby,
  Bell,
  BookOpen,
  Bookmark,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileText,
  Gift,
  House,
  Landmark,
  List,
  MessagesSquare,
  Newspaper,
  NotebookPen,
  PawPrint,
  Search,
  ShoppingBasket,
  UserRound,
  Wallet,
  X,
  CircleAlert,
  type LucideIcon,
  type LucideProps,
} from "lucide-react-native";

/**
 * PHP 데모가 쓰는 lucide 아이콘(`public/assets/icons/*.svg`)을 같은 이름으로 쓴다.
 * 필요한 아이콘만 등록해 번들을 가볍게 유지한다. 없는 이름은 PHP처럼 circle-alert 로 대체.
 */
const ICONS: Record<string, LucideIcon> = {
  baby: Baby,
  bell: Bell,
  "book-open": BookOpen,
  bookmark: Bookmark,
  "briefcase-business": BriefcaseBusiness,
  "chart-no-axes-combined": ChartNoAxesCombined,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "clipboard-check": ClipboardCheck,
  "credit-card": CreditCard,
  "file-text": FileText,
  gift: Gift,
  house: House,
  landmark: Landmark,
  list: List,
  "messages-square": MessagesSquare,
  newspaper: Newspaper,
  "notebook-pen": NotebookPen,
  "paw-print": PawPrint,
  search: Search,
  "shopping-basket": ShoppingBasket,
  "user-round": UserRound,
  wallet: Wallet,
  x: X,
};

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 24, strokeWidth = 1.75, ...rest }: { name: string } & Omit<LucideProps, "ref">) {
  const Cmp = ICONS[name] ?? CircleAlert;
  return <Cmp size={size} strokeWidth={strokeWidth} {...rest} />;
}
