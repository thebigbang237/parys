// app/(admin)/admin/coaching/_components/BookingsList.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Booking = {
  id: string
  start_datetime: Date
  end_datetime: Date
  status: string
  meet_join_url: string | null
  intake_goal: string | null
  currency_paid: string
  amount_paid: number
  user: { name: string | null; email: string }
  session_type: { name: string; duration: number }
}

export default function BookingsList({
  bookings,
  total,
}: {
  bookings: Booking[]
  total?: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function confirmBooking(id: string) {
    setLoading(id)
    await fetch("/api/admin/coaching/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CONFIRMED" }),
    })
    setLoading(null)
    router.refresh()
  }

  async function cancelBooking(id: string) {
    if (!confirm("Annuler cette session ?")) return
    setLoading(id)
    await fetch("/api/admin/coaching/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CANCELLED" }),
    })
    setLoading(null)
    router.refresh()
  }

  async function completeBooking(id: string) {
    if (!confirm("Marquer cette session comme terminée ?")) return
    setLoading(id)
    await fetch("/api/admin/coaching/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "COMPLETED" }),
    })
    setLoading(null)
    router.refresh()
  }

  const statusLabel: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    CANCELLED: "Annulée",
    COMPLETED: "Terminée",
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-600",
    CONFIRMED: "bg-green-50 text-green-600",
    CANCELLED: "bg-red-50 text-red-600",
    COMPLETED: "bg-gray-100 text-gray-500",
  }

  return (
    <div>
      <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium mb-6">
        Réservations ({total ?? bookings.length})
      </h2>

      {bookings.length === 0 ? (
        <div className="border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">Aucune réservation</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fdf0fa] border-b border-[#f0e0ec]">
              <tr>
                {["Étudiante", "Session", "Date", "Montant", "Statut", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs tracking-[2px] uppercase text-gray-500 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.user.name || "—"}
                    </p>
                    <p className="text-xs text-gray-500">{booking.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">
                      {booking.session_type.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.session_type.duration} min
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(booking.start_datetime).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    <br />
                    <span className="text-xs text-gray-500">
                      {new Date(booking.start_datetime).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-serif text-gray-900">
                    {booking.amount_paid.toLocaleString("en-US")} {booking.currency_paid}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[booking.status]}`}>
                      {statusLabel[booking.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {booking.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmBooking(booking.id)}
                          disabled={loading === booking.id}
                          className="text-xs bg-green-600 text-white px-3 py-1 hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          disabled={loading === booking.id}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <div className="space-y-2">
                        {booking.meet_join_url && (
                          <a
                            href={booking.meet_join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#ff63ce] hover:underline block"
                          >
                            Lien Meet →
                          </a>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => completeBooking(booking.id)}
                            disabled={loading === booking.id}
                            className="text-xs bg-gray-800 text-white px-3 py-1 hover:bg-[#111] transition-colors disabled:opacity-50"
                          >
                            Marquer terminée
                          </button>
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            disabled={loading === booking.id}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}