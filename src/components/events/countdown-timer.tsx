"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date | string;
  size?: "sm" | "md" | "lg";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(targetDate: Date | string, currentTime = Date.now()): TimeLeft {
  const target = new Date(targetDate).getTime();
  const difference = target - currentTime;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

export function CountdownTimer({ targetDate, size = "md" }: CountdownTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeLeft = calculateTimeLeft(targetDate, now);

  const sizeClasses = {
    sm: {
      container: "text-xs",
      number: "text-lg",
      label: "text-[10px]",
    },
    md: {
      container: "text-sm",
      number: "text-2xl",
      label: "text-xs",
    },
    lg: {
      container: "text-base",
      number: "text-4xl",
      label: "text-sm",
    },
  };

  const classes = sizeClasses[size];

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className={classes.container}>Event has started</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4 text-primary" />
        <span className={classes.container}>Event starts in:</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20 p-3 backdrop-blur-sm">
          <span className={`${classes.number} font-bold gradient-text`}>
            {timeLeft.days}
          </span>
          <span className={`${classes.label} uppercase tracking-wider text-muted-foreground`}>
            Days
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-secondary/30 bg-gradient-to-br from-secondary/20 to-accent/20 p-3 backdrop-blur-sm">
          <span className={`${classes.number} font-bold gradient-text`}>
            {timeLeft.hours}
          </span>
          <span className={`${classes.label} uppercase tracking-wider text-muted-foreground`}>
            Hours
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-accent/30 bg-gradient-to-br from-accent/20 to-primary/20 p-3 backdrop-blur-sm">
          <span className={`${classes.number} font-bold gradient-text`}>
            {timeLeft.minutes}
          </span>
          <span className={`${classes.label} uppercase tracking-wider text-muted-foreground`}>
            Mins
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20 p-3 backdrop-blur-sm">
          <span className={`${classes.number} font-bold gradient-text`}>
            {timeLeft.seconds}
          </span>
          <span className={`${classes.label} uppercase tracking-wider text-muted-foreground`}>
            Secs
          </span>
        </div>
      </div>
    </div>
  );
}
