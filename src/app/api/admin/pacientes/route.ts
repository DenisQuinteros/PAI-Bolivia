import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const busqueda = searchParams.get('q') ?? ''
  const pagina   = parseInt(searchParams.get('pagina') ?? '1')
  const porPagina = 20
  const desde = (pagina - 1) * porPagina

  let query: any = (supabase as any)
    .from('paciente')
    .select('*, municipio:municipio_residencia(nombre_municipio)', { count: 'exact' })
    .eq('eliminado' as any, false)
    .order('created_at', { ascending: false })
    .range(desde, desde + porPagina - 1)

  if (busqueda) {
    query = query.or(
      `nombres.ilike.%${busqueda}%,primer_apellido.ilike.%${busqueda}%,documento_identidad.ilike.%${busqueda}%`
    )
  }

  const { data: pacientes, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pacientes, total: count, pagina, porPagina })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const timestamp = Date.now().toString().slice(-8)
  const paciente_id = `PAC-${timestamp}`

  const { data, error } = await supabase
    .from('paciente')
    .insert({ ...body, paciente_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ paciente: data })
}
