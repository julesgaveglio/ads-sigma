'use client'

import { GOLD } from '@/lib/constants'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: string
  icon?: React.ReactNode
}

export default function KPICard({
  title,
  value,
  subtitle,
  color = GOLD,
  icon,
}: KPICardProps) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: '#111111',
        border: '1px solid #1E1E1E',
        borderRadius: '2px',
        padding: '32px',
        borderLeftWidth: '3px',
        borderLeftColor: color,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="label-upper mb-2" style={{ color: '#C9A84C' }}>
            {title}
          </p>
          <p
            className="truncate"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '36px',
              fontWeight: 700,
              color: '#F0EDE6',
              lineHeight: 1.1,
            }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-1" style={{ fontSize: '12px', color: '#8A8580' }}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(201, 168, 76, 0.08)',
              borderRadius: '2px',
            }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}
