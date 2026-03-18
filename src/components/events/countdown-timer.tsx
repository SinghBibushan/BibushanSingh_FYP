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

export function CountdownTimer({ targetDate, size = "md" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

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
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

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
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 p-3 backdrop-blur-sm">
          <span className={`${classes.number} font-bold gradient-text`}>
            {timeLeft.days}
          </span>
          <span className={`${classes.label} text-muted-foreground uppercase tracking-wider`}>
            Days
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 border border-secondary/30 p-3 backdrop-blur-sm">
          <span className={`${classes.number} font-bold gradient-text`}>
            {timeLeft.hours}
          </span>
          <span className={`${classes.label} text-muted-foreground uppercase tracking-wider`}>
            Hours
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 p-3 backdrop-blur-sm">
          <span className={`${classes.number} font-bold gradient-text`}>
            {timeLeft.minutes}
          </span>
          <span className={`${classes.label} text-muted-foreground uppercase tracking-wider`}>
            Mins
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 p-3 backdrop-blur-sm animate-pulse">
          <span className={`${classes.number} font-bold gradient-text`}>
            {timeLeft.seconds}
          </span>
          <span className={`${classes.label} text-muted-foreground uppercase tracking-wider`}>
            Secs
          </span>
        </div>
      </div>
    </div>
  );
}
