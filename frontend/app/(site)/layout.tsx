import Navbar from "@/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen place-items-center justify-center bg-black text-white">
        <div className="container py-6 sm:w-3/4 md:w-3/4 lg:w-3/4 xl:w-1/2">
          {children}
        </div>
      </div>
      <Navbar />
    </>
  );
}
