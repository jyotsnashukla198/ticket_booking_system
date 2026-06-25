'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Seat = {
    id: string
    row: string
    number: number
    category: string
    price: number
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED'
}

const CATEGORY_COLORS = {
  GOLD:   { bg: 'bg-yellow-500', text: 'text-yellow-400' },
  SILVER: { bg: 'bg-zinc-400',   text: 'text-zinc-300'   },
  BRONZE: { bg: 'bg-orange-700', text: 'text-orange-400' },
}

export default function SeatMap({seats, showId}:{seats: Seat[]; showId: string}){
    const router = useRouter()
    const [selected, setSelected] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
     const [error, setError] = useState('')

     // Group seats by row
  const rows = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {})

    const totalAmount = seats
    .filter((s) => selected.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return
    setSelected((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    )
  }

  const handleLock = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/bookings/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        showId,
        seatIds: selected,
        userId: 'cmpxub8ps0000iosf4lu7xkpv', // hardcoded for now — replace with auth later
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error)
    router.push(`/bookings/${data.id}`)
  }
   return (
    <div>
      {/* Stage */}
      <div className="text-center mb-8">
        <div className="inline-block bg-zinc-700 text-zinc-300 text-sm px-16 py-2 rounded-t-full">
          STAGE
        </div>
      </div>

      {/* Seat rows */}
      <div className="flex flex-col gap-3 mb-8">
        {Object.entries(rows).map(([row, rowSeats]) => {
          const category = rowSeats[0].category
          const colors = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
          return (
            <div key={row} className="flex items-center gap-3">
              <span className={`w-16 text-xs font-semibold ${colors.text}`}>
                {category}
              </span>
              <span className="w-4 text-zinc-500 text-sm font-mono">{row}</span>
              <div className="flex gap-1.5 flex-wrap">
                {rowSeats.map((seat) => {
                  const isSelected = selected.includes(seat.id)
                  const isAvailable = seat.status === 'AVAILABLE'
                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      disabled={!isAvailable}
                      title={`${seat.row}${seat.number} — ₹${seat.price}`}
                      className={`w-8 h-8 rounded text-xs font-mono transition-colors
                        ${isSelected
                          ? 'bg-red-500 text-white'
                          : seat.status === 'BOOKED'
                          ? 'bg-zinc-700 text-zinc-600 cursor-not-allowed'
                          : seat.status === 'LOCKED'
                          ? 'bg-yellow-700 text-yellow-900 cursor-not-allowed'
                          : `${colors.bg} text-zinc-900 hover:opacity-80 cursor-pointer`
                        }`}
                    >
                      {seat.number}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-xs text-zinc-400 mb-6">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-yellow-500 inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-red-500 inline-block" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-yellow-700 inline-block" /> Locked</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-zinc-700 inline-block" /> Booked</span>
      </div>

      {/* Footer */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-zinc-300 text-sm">
              {selected.length} seat{selected.length > 1 ? 's' : ''} selected
            </p>
            <p className="text-white font-bold text-lg">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-4">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleLock}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? 'Locking...' : 'Lock Seats →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}