import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [
    { data: vacunas },
    { data: establecimientos },
    { data: municipios },
    { data: departamentos },
  ] = await Promise.all([
    supabase.from('vacuna').select('vacuna_id, vacuna_nombre, grupo_pai').eq('activa', true),
    supabase.from('establecimiento').select('establecimiento_id, nombre_establecimiento, municipio_id').eq('activo', true),
    supabase.from('municipio').select('municipio_id, nombre_municipio, codigo_departamento'),
    supabase.from('departamento').select('codigo_departamento, departamento_nombre'),
  ])

  return NextResponse.json({ vacunas, establecimientos, municipios, departamentos })
}
