"use client";

import { useEffect, useMemo, useState } from "react";

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

const seatStyleMap = {
  REGULAR: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  PREMIUM: "border-accent/20 bg-accent/10 text-accent hover:bg-accent/15",
  VIP: "border-secondary/25 bg-secondary/12 text-secondary hover:bg-secondary/18",
};

export function SeatSelector({ eventId, onSeatsSelected }: SeatSelectorProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchSeats() {
      try {
        const res = await fetch(`/api/seats?eventId=${eventId}`);
        const data = (await res.json()) as {
          seatLayout?: { seats?: Seat[] };
        };

        if (active) {
          setSeats(data.seatLayout?.seats ?? []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchSeats();

    return () => {
      active = false;
    };
  }, [eventId]);

  const rows = useMemo(() => [...new Set(seats.map((seat) => seat.row))].sort(), [seats]);

  function toggleSeat(row: string, number: number) {
    const seatId = `${row}${number}`;
    const seat = seats.find((entry) => entry.row === row && entry.number === number);

    if (seat?.status !== "AVAILABLE") {
      return;
    }

    const nextSelection = selectedSeats.includes(seatId)
      ? selectedSeats.filter((value) => value !== seatId)
      : [...selectedSeats, seatId];

    setSelectedSeats(nextSelection);
    onSeatsSelected(nextSelection);
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-border bg-white/76 p-8 text-center text-sm text-muted-foreground">
        Loading seats...
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-white/76 p-8 text-center text-sm text-muted-foreground">
        Seat selection is not available for this event.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-border bg-[linear-gradient(145deg,#f5f4f0_0%,#ece9e2_100%)] px-6 py-4 text-center">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Stage
        </p>
      </div>

      <div className="space-y-3 rounded-[28px] border border-border bg-white/82 p-5">
        {rows.map((row) => (
          <div key={row} className="flex items-start gap-3">
            <span className="mt-2 w-8 text-sm font-semibold text-foreground">{row}</span>
            <div className="flex flex-wrap gap-2">
              {seats
                .filter((seat) => seat.row === row)
                .map((seat) => {
                  const seatId = `${seat.row}${seat.number}`;
                  const isSelected = selectedSeats.includes(seatId);
                  const isAvailable = seat.status === "AVAILABLE";

                  return (
                    <button
                      key={seatId}
                      onClick={() => toggleSeat(seat.row, seat.number)}
                      disabled={!isAvailable}
                      className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(24,34,53,0.16)]"
                          : isAvailable
                            ? seatStyleMap[seat.type]
                            : "cursor-not-allowed border-border bg-muted text-muted-foreground/70"
                      }`}
                      type="button"
                    >
                      {seat.number}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-2 rounded-[20px] border border-border bg-white/82 px-4 py-3 text-sm">
          <div className="h-5 w-5 rounded-md border border-emerald-200 bg-emerald-50" />
          <span>Regular</span>
        </div>
        <div className="flex items-center gap-2 rounded-[20px] border border-border bg-white/82 px-4 py-3 text-sm">
          <div className="h-5 w-5 rounded-md border border-accent/20 bg-accent/10" />
          <span>Premium</span>
        </div>
        <div className="flex items-center gap-2 rounded-[20px] border border-border bg-white/82 px-4 py-3 text-sm">
          <div className="h-5 w-5 rounded-md border border-secondary/25 bg-secondary/12" />
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-2 rounded-[20px] border border-border bg-white/82 px-4 py-3 text-sm">
          <div className="h-5 w-5 rounded-md border border-border bg-muted" />
          <span>Unavailable</span>
        </div>
      </div>

      {selectedSeats.length > 0 ? (
        <div className="rounded-[24px] border border-primary/12 bg-primary/6 p-4">
          <p className="text-sm font-semibold text-foreground">
            Selected seats: {selectedSeats.join(", ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
