'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NuevoPacientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (!form.nombres || !form.primer_apellido || !form.fecha_nacimiento) {
      setError('Nombres, primer apellido y fecha de nacimiento son obligatorios')
      setLoading(false)
      return
    }

    // Generar ID del paciente
    const timestamp = Date.now().toString().slice(-6)
    const paciente_id = `PAC-${timestamp}`

    const { error: err } = await supabase.from('paciente').insert({
      paciente_id,
      nombres: form.nombres.toUpperCase(),
      primer_apellido: form.primer_apellido.toUpperCase(),
      segundo_apellido: form.segundo_apellido || null,
      documento_identidad: form.documento_identidad || null,
      genero: form.genero,
      fecha_nacimiento: form.fecha_nacimiento,
      es_pueblo_indigena: form.es_pueblo_indigena,
      comunidad_indigena: form.comunidad_indigena || null,
    })

    if (err) {
      setError('Error al guardar: ' + err.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/pacientes')
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
          <Link href="/dashboard/pacientes" className="text-sm text-blue-600 hover:underline">
            ← Volver a Pacientes
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <h2 className="text-xl font-bold text-slate-800">Registrar nuevo paciente</h2>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nombres *</label>
              <input name="nombres" value={form.nombres} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: JUAN CARLOS" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Primer apellido *</label>
              <input name="primer_apellido" value={form.primer_apellido} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: MAMANI" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Segundo apellido</label>
              <input name="segundo_apellido" value={form.segundo_apellido} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: QUISPE" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Cédula de identidad</label>
              <input name="documento_identidad" value={form.documento_identidad} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 12345678 LP" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Género *</label>
              <select name="genero" value={form.genero} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Fecha de nacimiento *</label>
              <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" name="es_pueblo_indigena" id="indigena"
              checked={form.es_pueblo_indigena}
              onChange={handleChange}
              className="rounded" />
            <label htmlFor="indigena" className="text-sm text-slate-700">
              Pertenece a pueblo indígena originario
            </label>
          </div>

          {form.es_pueblo_indigena && (
            <div>
              <label className="text-sm font-medium text-slate-700">Comunidad indígena</label>
              <input name="comunidad_indigena" value={form.comunidad_indigena} onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Comunidad Aymara" />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Guardando...' : 'Registrar paciente'}
            </Button>
            <Link href="/dashboard/pacientes">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
