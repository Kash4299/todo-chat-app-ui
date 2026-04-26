import AuthCard from "@/components/AuthCard";
import { CheckCircle2, Layers3, Sparkles } from "lucide-react";

const stats = [
  { value: "24", label: "Thành viên active" },
  { value: "1.2K", label: "Tasks tuần này" },
  { value: "< 50ms", label: "Latency p95" },
];

export default async function Home() {
  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_24px_60px_rgba(26,27,46,0.14)] md:grid-cols-2 md:min-h-[calc(100vh-4rem)]">
        <section className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md animate-fade-in">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-white shadow-[var(--shadow-pop)]">
                K
              </span>
              <div>
                <div className="text-lg font-extrabold tracking-tight text-text">KashFlow</div>
                <div className="text-xs text-text-dim">Team workspace</div>
              </div>
            </div>
            <AuthCard />
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#1A1B2E] px-10 py-12 text-white md:flex md:flex-col md:justify-between">
          <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/20" />
          <div className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 rounded-full border border-white/20" />
          <div className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full border border-white/20" />

          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Mới: Workspace feed đã ra mắt
            </div>
            <h1 className="mb-3 text-4xl font-extrabold leading-tight tracking-[-0.02em]">
              Chỗ làm việc gọn gàng cho team Việt.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/80">
              Chat realtime, todo management và luồng cộng tác trong cùng một không gian.
              Tối ưu cho team product, design và engineering.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
              {stats.map((item) => (
                <div key={item.label}>
                  <div className="text-2xl font-extrabold tracking-tight">{item.value}</div>
                  <div className="mt-1 text-xs text-white/70">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm text-white/85">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Kênh chat theo team và dự án
              </p>
              <p className="flex items-center gap-2">
                <Layers3 className="h-4 w-4" />
                Todos có mức ưu tiên, lọc nhanh
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
