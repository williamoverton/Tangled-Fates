import { WorldNavbar } from "@/components/navbar/WorldNavbar";

export default async function WorldLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ world_slug: string }>;
}) {
  const { world_slug } = await params;

  return (
    <div className="flex flex-col h-screen overflow-y-hidden max-h-full">
      <WorldNavbar worldSlug={world_slug} />
      <div className="flex-1 min-h-0 overflow-y-auto max-h-full">
        {children}
      </div>
    </div>
  );
}
