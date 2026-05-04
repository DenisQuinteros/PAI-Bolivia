'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function NuevaVacunacionPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading]         = useState(false)
  const [vacunas, setVacunas]         = useState<any[]>([])
  const [establecimientos, setEstablecimientos] = useState<any[]>([])
  const [busqueda, setBusqueda]       = useState('')
  const [pacientes, setPacientes]     = useState<any[]>([])
  const [pacienteNombre, setPacienteNombre] = useState('')
  const [form, setForm] = useState({
    paciente_id: '',
    vacuna_id: '',
    establecimiento_id: '',
    numero_dosis: '1',
    lote_vacuna: '',
    temperatura_conservacion: '',
    fecha_vacunacion: new Date().toISOString().slice(0, 16),
    observaciones: '',
  })

  useEffect(() => {
    fetch('/api/catalogo')
      .then(r => r.json())
      .then(d => {
        setVacunas(d.vacunas ?? [])
        setEstablecimientos(d.establecimientos ?? [])
      })
  }, [])

  useEffect(() => {
    if (busqueda.length < 2) { setPacientes([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('paciente')
        .select('paciente_id, nombres, primer_apellido, documento_identidad')
        .or(`nombres.ilike.%${busqueda}%,primer_apellido.ilike.%${busqueda}%,documento_identidad.ilike.%${busqueda}%`)
        .limit(5)
      setPacientes(data ?? [])
    }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  function set(campo: string, valor: any) {
    setForm(p => ({ ...p, [campo]: valor }))
  }

  async function handleSubmit() {
    if (!form.paciente_id || !form.vacuna_id || !form.establecimiento_id) {
      toast.error('Paciente, vacuna y establecimiento son obligatorios')
      return
    }
    setLoading(true)

    const res = await fetch('/api/vacunador/vacunaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        numero_dosis: parseInt(form.numero_dosis),
        temperatura_conservacion: form.temperatura_conservacion
          ? parseFloat(form.temperatura_conservacion) : null,
        lote_vacuna: form.lote_vacuna || null,
        observaciones: form.observaciones || null,
      }),
    })

    if (res.ok) {
      toast.success('Vacunación registrada correctamente')
      router.push('/dashboard/vacunador/vacunaciones')
    } else {
      const err = await res.json()
      toast.error('Error: ' + err.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Registrar Vacunación</h1>
        <p className="text-sm text-slate-500">Completa los datos del evento de vacunación</p>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader><CardTitle className="text-base">Datos de la vacunación</CardTitle></CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label>Buscar paciente *</Label>
            <Input
              value={pacienteNombre || busqueda}
              onChange={e => {
                setBusqueda(e.target.value)
                setPacienteNombre('')
                set('paciente_id', '')
              }}
              placeholder="Nombre, apellido o CI..."
            />
            {pacientes.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                {pacientes.map(p => (
                  <div key={p.paciente_id}
                    onClick={() => {
                      set('paciente_id', p.paciente_id)
                      setPacienteNombre(`${p.nombres} ${p.primer_apellido}`)
                      setBusqueda('')
                      setPacientes([])
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-slate-100 last:border-0"
                  >
                    {p.nombres} {p.primer_apellido}
                    <span className="text-slate-400 ml-2 text-xs">
                      {p.documento_identidad ?? 'Sin CI'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {form.paciente_id && (
              <p className="text-xs text-green-600">✓ Paciente: {pacienteNombre}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vacuna *</Label>
              <Select value={form.vacuna_id} onValueChange={v => set('vacuna_id', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {vacunas.map(v => (
                    <SelectItem key={v.vacuna_id} value={v.vacuna_id}>
                      {v.vacuna_nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de dosis *</Label>
              <Select value={form.numero_dosis} onValueChange={v => set('numero_dosis', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1ra dosis</SelectItem>
                  <SelectItem value="2">2da dosis</SelectItem>
                  <SelectItem value="3">3ra dosis</SelectItem>
                  <SelectItem value="4">4ta dosis (refuerzo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Establecimiento *</Label>
              <Select value={form.establecimiento_id} onValueChange={v => set('establecimiento_id', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {establecimientos.map(e => (
                    <SelectItem key={e.establecimiento_id} value={e.establecimiento_id}>
                      {e.nombre_establecimiento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha y hora *</Label>
              <Input type="datetime-local" value={form.fecha_vacunacion}
                onChange={e => set('fecha_vacunacion', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Lote de vacuna</Label>
              <Input value={form.lote_vacuna}
                onChange={e => set('lote_vacuna', e.target.value)}
                placeholder="Ej: LOT-2024-001" />
            </div>

            <div className="space-y-2">
              <Label>Temperatura (°C)</Label>
              <Input type="number" step="0.1" min="-10" max="10"
                value={form.temperatura_conservacion}
                onChange={e => set('temperatura_conservacion', e.target.value)}
                placeholder="Ej: 2.5" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea value={form.observaciones}
              onChange={e => set('observaciones', e.target.value)}
              placeholder="Notas adicionales..."
              rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? 'Guardando...' : 'Registrar vacunación'}
            </Button>
            <Button variant="outline"
              onClick={() => router.push('/dashboard/vacunador/vacunaciones')}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
