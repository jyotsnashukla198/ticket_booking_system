import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import SeatMap from './SeatMap'

export default async function ShowPage({params}:{params: Promise<{id:string}>}){
  const { id } = await params;
//   release expired locks before rendering
 await prisma.seat.updateMany({
    where:{showId:id,status:'LOCKED', lockedUntil:{lt:new Date()}},
    data:{status:'AVAILABLE', lockedUntil: null, lockedBy: null} 
 })

const show = await prisma.show.findUnique({
    where:{id},
    include:{
        event: true,
        venue: true,
        seats:{orderBy:[{row:'asc'},{number:'asc'}]}
    },
})
if(!show) notFound()
 const dateStr = new Date(show.startsAt).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = new Date(show.startsAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
       <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-red-500 tracking-tight">
          🎫 TicketHub
        </Link>
      </header>
       <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">{show.event.name}</h1>
          <p className="text-zinc-400 mt-1">{show.venue.name} · {show.venue.city}</p>
          <p className="text-zinc-300 text-sm mt-1">📅 {dateStr} &nbsp;·&nbsp; 🕐 {timeStr}</p>
        </div>
        <SeatMap seats={show.seats} showId={show.id} />

        <div className="mt-8">
          <Link href={`/events/${show.eventId}`} className="text-zinc-500 hover:text-zinc-300 text-sm">
            ← Back to shows
          </Link>
        </div>


      </main> 
    </div>
  )
}