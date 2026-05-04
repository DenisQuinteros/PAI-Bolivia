import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function VacunacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: registros } = await supabase
    .from('registro_vacunacion')
    .select(`
      *,
      paciente:paciente_id (nombres, primer_apellido),
      vacuna:vacuna_id (vacuna_nombre),
      establecimiento:establecimiento_id (nombre_establecimiento)
    `)
    .order('fecha_vacunacion', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="font-bold text-slate-800">PAI Bolivia</h1>
              <p className="text-xs text-slate-400">Ministerio de Salud y Deportes</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            ← Volver al Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Registros de Vacunación</h2>
            <p className="text-sm text-slate-500">{registros?.length ?? 0} registros recientes</p>
          </div>
          <Link
            href="/dashboard/vacunaciones/nuevo"
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
          >
            + Registrar Vacunación
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Paciente</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Vacuna</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Dosis</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Establecimiento</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros && registros.length > 0 ? (
                registros.map((r: any) => (
                  <tr key={r.registro_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {r.paciente?.nombres} {r.paciente?.primer_apellido}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.vacuna?.vacuna_nombre}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        Dosis {r.numero_dosis}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {r.establecimiento?.nombre_establecimiento}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(r.fecha_vacunacion).toLocaleDateString('es-BO')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                        {r.origen_datos}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No hay registros de vacunación aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
