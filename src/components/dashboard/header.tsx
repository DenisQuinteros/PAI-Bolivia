'use client'
import { createClient } from '@/lib/supabase/client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { UsuarioPerfil } from '@/lib/types'

const colorRol: Record<string, string> = {
  admin:       'bg-red-100 text-red-700',
  supervisor:  'bg-orange-100 text-orange-700',
  vacunador:   'bg-green-100 text-green-700',
  estadistica: 'bg-purple-100 text-purple-700',
}

export function Header({ perfil }: { perfil: UsuarioPerfil }) {
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

        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
              {perfil.nombre_completo?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">
              {perfil.nombre_completo}
            </span>
            <span className="text-slate-400 text-xs">▼</span>
          </button>

          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-800">{perfil.nombre_completo}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{perfil.rol}</p>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>👤</span> Mi perfil
              </Link>
            </div>
            <div className="border-t border-slate-100 py-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <span>🚪</span> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
