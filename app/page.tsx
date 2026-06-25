import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const events = await prisma.event.findMany({
    include: { shows: { include: { venue: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-red-500 tracking-tight">🎫 TicketHub</h1>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold text-zinc-100 mb-6">Upcoming Events</h2>

        {events.length === 0 ? (
          <p className="text-zinc-400">No events found. Run the seed to add sample data.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-500 transition-colors cursor-pointer">
                  {/* Poster placeholder */}
                  <div className="h-40 bg-zinc-800 flex items-center justify-center text-4xl">
                    🎭
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-100 text-lg leading-tight">{event.name}</h3>
                    {event.description && (
                      <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                    )}

                    {/* Cities */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[...new Set(event.shows.map((s) => s.venue.city))].map((city) => (
                        <span key={city} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">
                          {city}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4">
                      <span className="text-sm font-medium text-red-400">
                        {event.shows.length} show{event.shows.length !== 1 ? 's' : ''} available →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
