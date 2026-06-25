import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const event = await prisma.event.findUnique({
    where: { id },
    include: { shows: { include: { venue: true } } },
  })
  if (!event) return Response.json({ error: 'Event not found' }, { status: 404 })
  return Response.json(event)
}