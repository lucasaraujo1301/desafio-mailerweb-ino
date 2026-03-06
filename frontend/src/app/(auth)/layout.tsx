export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%]  w-[400px] h-[400px] bg-brand-600/4 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid lines decoration */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="relative w-full max-w-md animate-slide-up">
        {children}
      </div>
    </div>
  );
}
