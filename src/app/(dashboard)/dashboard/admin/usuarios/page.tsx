import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsuariosTable } from '@/components/dashboard/admin/usuarios-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminUsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: perfil } = await supabase.from('usuarios_perfil').select('rol').eq('id', user.id).single()
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
          <p className="text-sm text-slate-500">{usuarios?.length ?? 0} usuarios en el sistema</p>
        </div>
        <Link href="/dashboard/admin/usuarios/nuevo">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ Nuevo Usuario</Button>
        </Link>
      </div>
      <UsuariosTable usuarios={usuarios ?? []} />
    </div>
  )
}
