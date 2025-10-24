import { GeneralNavbar } from "@/components/navbar/GeneralNavbar";

export default function WorldsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <GeneralNavbar />
      {children}
    </div>
  );
}
