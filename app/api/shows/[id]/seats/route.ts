import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, ctx: any) {
  const { id } = await ctx.params

  // release any expired locks before returning seat map
  await prisma.seat.updateMany({
    where: { showId: id, status: 'LOCKED', lockedUntil: { lt: new Date() } },
    data: { status: 'AVAILABLE', lockedUntil: null, lockedBy: null },
  })

  const seats = await prisma.seat.findMany({
    where: { showId: id },
    orderBy: [{ row: 'asc' }, { number: 'asc' }],
  })
  return Response.json(seats)
}