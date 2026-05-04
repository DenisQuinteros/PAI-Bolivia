import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportesDashboard } from '@/components/dashboard/reportes-dashboard'

export default async function ReportesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Stats por departamento
  const { data: porDepartamento } = await supabase
    .from('registro_vacunacion')
    .select(`
      establecimiento:establecimiento_id (
        municipio:municipio_id (
          departamento:codigo_departamento (
            departamento_nombre
          )
        )
      )
    `)

  // Stats por vacuna
  const { data: porVacuna } = await supabase
    .from('registro_vacunacion')
    .select('vacuna:vacuna_id (vacuna_nombre)')

  // Stats por origen
  const { data: porOrigen } = await supabase
    .from('registro_vacunacion')
    .select('origen_datos')

  // Últimos 30 días
  const hace30 = new Date()
  hace30.setDate(hace30.getDate() - 30)
  const { count: ultimos30 } = await supabase
    .from('registro_vacunacion')
    .select('*', { count: 'exact', head: true })
    .gte('fecha_vacunacion', hace30.toISOString())

  // Totales generales
  const [
    { count: totalVacunaciones },
    { count: totalPacientes },
    { count: totalEstablecimientos },
  ] = await Promise.all([
    supabase.from('registro_vacunacion').select('*', { count: 'exact', head: true }),
    supabase.from('paciente').select('*', { count: 'exact', head: true }),
    supabase.from('establecimiento').select('*', { count: 'exact', head: true }),
  ])

  // Procesar datos para gráficos
  const vacunasCount: Record<string, number> = {}
  porVacuna?.forEach((r: any) => {
    const nombre = r.vacuna?.vacuna_nombre ?? 'Desconocida'
    vacunasCount[nombre] = (vacunasCount[nombre] ?? 0) + 1
  })

  const origenCount: Record<string, number> = {}
  porOrigen?.forEach((r: any) => {
    const o = r.origen_datos ?? 'Manual'
    origenCount[o] = (origenCount[o] ?? 0) + 1
  })

  const deptoCount: Record<string, number> = {}
  porDepartamento?.forEach((r: any) => {
    const nombre = r.establecimiento?.municipio?.departamento?.departamento_nombre ?? 'Sin depto'
    deptoCount[nombre] = (deptoCount[nombre] ?? 0) + 1
  })

  return (
    <ReportesDashboard
      totalVacunaciones={totalVacunaciones ?? 0}
      totalPacientes={totalPacientes ?? 0}
      totalEstablecimientos={totalEstablecimientos ?? 0}
      ultimos30Dias={ultimos30 ?? 0}
      porVacuna={Object.entries(vacunasCount).map(([nombre, total]) => ({ nombre, total }))}
      porOrigen={Object.entries(origenCount).map(([origen, total]) => ({ origen, total }))}
      porDepartamento={Object.entries(deptoCount).map(([depto, total]) => ({ depto, total }))}
    />
  )
}
