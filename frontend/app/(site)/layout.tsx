import Navbar from "@/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen w-full justify-center bg-canvas text-ink">
        <div className="w-full max-w-6xl px-4 py-6 sm:px-6">{children}</div>
      </div>
    </>
  );
}
