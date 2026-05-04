import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  titulo: string
  valor: number | string
  icono: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  descripcion?: string
}

const colores = {
  blue:   'text-blue-600',
  green:  'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red:    'text-red-600',
}

export function StatsCard({ titulo, valor, icono, color = 'blue', descripcion }: StatsCardProps) {
  return (
    <Card className="shadow-sm border-slate-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{titulo}</p>
            <p className={`text-3xl font-bold mt-1 ${colores[color]}`}>{valor}</p>
            {descripcion && (
              <p className="text-xs text-slate-400 mt-1">{descripcion}</p>
            )}
          </div>
          <span className="text-3xl">{icono}</span>
        </div>
      </CardContent>
    </Card>
  )
}
