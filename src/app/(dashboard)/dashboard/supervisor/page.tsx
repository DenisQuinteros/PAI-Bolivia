import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCard } from '@/components/dashboard/stats-card'

export default async function SupervisorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios_perfil').select('rol').eq('id', user.id).single()
  if (!['admin','supervisor'].includes(perfil?.rol ?? '')) redirect('/dashboard')

  const [
    { count: totalVacunaciones },
    { count: totalPacientes },
    { count: totalEstablecimientos },
    { data: porOrigen },
  ] = await Promise.all([
    supabase.from('registro_vacunacion').select('*', { count: 'exact', head: true }),
    supabase.from('paciente').select('*', { count: 'exact', head: true }),
    supabase.from('establecimiento').select('*', { count: 'exact', head: true }),
    supabase.from('registro_vacunacion').select('origen_datos'),
  ])

  const origenCount: Record<string, number> = {}
  porOrigen?.forEach((r: any) => {
    origenCount[r.origen_datos] = (origenCount[r.origen_datos] ?? 0) + 1
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel Supervisor</h1>
        <p className="text-sm text-slate-500">Resumen general del programa PAI</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard titulo="Total Vacunaciones" valor={totalVacunaciones ?? 0} icono="💉" color="blue" />
        <StatsCard titulo="Pacientes Registrados" valor={totalPacientes ?? 0} icono="👤" color="green" />
        <StatsCard titulo="Establecimientos" valor={totalEstablecimientos ?? 0} icono="🏥" color="purple" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Registros por origen</h2>
        <div className="space-y-3">
          {Object.entries(origenCount).map(([origen, total]) => (
            <div key={origen} className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700">{origen}</span>
              <span className="font-bold text-blue-600">{total}</span>
            </div>
          ))}
          {Object.keys(origenCount).length === 0 && (
            <p className="text-slate-400 text-sm">Sin registros aún</p>
          )}
        </div>
      </div>
    </div>
  )
}
