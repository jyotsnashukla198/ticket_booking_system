import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, ctx: RouteContext<'/api/bookings/[id]/confirm'>) {
  const { id } = await ctx.params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { seats: true },
  })

  if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.status !== 'PENDING') return Response.json({ error: 'Booking is not pending' }, { status: 400 })
  if (booking.expiresAt && booking.expiresAt < new Date())
    return Response.json({ error: 'Booking has expired' }, { status: 410 })

  const seatIds = booking.seats.map((s) => s.seatId)

  await prisma.$transaction([
    prisma.seat.updateMany({ where: { id: { in: seatIds } }, data: { status: 'BOOKED' } }),
    prisma.booking.update({ where: { id }, data: { status: 'CONFIRMED' } }),
  ])

  return Response.json({ message: 'Booking confirmed' })
}