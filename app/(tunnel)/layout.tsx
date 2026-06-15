export default function TunnelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {children}
    </div>
  )
}
