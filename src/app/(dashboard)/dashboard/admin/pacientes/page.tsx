import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminPacientesTable } from '@/components/dashboard/admin/pacientes-table'

export default async function AdminPacientesPage() {
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

  const { data: pacientes } = await supabase
    .from('paciente')
    .select(`
      *,
      municipio:municipio_residencia (nombre_municipio, codigo_departamento)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Todos los Pacientes</h1>
        <p className="text-sm text-slate-500">
          {pacientes?.length ?? 0} pacientes registrados en el sistema
        </p>
      </div>
      <AdminPacientesTable
        pacientes={pacientes ?? []}
        rolUsuario={perfil?.rol ?? 'estadistica'}
      />
    </div>
  )
}
