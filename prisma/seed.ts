import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function main() {
  // Users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice', email: 'alice@example.com' },
  })
  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob', email: 'bob@example.com' },
  })

  // Venues
  const venue1 = await prisma.venue.upsert({
    where: { id: 'venue-mmrda' },
    update: {},
    create: { id: 'venue-mmrda', name: 'MMRDA Grounds', city: 'Mumbai', address: 'BKC, Mumbai' },
  })
  const venue2 = await prisma.venue.upsert({
    where: { id: 'venue-chinnaswamy' },
    update: {},
    create: { id: 'venue-chinnaswamy', name: 'Chinnaswamy Stadium', city: 'Bangalore', address: 'MG Road, Bangalore' },
  })

  // Events
  const event1 = await prisma.event.upsert({
    where: { id: 'event-coldplay' },
    update: {},
    create: {
      id: 'event-coldplay',
      name: 'Coldplay: Music of the Spheres',
      description: 'Coldplay World Tour 2026 — Live in India',
      imageUrl: 'https://example.com/coldplay.jpg',
    },
  })
  const event2 = await prisma.event.upsert({
    where: { id: 'event-ipl' },
    update: {},
    create: {
      id: 'event-ipl',
      name: 'IPL 2026 Final',
      description: 'Indian Premier League Grand Final',
      imageUrl: 'https://example.com/ipl.jpg',
    },
  })

  // Shows
  const show1 = await prisma.show.upsert({
    where: { id: 'show-coldplay-mumbai' },
    update: {},
    create: {
      id: 'show-coldplay-mumbai',
      eventId: event1.id,
      venueId: venue1.id,
      startsAt: new Date('2026-07-10T20:00:00'),
      endsAt: new Date('2026-07-10T23:00:00'),
    },
  })
  const show2 = await prisma.show.upsert({
    where: { id: 'show-coldplay-bangalore' },
    update: {},
    create: {
      id: 'show-coldplay-bangalore',
      eventId: event1.id,
      venueId: venue2.id,
      startsAt: new Date('2026-07-15T19:00:00'),
      endsAt: new Date('2026-07-15T22:00:00'),
    },
  })
  const show3 = await prisma.show.upsert({
    where: { id: 'show-ipl-mumbai' },
    update: {},
    create: {
      id: 'show-ipl-mumbai',
      eventId: event2.id,
      venueId: venue2.id,
      startsAt: new Date('2026-06-20T19:30:00'),
      endsAt: new Date('2026-06-20T23:30:00'),
    },
  })

  // Seats for show1 (Coldplay Mumbai)
  // 3 categories: GOLD (rows A-B), SILVER (rows C-D), BRONZE (rows E-F)
  const categories = [
    { rows: ['A', 'B'], category: 'GOLD',   price: 5000 },
    { rows: ['C', 'D'], category: 'SILVER', price: 3000 },
    { rows: ['E', 'F'], category: 'BRONZE', price: 1500 },
  ]

  for (const show of [show1, show2, show3]) {
    for (const { rows, category, price } of categories) {
      for (const row of rows) {
        for (let number = 1; number <= 10; number++) {
          await prisma.seat.upsert({
            where: { showId_row_number: { showId: show.id, row, number } },
            update: {},
            create: { showId: show.id, row, number, category, price },
          })
        }
      }
    }
  }

  console.log('Seeded:')
  console.log(`  Users   : ${user1.name}, ${user2.name}`)
  console.log(`  Events  : ${event1.name}, ${event2.name}`)
  console.log(`  Venues  : ${venue1.name}, ${venue2.name}`)
  console.log(`  Shows   : ${show1.id}, ${show2.id}, ${show3.id}`)
  console.log(`  Seats   : 60 per show (rows A-F, 10 seats each)`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
