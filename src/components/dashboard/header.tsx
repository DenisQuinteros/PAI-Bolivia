'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import type { UsuarioPerfil } from '@/lib/types'

const colorRol: Record<string, string> = {
  admin:       'bg-red-100 text-red-700',
  supervisor:  'bg-orange-100 text-orange-700',
  vacunador:   'bg-green-100 text-green-700',
  estadistica: 'bg-purple-100 text-purple-700',
}

export function Header({ perfil }: { perfil: UsuarioPerfil }) {
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <SidebarTrigger className="text-slate-500 hover:text-slate-800" />

      <div className="flex items-center gap-3">
        <Badge className={`text-xs capitalize ${colorRol[perfil.rol] ?? 'bg-slate-100 text-slate-700'}`}>
          {perfil.rol}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button
              type="button"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-bold">
                  {perfil.nombre_completo?.charAt(0)?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 hidden md:block">
                {perfil.nombre_completo}
              </span>
              <span className="text-slate-400 text-xs">▼</span>
            </button>
          } />

          <DropdownMenuContent align="end" className="w-52" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{perfil.nombre_completo}</p>
                <p className="text-xs text-slate-400 capitalize">{perfil.rol}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={
              <Link href="/dashboard/perfil" className="cursor-pointer w-full flex items-center gap-2">
                <span>👤</span> Mi perfil
              </Link>
            } />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 flex items-center gap-2"
            >
              <span>🚪</span> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
