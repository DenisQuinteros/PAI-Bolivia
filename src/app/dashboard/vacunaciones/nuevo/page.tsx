'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NuevaVacunacionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pacientes, setPacientes] = useState<any[]>([])
  const [vacunas, setVacunas] = useState<any[]>([])
  const [establecimientos, setEstablecimientos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState({
    paciente_id: '',
    vacuna_id: '',
    establecimiento_id: '',
    numero_dosis: '1',
    lote_vacuna: '',
    temperatura_conservacion: '',
    fecha_vacunacion: new Date().toISOString().slice(0, 16),
    origen_datos: 'Manual',
    observaciones: '',
  })

  useEffect(() => {
    async function cargarDatos() {
      const [{ data: v }, { data: e }] = await Promise.all([
        supabase.from('vacuna').select('vacuna_id, vacuna_nombre, grupo_pai').eq('activa', true),
        supabase.from('establecimiento').select('establecimiento_id, nombre_establecimiento').eq('activo', true),
      ])
      setVacunas(v ?? [])
      setEstablecimientos(e ?? [])
    }
    cargarDatos()
  }, [])

  useEffect(() => {
    if (busqueda.length < 2) { setPacientes([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('paciente')
        .select('paciente_id, nombres, primer_apellido, documento_identidad')
        .or(`nombres.ilike.%${busqueda}%,primer_apellido.ilike.%${busqueda}%,documento_identidad.ilike.%${busqueda}%`)
        .limit(5)
      setPacientes(data ?? [])
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (!form.paciente_id || !form.vacuna_id || !form.establecimiento_id) {
      setError('Paciente, vacuna y establecimiento son obligatorios')
      setLoading(false)
      return
    }

    const timestamp = Date.now().toString().slice(-8)
    const registro_id = `REG-${timestamp}`

    const { error: err } = await supabase.from('registro_vacunacion').insert({
      registro_id,
      paciente_id: form.paciente_id,
      vacuna_id: form.vacuna_id,
      establecimiento_id: form.establecimiento_id,
      numero_dosis: parseInt(form.numero_dosis),
      lote_vacuna: form.lote_vacuna || null,
      temperatura_conservacion: form.temperatura_conservacion ? parseFloat(form.temperatura_conservacion) : null,
      fecha_vacunacion: form.fecha_vacunacion,
      origen_datos: form.origen_datos,
      observaciones: form.observaciones || null,
    })

    if (err) {
      setError('Error al guardar: ' + err.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/vacunaciones')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="font-bold text-slate-800">PAI Bolivia</h1>
              <p className="text-xs text-slate-400">Ministerio de Salud y Deportes</p>
            </div>
          </div>
          <Link href="/dashboard/vacunaciones" className="text-sm text-blue-600 hover:underline">
            ← Volver
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <h2 className="text-xl font-bold text-slate-800">Registrar vacunación</h2>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">

          <div>
            <label className="text-sm font-medium text-slate-700">Buscar paciente *</label>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre, apellido o CI..." />
            {pacientes.length > 0 && (
              <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden">
                {pacientes.map(p => (
                  <div
                    key={p.paciente_id}
                    onClick={() => {
                      setForm(prev => ({ ...prev, paciente_id: p.paciente_id }))
                      setBusqueda(`${p.nombres} ${p.primer_apellido}`)
                      setPacientes([])
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                      form.paciente_id === p.paciente_id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {p.nombres} {p.primer_apellido} — {p.documento_identidad ?? 'Sin CI'}
                  </div>
                ))}
              </div>
            )}
            {form.paciente_id && (
              <p className="text-xs text-green-600 mt-1">✓ Paciente seleccionado</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Vacuna *</label>
              <select name="vacuna_id" value={form.vacuna_id} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {vacunas.map(v => (
                  <option key={v.vacuna_id} value={v.vacuna_id}>
                    {v.vacuna_nombre} ({v.grupo_pai})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Número de dosis *</label>
              <select name="numero_dosis" value={form.numero_dosis} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="1">1ra dosis</option>
                <option value="2">2da dosis</option>
                <option value="3">3ra dosis</option>
                <option value="4">4ta dosis (refuerzo)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Establecimiento *</label>
              <select name="establecimiento_id" value={form.establecimiento_id} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {establecimientos.map(e => (
                  <option key={e.establecimiento_id} value={e.establecimiento_id}>
                    {e.nombre_establecimiento}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Fecha y hora *</label>
              <input type="datetime-local" name="fecha_vacunacion" value={form.fecha_vacunacion}
                onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Lote de vacuna</label>
              <input name="lote_vacuna" value={form.lote_vacuna} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: LOT-2024-001" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Temperatura (°C)</label>
              <input type="number" name="temperatura_conservacion" value={form.temperatura_conservacion}
                onChange={handleChange} step="0.1" min="-10" max="10"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 2.5" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Origen del registro</label>
              <select name="origen_datos" value={form.origen_datos} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Manual">Manual</option>
                <option value="La Paz">La Paz</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Rural Móvil">Rural Móvil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Observaciones</label>
            <textarea name="observaciones" value={form.observaciones} onChange={handleChange}
              rows={3}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales..." />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? 'Guardando...' : 'Registrar vacunación'}
            </Button>
            <Link href="/dashboard/vacunaciones">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
