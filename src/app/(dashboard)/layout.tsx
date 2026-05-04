import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { SidebarProvider } from '@/components/ui/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: perfil, error } = await supabase
    .from('usuarios_perfil')
    .select('*')
    .eq('id', user.id)
    .single()

  let perfilData = perfil

  if (error) {
    console.error('Error al obtener perfil:', error)
  }

  // Si no tiene perfil todavía (usuario nuevo o error RLS), crear uno básico en memoria
  if (!perfilData) {
    perfilData = {
      id: user.id,
      nombre_completo: user.email?.split('@')[0] || 'Usuario',
      rol: 'vacunador',
      activo: true
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar rol={perfilData.rol} nombreCompleto={perfilData.nombre_completo} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header perfil={perfilData} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
