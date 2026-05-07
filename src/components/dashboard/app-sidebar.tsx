'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarGroup, SidebarGroupLabel
} from '@/components/ui/sidebar'
import { type Rol } from '@/lib/types'

interface Props {
  rol: Rol
  nombreCompleto: string
}

const menuPorRol: Record<Rol, { label: string; items: { href: string; icon: string; titulo: string }[] }[]> = {
  admin: [
    {
      label: 'General',
      items: [
        { href: '/dashboard',                icon: '🏠', titulo: 'Inicio'          },
        { href: '/dashboard/admin/usuarios', icon: '👥', titulo: 'Usuarios'        },
        { href: '/dashboard/admin/pacientes',icon: '👤', titulo: 'Pacientes'       },
        { href: '/dashboard/admin/vacunaciones', icon: '💉', titulo: 'Vacunaciones'},
      ],
    },
    {
      label: 'Reportes',
      items: [
        { href: '/dashboard/reportes',       icon: '📊', titulo: 'Estadísticas'    },
      ],
    },
  ],
  supervisor: [
    {
      label: 'General',
      items: [
        { href: '/dashboard',            icon: '🏠', titulo: 'Inicio'       },
        { href: '/dashboard/supervisor', icon: '📋', titulo: 'Mi Panel'     },
        { href: '/dashboard/admin/pacientes',    icon: '👤', titulo: 'Pacientes'   },
        { href: '/dashboard/admin/vacunaciones', icon: '💉', titulo: 'Vacunaciones' },
        { href: '/dashboard/reportes',   icon: '📊', titulo: 'Estadísticas' },
      ],
    },
  ],
  vacunador: [
    {
      label: 'Mi trabajo',
      items: [
        { href: '/dashboard',                          icon: '🏠', titulo: 'Inicio'        },
        { href: '/dashboard/vacunador/pacientes',      icon: '👤', titulo: 'Pacientes'     },
        { href: '/dashboard/vacunador/vacunaciones',   icon: '💉', titulo: 'Vacunaciones'  },
      ],
    },
  ],
  estadistica: [
    {
      label: 'Análisis',
      items: [
        { href: '/dashboard',          icon: '🏠', titulo: 'Inicio'       },
        { href: '/dashboard/reportes', icon: '📊', titulo: 'Reportes'     },
      ],
    },
  ],
}

export function AppSidebar({ rol, nombreCompleto }: Props) {
  const pathname = usePathname()
  const grupos = menuPorRol[rol] ?? menuPorRol['vacunador']

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏥</span>
          <div>
            <p className="font-bold text-slate-800 text-sm">PAI Bolivia</p>
            <p className="text-xs text-slate-400">Min. de Salud y Deportes</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {grupos.map(grupo => (
          <SidebarGroup key={grupo.label}>
            <SidebarGroupLabel className="text-xs text-slate-400 uppercase tracking-wider px-4 mb-1">
              {grupo.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {grupo.items.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={
                      <Link href={item.href} className="flex items-center gap-3 text-sm">
                        <span>{item.icon}</span>
                        <span>{item.titulo}</span>
                      </Link>
                    }
                    isActive={pathname === item.href}
                    className="px-4 py-2"
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
            {nombreCompleto.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{nombreCompleto}</p>
            <p className="text-xs text-slate-400 capitalize">{rol}</p>
          </div>
        </div>
        <Link href="/dashboard/perfil" className="mt-3 text-xs text-blue-600 hover:underline block">
          Mi perfil →
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
