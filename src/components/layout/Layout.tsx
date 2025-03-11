
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="px-8 py-6">
          <div className="page-transition">{children}</div>
        </div>
      </main>
    </div>
  );
}
