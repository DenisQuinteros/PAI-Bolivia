import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsuariosTable } from '@/components/dashboard/admin/usuarios-table'

export default async function AdminUsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios_perfil')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') redirect('/dashboard')

  const { data: usuarios } = await supabase
    .from('usuarios_perfil')
    .select('*')
    .eq('eliminado', false)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500">
            {usuarios?.length ?? 0} usuarios registrados en el sistema
          </p>
        </div>
      </div>
      <UsuariosTable usuarios={usuarios ?? []} />
    </div>
  )
}
