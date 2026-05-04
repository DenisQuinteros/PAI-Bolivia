'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const colorRol: Record<string, string> = {
  admin:       'bg-red-100 text-red-700',
  supervisor:  'bg-orange-100 text-orange-700',
  vacunador:   'bg-green-100 text-green-700',
  estadistica: 'bg-purple-100 text-purple-700',
}

export function PerfilForm({ perfil, email }: { perfil: any; email: string }) {
  const supabase = createClient()
  const [loading, setLoading]   = useState(false)
  const [nombre, setNombre]     = useState(perfil?.nombre_completo ?? '')
  const [telefono, setTelefono] = useState(perfil?.telefono ?? '')

  async function handleGuardar() {
    setLoading(true)
    const { error } = await supabase
      .from('usuarios_perfil')
      .update({ nombre_completo: nombre, telefono })
      .eq('id', perfil.id)

    if (error) {
      toast.error('Error al guardar: ' + error.message)
    } else {
      toast.success('Perfil actualizado correctamente')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{nombre}</CardTitle>
              <p className="text-sm text-slate-500">{email}</p>
              <Badge className={`mt-1 text-xs capitalize ${colorRol[perfil?.rol] ?? ''}`}>
                {perfil?.rol}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Ej: +591 70000000"
            />
          </div>
          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <Input value={email} disabled className="bg-slate-50 text-slate-500" />
            <p className="text-xs text-slate-400">El correo no puede modificarse desde aquí</p>
          </div>
          <div className="space-y-2">
            <Label>Rol en el sistema</Label>
            <Input value={perfil?.rol ?? ''} disabled className="bg-slate-50 text-slate-500 capitalize" />
            <p className="text-xs text-slate-400">El rol es asignado por el administrador</p>
          </div>
          <Button
            onClick={handleGuardar}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
