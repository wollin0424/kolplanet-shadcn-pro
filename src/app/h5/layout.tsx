export default function H5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-[#f4f6f9]">
      <div
        className="flex w-full max-w-[480px] flex-col bg-[#f4f6f9] shadow-sm"
        data-figma-capture="h5-shell"
      >
        {children}
      </div>
    </div>
  );
}
