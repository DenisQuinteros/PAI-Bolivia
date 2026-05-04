import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminVacunacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios_perfil')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!['admin', 'supervisor', 'estadistica'].includes(perfil?.rol ?? '')) {
    redirect('/dashboard')
  }

  const { data: registros } = await supabase
    .from('registro_vacunacion')
    .select(`
      *,
      paciente:paciente_id (nombres, primer_apellido, documento_identidad),
      vacuna:vacuna_id (vacuna_nombre, grupo_pai),
      establecimiento:establecimiento_id (
        nombre_establecimiento,
        municipio:municipio_id (
          nombre_municipio,
          departamento:codigo_departamento (departamento_nombre)
        )
      ),
      registrado_por_perfil:registrado_por (nombre_completo)
    `)
    .order('fecha_vacunacion', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Todas las Vacunaciones</h1>
        <p className="text-sm text-slate-500">
          {registros?.length ?? 0} registros más recientes
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Paciente</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Vacuna</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Dosis</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Establecimiento</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Departamento</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Origen</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Registrado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros && registros.length > 0 ? (
                registros.map((r: any) => (
                  <tr key={r.registro_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {r.paciente?.nombres} {r.paciente?.primer_apellido}
                      {r.paciente?.documento_identidad && (
                        <span className="block text-xs text-slate-400">
                          {r.paciente.documento_identidad}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.vacuna?.vacuna_nombre}
                      <span className="block text-xs text-slate-400">
                        {r.vacuna?.grupo_pai}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        Dosis {r.numero_dosis}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {r.establecimiento?.nombre_establecimiento}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {r.establecimiento?.municipio?.departamento?.departamento_nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(r.fecha_vacunacion).toLocaleDateString('es-BO')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                        {r.origen_datos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {r.registrado_por_perfil?.nombre_completo ?? '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No hay registros de vacunación aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
