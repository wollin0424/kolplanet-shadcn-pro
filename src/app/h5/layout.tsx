export default function H5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#f4f6f9]">
      <div className="mx-auto min-h-full w-full max-w-[480px] bg-white shadow-sm">{children}</div>
    </div>
  );
}
