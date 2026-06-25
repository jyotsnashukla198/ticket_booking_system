import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { showId, seatIds, userId } = await request.json()
  if (!showId || !seatIds?.length || !userId)
    return Response.json({ error: 'showId, seatIds and userId are required' }, { status: 400 })

  const lockedUntil = new Date(Date.now() + 10 * 60 * 1000) // 10 min hold

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.seat.updateMany({
        where: {
          id: { in: seatIds },
          status: 'AVAILABLE',
          OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
        },
        data: { status: 'LOCKED', lockedUntil, lockedBy: userId },
      })

      // if count doesn't match, another user grabbed one of these seats
      if (updated.count !== seatIds.length) throw new Error('SEATS_UNAVAILABLE')

      const seats = await tx.seat.findMany({ where: { id: { in: seatIds } } })
      const totalAmount = seats.reduce((sum, s) => sum + s.price, 0)

      return tx.booking.create({
        data: {
          userId, showId, totalAmount,
          status: 'PENDING',
          expiresAt: lockedUntil,
          seats: { create: seatIds.map((seatId: string) => ({ seatId })) },
        },
        include: { seats: true },
      })
    })

    return Response.json(booking, { status: 201 })
  } catch (e: any) {
    if (e.message === 'SEATS_UNAVAILABLE')
      return Response.json({ error: 'One or more seats are no longer available.' }, { status: 409 })
    throw e
  }
}