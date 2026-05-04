import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pacientes } = await supabase
    .from('paciente')
    .select(`
      *,
      municipio:municipio_residencia (nombre_municipio, codigo_departamento)
    `)
    .order('created_at', { ascending: false })
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
            <h2 className="text-xl font-bold text-slate-800">Pacientes</h2>
            <p className="text-sm text-slate-500">{pacientes?.length ?? 0} registros recientes</p>
          </div>
          <Link
            href="/dashboard/pacientes/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
          >
            + Nuevo Paciente
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Paciente</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">CI</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Género</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Nacimiento</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Municipio</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientes && pacientes.length > 0 ? (
                pacientes.map((p: any) => (
                  <tr key={p.paciente_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {p.nombres} {p.primer_apellido} {p.segundo_apellido ?? ''}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.documento_identidad ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.genero === 'M'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {p.genero === 'M' ? 'Masculino' : 'Femenino'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.fecha_nacimiento}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.municipio?.nombre_municipio ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/pacientes/${p.paciente_id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Ver historial
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No hay pacientes registrados aún
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
