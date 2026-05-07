import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NuevoUsuarioForm } from '@/components/dashboard/admin/nuevo-usuario-form'

export default async function NuevoUsuarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: perfil } = await supabase.from('usuarios_perfil').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') redirect('/dashboard')
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nuevo Usuario</h1>
        <p className="text-sm text-slate-500">Crear cuenta de acceso al sistema PAI</p>
      </div>
      <NuevoUsuarioForm />
    </div>
  )
}
