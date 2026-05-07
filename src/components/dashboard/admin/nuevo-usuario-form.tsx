'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function NuevoUsuarioForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre_completo: '', email: '', password: '', rol: 'vacunador'
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit() {
    if (!form.nombre_completo || !form.email || !form.password) {
      toast.error('Todos los campos son obligatorios')
      return
    }
    if (form.password.length < 8) {
      toast.error('La contraseña debe tener mínimo 8 caracteres')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nombre_completo: form.nombre_completo } }
    })
    if (error || !data.user) {
      toast.error('Error: ' + (error?.message ?? 'No se pudo crear'))
      setLoading(false)
      return
    }
    const { error: perfilError } = await supabase.from('usuarios_perfil').insert({
      id: data.user.id,
      nombre_completo: form.nombre_completo,
      rol: form.rol,
      activo: true
    })
    if (perfilError) {
      toast.error('Usuario creado pero error en perfil: ' + perfilError.message)
    } else {
      toast.success('Usuario creado correctamente')
      router.push('/dashboard/admin/usuarios')
    }
    setLoading(false)
  }

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input value={form.nombre_completo} onChange={e => set('nombre_completo', e.target.value)}
            placeholder="Ej: Juan Carlos Mamani" />
        </div>
        <div className="space-y-2">
          <Label>Correo electrónico</Label>
          <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="usuario@salud.gob.bo" />
        </div>
        <div className="space-y-2">
          <Label>Contraseña (mín. 8 caracteres)</Label>
          <Input type="password" value={form.password} onChange={e => set('password', e.target.value)}
            placeholder="••••••••" />
        </div>
        <div className="space-y-2">
          <Label>Rol en el sistema</Label>
          <Select value={form.rol} onValueChange={v => set('rol', v as string)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="vacunador">Vacunador</SelectItem>
              <SelectItem value="estadistica">Estadística</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Creando...' : 'Crear usuario'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/admin/usuarios')}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
