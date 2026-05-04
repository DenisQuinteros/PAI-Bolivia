'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'

export default function VacunadorVacunacionesPage() {
  const [registros, setRegistros] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/vacunador/vacunaciones')
      .then(r => r.json())
      .then(d => { setRegistros(d.registros ?? []); setLoading(false) })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Vacunaciones</h1>
          <p className="text-sm text-slate-500">Registros que has realizado</p>
        </div>
        <Link href="/dashboard/vacunador/vacunaciones/nueva">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            + Registrar Vacunación
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Paciente</TableHead>
              <TableHead>Vacuna</TableHead>
              <TableHead>Dosis</TableHead>
              <TableHead>Establecimiento</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Lote</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  No has registrado vacunaciones aún
                </TableCell>
              </TableRow>
            ) : (
              registros.map(r => (
                <TableRow key={r.registro_id}>
                  <TableCell className="font-medium">
                    {r.paciente?.nombres} {r.paciente?.primer_apellido}
                  </TableCell>
                  <TableCell>{r.vacuna?.vacuna_nombre}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700">
                      Dosis {r.numero_dosis}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {r.establecimiento?.nombre_establecimiento}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(r.fecha_vacunacion).toLocaleDateString('es-BO')}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {r.lote_vacuna ?? '—'}
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
