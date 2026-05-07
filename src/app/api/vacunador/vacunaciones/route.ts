import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: registros, error } = await supabase
    .from('registro_vacunacion')
    .select(`
      *,
      paciente:paciente_id (nombres, primer_apellido, documento_identidad),
      vacuna:vacuna_id (vacuna_nombre, grupo_pai),
      establecimiento:establecimiento_id (nombre_establecimiento)
    `)
    .order('fecha_vacunacion', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ registros })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await request.json()

  const timestamp = Date.now().toString().slice(-8)
  const registro_id = `REG-${timestamp}`

  const { data, error } = await supabase
    .from('registro_vacunacion')
    .insert({
      ...body,
      registro_id,
      registrado_por: user.id,
      origen_datos: 'Manual',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ registro: data })
}
