"use client";

import { useState, useEffect } from "react";

interface Seat {
  row: string;
  number: number;
  type: "REGULAR" | "VIP" | "PREMIUM";
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
}

interface SeatSelectorProps {
  eventId: string;
  onSeatsSelected: (seats: string[]) => void;
}

export function SeatSelector({ eventId, onSeatsSelected }: SeatSelectorProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
  }, [eventId]);

  const fetchSeats = async () => {
    try {
      const res = await fetch(`/api/seats?eventId=${eventId}`);
      const data = await res.json();
      setSeats(data.seatLayout?.seats || []);
    } catch (error) {
      console.error("Failed to fetch seats:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (row: string, number: number) => {
    const seatId = `${row}${number}`;
    const seat = seats.find((s) => s.row === row && s.number === number);

    if (seat?.status !== "AVAILABLE") return;

    const newSelected = selectedSeats.includes(seatId)
      ? selectedSeats.filter((s) => s !== seatId)
      : [...selectedSeats, seatId];

    setSelectedSeats(newSelected);
    onSeatsSelected(newSelected);
  };

  if (loading) {
    return <div className="text-center py-8">Loading seats...</div>;
  }

  if (seats.length === 0) {
    return <div className="text-center py-8">Seat selection not available</div>;
  }

  const rows = [...new Set(seats.map((s) => s.row))].sort();

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="inline-block bg-gray-800 text-white px-8 py-2 rounded">STAGE</div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-8 font-semibold">{row}</span>
            <div className="flex gap-2 flex-wrap">
              {seats
                .filter((s) => s.row === row)
                .map((seat) => {
                  const seatId = `${seat.row}${seat.number}`;
                  const isSelected = selectedSeats.includes(seatId);
                  const isAvailable = seat.status === "AVAILABLE";

                  return (
                    <button
                      key={seatId}
                      onClick={() => toggleSeat(seat.row, seat.number)}
                      disabled={!isAvailable}
                      className={`w-10 h-10 rounded text-sm font-medium ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : isAvailable
                          ? seat.type === "VIP"
                            ? "bg-yellow-200 hover:bg-yellow-300"
                            : seat.type === "PREMIUM"
                            ? "bg-purple-200 hover:bg-purple-300"
                            : "bg-green-200 hover:bg-green-300"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-200 rounded"></div>
          <span>Regular</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-200 rounded"></div>
          <span>Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-200 rounded"></div>
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span>Booked</span>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold">Selected Seats: {selectedSeats.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
