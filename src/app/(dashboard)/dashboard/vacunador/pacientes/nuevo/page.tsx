'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function NuevoPacientePage() {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombres: '',
    primer_apellido: '',
    segundo_apellido: '',
    documento_identidad: '',
    genero: 'M',
    fecha_nacimiento: '',
    es_pueblo_indigena: false,
    comunidad_indigena: '',
  })

  function set(campo: string, valor: any) {
    setForm(p => ({ ...p, [campo]: valor }))
  }

  async function handleSubmit() {
    if (!form.nombres || !form.primer_apellido || !form.fecha_nacimiento) {
      toast.error('Nombres, primer apellido y fecha de nacimiento son obligatorios')
      return
    }
    setLoading(true)

    const res = await fetch('/api/admin/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        nombres: form.nombres.toUpperCase(),
        primer_apellido: form.primer_apellido.toUpperCase(),
        segundo_apellido: form.segundo_apellido || null,
        documento_identidad: form.documento_identidad || null,
        comunidad_indigena: form.comunidad_indigena || null,
      }),
    })

    if (res.ok) {
      toast.success('Paciente registrado correctamente')
      router.push('/dashboard/vacunador/pacientes')
    } else {
      const err = await res.json()
      toast.error('Error: ' + err.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nuevo Paciente</h1>
        <p className="text-sm text-slate-500">Registra los datos del paciente</p>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader><CardTitle className="text-base">Datos personales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombres *</Label>
              <Input value={form.nombres} onChange={e => set('nombres', e.target.value)}
                placeholder="Ej: JUAN CARLOS" />
            </div>
            <div className="space-y-2">
              <Label>Primer apellido *</Label>
              <Input value={form.primer_apellido} onChange={e => set('primer_apellido', e.target.value)}
                placeholder="Ej: MAMANI" />
            </div>
            <div className="space-y-2">
              <Label>Segundo apellido</Label>
              <Input value={form.segundo_apellido} onChange={e => set('segundo_apellido', e.target.value)}
                placeholder="Ej: QUISPE" />
            </div>
            <div className="space-y-2">
              <Label>Cédula de identidad</Label>
              <Input value={form.documento_identidad}
                onChange={e => set('documento_identidad', e.target.value)}
                placeholder="Ej: 12345678 LP" />
            </div>
            <div className="space-y-2">
              <Label>Género *</Label>
              <Select value={form.genero} onValueChange={v => set('genero', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha de nacimiento *</Label>
              <Input type="date" value={form.fecha_nacimiento}
                onChange={e => set('fecha_nacimiento', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="indigena"
              checked={form.es_pueblo_indigena}
              onChange={e => set('es_pueblo_indigena', e.target.checked)}
              className="rounded" />
            <Label htmlFor="indigena">Pertenece a pueblo indígena originario</Label>
          </div>

          {form.es_pueblo_indigena && (
            <div className="space-y-2">
              <Label>Comunidad indígena</Label>
              <Input value={form.comunidad_indigena}
                onChange={e => set('comunidad_indigena', e.target.value)}
                placeholder="Ej: Comunidad Aymara" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Guardando...' : 'Registrar paciente'}
            </Button>
            <Button variant="outline"
              onClick={() => router.push('/dashboard/vacunador/pacientes')}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
