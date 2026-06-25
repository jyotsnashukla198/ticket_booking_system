import { prisma } from '@/lib/prisma'

export async function GET() {
  const venues = await prisma.venue.findMany()
  return Response.json(venues)
}

export async function POST(request: Request) {
  const { name, city, address } = await request.json()
  if (!name || !city) return Response.json({ error: 'name and city are required' }, { status: 400 })

  const venue = await prisma.venue.create({ data: { name, city, address } })
  return Response.json(venue, { status: 201 })
}