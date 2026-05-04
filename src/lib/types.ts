export type Rol = 'admin' | 'supervisor' | 'vacunador' | 'estadistica'

export interface UsuarioPerfil {
  id: string
  nombre_completo: string
  rol: Rol
  establecimiento_id: string | null
  municipio_id: string | null
  telefono: string | null
  activo: boolean
}

export interface Departamento {
  codigo_departamento: string
  departamento_nombre: string
  poblacion_estimada: number
}

export interface Municipio {
  municipio_id: string
  codigo_departamento: string
  nombre_municipio: string
  zona_geografica: string
  es_capital_departamental: boolean
}

export interface Establecimiento {
  establecimiento_id: string
  municipio_id: string
  nombre_establecimiento: string
  tipo_establecimiento: string
  nivel_atencion: number
  tiene_cadena_frio: boolean
  activo: boolean
}

export interface Vacuna {
  vacuna_id: string
  vacuna_nombre: string
  enfermedad_previene: string
  grupo_pai: string
  numero_dosis: number
  via_administracion: string
  sitio_aplicacion: string
  dosis_ml: number
}

export interface Paciente {
  paciente_id: string
  documento_identidad: string
  nombres: string
  primer_apellido: string
  segundo_apellido: string | null
  genero: 'M' | 'F'
  fecha_nacimiento: string
  municipio_residencia: string | null
  es_pueblo_indigena: boolean
  comunidad_indigena: string | null
}

export interface RegistroVacunacion {
  registro_id: string
  paciente_id: string
  vacuna_id: string
  establecimiento_id: string
  registrado_por: string
  fecha_vacunacion: string
  numero_dosis: number
  lote_vacuna: string | null
  temperatura_conservacion: number | null
  origen_datos: 'La Paz' | 'Santa Cruz' | 'Rural Móvil' | 'Manual'
  observaciones: string | null
}
