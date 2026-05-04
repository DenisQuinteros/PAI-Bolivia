'use client'
import { StatsCard } from './stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  totalVacunaciones: number
  totalPacientes: number
  totalEstablecimientos: number
  ultimos30Dias: number
  porVacuna: { nombre: string; total: number }[]
  porOrigen: { origen: string; total: number }[]
  porDepartamento: { depto: string; total: number }[]
}

const colorOrigen: Record<string, string> = {
  'La Paz':      'bg-blue-100 text-blue-700',
  'Santa Cruz':  'bg-green-100 text-green-700',
  'Rural Móvil': 'bg-orange-100 text-orange-700',
  'Manual':      'bg-slate-100 text-slate-700',
}

export function ReportesDashboard({
  totalVacunaciones, totalPacientes, totalEstablecimientos,
  ultimos30Dias, porVacuna, porOrigen, porDepartamento
}: Props) {
  const maxVacuna = Math.max(...porVacuna.map(v => v.total), 1)
  const maxDepto  = Math.max(...porDepartamento.map(d => d.total), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reportes y Estadísticas</h1>
        <p className="text-sm text-slate-500">
          Programa Ampliado de Inmunización — Bolivia
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard titulo="Total Vacunaciones"    valor={totalVacunaciones}    icono="💉" color="blue"   />
        <StatsCard titulo="Pacientes Registrados" valor={totalPacientes}       icono="👤" color="green"  />
        <StatsCard titulo="Establecimientos"      valor={totalEstablecimientos} icono="🏥" color="purple" />
        <StatsCard
          titulo="Últimos 30 días"
          valor={ultimos30Dias}
          icono="📅"
          color="orange"
          descripcion="vacunaciones recientes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Por Vacuna */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vacunaciones por tipo de vacuna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porVacuna.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Sin datos aún</p>
            ) : (
              porVacuna
                .sort((a, b) => b.total - a.total)
                .slice(0, 8)
                .map(v => (
                  <div key={v.nombre} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">{v.nombre}</span>
                      <span className="text-slate-500">{v.total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(v.total / maxVacuna) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Por Departamento */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vacunaciones por departamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porDepartamento.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Sin datos aún</p>
            ) : (
              porDepartamento
                .sort((a, b) => b.total - a.total)
                .map(d => (
                  <div key={d.depto} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">{d.depto}</span>
                      <span className="text-slate-500">{d.total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${(d.total / maxDepto) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Por Origen */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Registros por origen de datos</CardTitle>
          </CardHeader>
          <CardContent>
            {porOrigen.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Sin datos aún</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {porOrigen.map(o => (
                  <div key={o.origen}
                    className="flex flex-col items-center bg-slate-50 rounded-xl p-4 min-w-[100px]">
                    <Badge className={colorOrigen[o.origen] ?? 'bg-slate-100 text-slate-700'}>
                      {o.origen}
                    </Badge>
                    <span className="text-2xl font-bold text-slate-800 mt-2">{o.total}</span>
                    <span className="text-xs text-slate-400">registros</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen sistema */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumen del sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Cobertura de vacunación',
                valor: totalPacientes > 0
                  ? `${((totalVacunaciones / totalPacientes) * 100).toFixed(1)}%`
                  : '—',
                desc: 'dosis por paciente registrado' },
              { label: 'Establecimientos activos',
                valor: totalEstablecimientos,
                desc: 'centros de salud en el sistema' },
              { label: 'Actividad reciente',
                valor: ultimos30Dias,
                desc: 'vacunaciones en los últimos 30 días' },
            ].map(item => (
              <div key={item.label}
                className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <span className="text-xl font-bold text-blue-600">{item.valor}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
