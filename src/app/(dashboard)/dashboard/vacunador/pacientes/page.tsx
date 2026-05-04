'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'

export default function VacunadorPacientesPage() {
  const supabase = createClient()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [busqueda, setBusqueda]   = useState('')
  const [loading, setLoading]     = useState(true)

  const cargar = useCallback(async (q: string) => {
    setLoading(true)
    let query = supabase
      .from('paciente')
      .select('*, municipio:municipio_residencia(nombre_municipio)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (q.length > 1) {
      query = query.or(
        `nombres.ilike.%${q}%,primer_apellido.ilike.%${q}%,documento_identidad.ilike.%${q}%`
      )
    }

    const { data } = await query
    setPacientes(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => cargar(busqueda), 300)
    return () => clearTimeout(timer)
  }, [busqueda, cargar])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-sm text-slate-500">Busca o registra pacientes</p>
        </div>
        <Link href="/dashboard/vacunador/pacientes/nuevo">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            + Nuevo Paciente
          </Button>
        </Link>
      </div>

      <Input
        placeholder="Buscar por nombre, apellido o CI..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="max-w-md"
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Paciente</TableHead>
              <TableHead>CI</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Nacimiento</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : pacientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            ) : (
              pacientes.map(p => (
                <TableRow key={p.paciente_id}>
                  <TableCell className="font-medium">
                    {p.nombres} {p.primer_apellido} {p.segundo_apellido ?? ''}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {p.documento_identidad ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={p.genero === 'M'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-pink-100 text-pink-700'
                    }>
                      {p.genero === 'M' ? 'Masculino' : 'Femenino'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{p.fecha_nacimiento}</TableCell>
                  <TableCell className="text-slate-500">
                    {p.municipio?.nombre_municipio ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/vacunador/pacientes/${p.paciente_id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver historial →
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
