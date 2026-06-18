export default function H5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-[#f4f6f9]">
      <div className="flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-[#f4f6f9] shadow-sm">
        {children}
      </div>
    </div>
  );
}
