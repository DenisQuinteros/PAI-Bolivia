'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Paciente {
  paciente_id: string
  nombres: string
  primer_apellido: string
  segundo_apellido: string | null
  documento_identidad: string | null
  genero: string
  fecha_nacimiento: string
  es_pueblo_indigena: boolean
  municipio: { nombre_municipio: string; codigo_departamento: string } | null
}

interface Props {
  pacientes: Paciente[]
  rolUsuario: string
}

export function AdminPacientesTable({ pacientes: inicial, rolUsuario }: Props) {
  const [pacientes, setPacientes] = useState(inicial)
  const [busqueda, setBusqueda]   = useState('')
  const [loading, setLoading]     = useState<string | null>(null)

  const filtrados = pacientes.filter(p => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      p.nombres.toLowerCase().includes(q) ||
      p.primer_apellido.toLowerCase().includes(q) ||
      (p.documento_identidad ?? '').toLowerCase().includes(q)
    )
  })

  async function eliminar(id: string) {
    setLoading(id)
    const res = await fetch(`/api/admin/pacientes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPacientes(prev => prev.filter(p => p.paciente_id !== id))
      toast.success('Paciente eliminado del sistema')
    } else {
      toast.error('Error al eliminar')
    }
    setLoading(null)
  }

  const puedeEliminar = rolUsuario === 'admin'

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nombre, apellido o CI..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="max-w-md"
      />
      <p className="text-xs text-slate-400">{filtrados.length} resultados</p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Paciente</TableHead>
              <TableHead>CI</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Nacimiento</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Pueblo indígena</TableHead>
              {puedeEliminar && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map(p => (
                <TableRow key={p.paciente_id}>
                  <TableCell className="font-medium">
                    {p.nombres} {p.primer_apellido}{' '}
                    {p.segundo_apellido ?? ''}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {p.documento_identidad ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={p.genero === 'M'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-pink-100 text-pink-700'
                    }>
                      {p.genero === 'M' ? 'M' : 'F'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {p.fecha_nacimiento}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {p.municipio?.nombre_municipio ?? '—'}
                  </TableCell>
                  <TableCell>
                    {p.es_pueblo_indigena ? (
                      <Badge className="bg-amber-100 text-amber-700">Sí</Badge>
                    ) : (
                      <span className="text-slate-400 text-sm">No</span>
                    )}
                  </TableCell>
                  {puedeEliminar && (
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            disabled={loading === p.paciente_id}
                          >
                            Eliminar
                          </Button>
                        } />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará a{' '}
                              <strong>{p.nombres} {p.primer_apellido}</strong>.
                              Esta acción no puede deshacerse.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => eliminar(p.paciente_id)}
                            >
                              Sí, eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
