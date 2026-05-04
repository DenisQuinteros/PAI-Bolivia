import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCard } from '@/components/dashboard/stats-card'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios_perfil')
    .select('*')
    .eq('id', user.id)
    .single()

  let perfilData = perfil
  if (!perfilData) {
    perfilData = {
      id: user.id,
      nombre_completo: user.email?.split('@')[0] || 'Usuario',
      rol: 'vacunador',
      activo: true
    }
  }

  const [
    { count: totalRegistros },
    { count: totalPacientes },
    { count: totalEstablecimientos },
    { count: totalVacunas },
  ] = await Promise.all([
    supabase.from('registro_vacunacion').select('*', { count: 'exact', head: true }),
    supabase.from('paciente').select('*', { count: 'exact', head: true }),
    supabase.from('establecimiento').select('*', { count: 'exact', head: true }),
    supabase.from('vacuna').select('*', { count: 'exact', head: true }),
  ])

  const modulosPorRol: Record<string, { href: string; icon: string; titulo: string; desc: string }[]> = {
    admin: [
      { href: '/dashboard/admin/usuarios',     icon: '👥', titulo: 'Gestionar Usuarios',    desc: 'Ver, editar y asignar roles' },
      { href: '/dashboard/admin/pacientes',    icon: '👤', titulo: 'Todos los Pacientes',   desc: 'Vista global de pacientes'   },
      { href: '/dashboard/admin/vacunaciones', icon: '💉', titulo: 'Todas las Vacunaciones', desc: 'Historial completo'          },
      { href: '/dashboard/reportes',           icon: '📊', titulo: 'Reportes',              desc: 'Estadísticas y métricas'     },
    ],
    supervisor: [
      { href: '/dashboard/supervisor',         icon: '📋', titulo: 'Mi Panel',              desc: 'Resumen de mi región'        },
      { href: '/dashboard/reportes',           icon: '📊', titulo: 'Reportes',              desc: 'Estadísticas detalladas'     },
    ],
    vacunador: [
      { href: '/dashboard/vacunador/pacientes',    icon: '👤', titulo: 'Mis Pacientes',    desc: 'Pacientes de mi establecimiento' },
      { href: '/dashboard/vacunador/vacunaciones', icon: '💉', titulo: 'Mis Vacunaciones', desc: 'Registros que realicé'           },
    ],
    estadistica: [
      { href: '/dashboard/reportes', icon: '📊', titulo: 'Reportes', desc: 'Análisis y estadísticas completas' },
    ],
  }

  const modulos = modulosPorRol[perfilData.rol] ?? modulosPorRol['vacunador']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido, {perfilData.nombre_completo.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Panel principal — Programa Ampliado de Inmunización
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard titulo="Vacunaciones"     valor={totalRegistros ?? 0}       icono="💉" color="blue"   />
        <StatsCard titulo="Pacientes"        valor={totalPacientes ?? 0}       icono="👤" color="green"  />
        <StatsCard titulo="Establecimientos" valor={totalEstablecimientos ?? 0} icono="🏥" color="purple" />
        <StatsCard titulo="Vacunas PAI"      valor={totalVacunas ?? 0}         icono="🧪" color="orange" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modulos.map(m => (
            <Link key={m.href} href={m.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="text-3xl mb-3">{m.icon}</div>
              <h3 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600">
                {m.titulo}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
