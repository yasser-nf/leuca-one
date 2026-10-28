import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg">
      <main className="px-4 pt-4 pb-nav">{children}</main>
      <BottomNav />
    </div>
  );
}
