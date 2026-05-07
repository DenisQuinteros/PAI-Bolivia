'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function RegistroForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router   = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    rol: 'vacunador',
  })

  async function handleRegistro() {
    setLoading(true)
    setError('')
    if (!form.email || !form.password || !form.nombre_completo) {
      setError('Todos los campos son obligatorios')
      setLoading(false)
      return
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Error al registrar')
      setLoading(false)
      return
    }
    const { error: perfilError } = await supabase.from('usuarios_perfil').insert({
      id: data.user.id,
      nombre_completo: form.nombre_completo,
      rol: form.rol,
    })
    if (perfilError) {
      setError('Error al crear perfil: ' + perfilError.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="text-5xl">🏥</div>
        <CardTitle className="text-2xl font-bold text-slate-800">Registro</CardTitle>
        <CardDescription>PAI Bolivia — Crear cuenta de acceso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input
            value={form.nombre_completo}
            onChange={e => setForm(p => ({ ...p, nombre_completo: e.target.value }))}
            placeholder="Ej: Juan Carlos Mamani"
          />
        </div>
        <div className="space-y-2">
          <Label>Correo electrónico</Label>
          <Input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="usuario@salud.gob.bo"
          />
        </div>
        <div className="space-y-2">
          <Label>Contraseña</Label>
          <Input
            type="password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <div className="space-y-2">
          <Label>Rol en el sistema</Label>
          <Select value={form.rol} onValueChange={v => setForm(p => ({ ...p, rol: v as string }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vacunador">Vacunador</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="estadistica">Estadística</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <Button
          onClick={handleRegistro}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </Button>
        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
