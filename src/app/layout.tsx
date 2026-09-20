import type { Metadata, Viewport } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "남겨둬 | 까먹기 전에, 남겨둬",
  description: "선글라스 낀 펭귄과 함께 남기는 일상의 기록. 중요한 대화, 작은 약속, 오늘의 일을 적고 필요할 때 꺼내보세요.",
  openGraph: { title: "남겨둬", description: "오늘 무슨 일 있었어? 까먹기 전에 남겨둬.", type: "website" },
};
export const viewport: Viewport = { themeColor: "#f7f8fa" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body><AppShell>{children}</AppShell></body></html>;
}
