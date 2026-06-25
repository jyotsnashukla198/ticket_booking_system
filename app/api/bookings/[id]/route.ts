import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, ctx: RouteContext<'/api/bookings/[id]'>) {
  const { id } = await ctx.params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { seats: { include: { seat: true } }, show: { include: { event: true, venue: true } } },
  })
  if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 })
  return Response.json(booking)
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/bookings/[id]'>) {
  const { id } = await ctx.params
  const booking = await prisma.booking.findUnique({ where: { id }, include: { seats: true } })

  if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.status === 'CANCELLED') return Response.json({ error: 'Already cancelled' }, { status: 400 })

  const seatIds = booking.seats.map((s) => s.seatId)

  await prisma.$transaction([
    prisma.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'AVAILABLE', lockedUntil: null, lockedBy: null },
    }),
    prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } }),
  ])

  return Response.json({ message: 'Booking cancelled, seats released' })
}