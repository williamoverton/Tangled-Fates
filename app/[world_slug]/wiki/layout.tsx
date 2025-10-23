export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col h-full overflow-auto">{children}</div>;
}
