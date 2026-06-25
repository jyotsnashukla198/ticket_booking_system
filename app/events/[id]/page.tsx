import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      shows: {
        include: { venue: true },
        orderBy: { startsAt: 'asc' },
      },
    },
  })

  if (!event) notFound()

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-red-500 tracking-tight">
          🎫 TicketHub
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Event Info */}
        <div className="mb-8">
          <div className="h-48 bg-zinc-800 rounded-2xl flex items-center justify-center text-6xl mb-6">
            🎭
          </div>
          <h1 className="text-3xl font-bold text-zinc-100">{event.name}</h1>
          {event.description && (
            <p className="text-zinc-400 mt-2 text-base leading-relaxed">{event.description}</p>
          )}
        </div>

        {/* Shows */}
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Available Shows</h2>

        {event.shows.length === 0 ? (
          <p className="text-zinc-500">No shows scheduled yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {event.shows.map((show) => {
              const date = new Date(show.startsAt)
              const dateStr = date.toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
              })
              const timeStr = date.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit',
              })

              return (
                <div
                  key={show.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:border-red-500 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-zinc-100 text-lg">{show.venue.name}</p>
                    <p className="text-zinc-400 text-sm mt-1">{show.venue.city} · {show.venue.address}</p>
                    <p className="text-zinc-300 text-sm mt-2">
                      📅 {dateStr} &nbsp;·&nbsp; 🕐 {timeStr}
                    </p>
                  </div>

                  <Link
                    href={`/shows/${show.id}`}
                    className="ml-4 shrink-0 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                  >
                    Select
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            ← Back to all events
          </Link>
        </div>
      </main>
    </div>
  )
}
