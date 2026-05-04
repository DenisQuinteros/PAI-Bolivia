'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Usuario {
  id: string
  nombre_completo: string
  rol: string
  activo: boolean
  eliminado: boolean
  created_at: string
  establecimiento_id: string | null
}

const colorRol: Record<string, string> = {
  admin:       'bg-red-100 text-red-700',
  supervisor:  'bg-orange-100 text-orange-700',
  vacunador:   'bg-green-100 text-green-700',
  estadistica: 'bg-purple-100 text-purple-700',
}

export function UsuariosTable({ usuarios: inicial }: { usuarios: Usuario[] }) {
  const [usuarios, setUsuarios] = useState(inicial)
  const [loading, setLoading]   = useState<string | null>(null)

  async function cambiarRol(id: string, rol: string) {
    setLoading(id)
    const res = await fetch(`/api/admin/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol }),
    })
    if (res.ok) {
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol } : u))
      toast.success('Rol actualizado correctamente')
    } else {
      toast.error('Error al actualizar rol')
    }
    setLoading(null)
  }

  async function toggleActivo(id: string, activo: boolean) {
    setLoading(id)
    const res = await fetch(`/api/admin/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !activo }),
    })
    if (res.ok) {
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !activo } : u))
      toast.success(activo ? 'Usuario desactivado' : 'Usuario activado')
    } else {
      toast.error('Error al actualizar usuario')
    }
    setLoading(null)
  }

  async function eliminarUsuario(id: string) {
    setLoading(id)
    const res = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsuarios(prev => prev.filter(u => u.id !== id))
      toast.success('Usuario eliminado')
    } else {
      toast.error('Error al eliminar usuario')
    }
    setLoading(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registrado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map(u => (
            <TableRow key={u.id} className={!u.activo ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{u.nombre_completo}</TableCell>
              <TableCell>
                <Select
                  value={u.rol}
                  onValueChange={v => cambiarRol(u.id, v)}
                  disabled={loading === u.id}
                >
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="vacunador">Vacunador</SelectItem>
                    <SelectItem value="estadistica">Estadística</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge className={u.activo
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-500'
                }>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {new Date(u.created_at).toLocaleDateString('es-BO')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={loading === u.id}
                    onClick={() => toggleActivo(u.id, u.activo)}
                  >
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        disabled={loading === u.id}
                      >
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción desactivará permanentemente a{' '}
                          <strong>{u.nombre_completo}</strong>.
                          No podrá acceder al sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => eliminarUsuario(u.id)}
                        >
                          Sí, eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
