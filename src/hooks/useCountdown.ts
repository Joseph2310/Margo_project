import { useEffect, useState } from 'react';

export const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(current => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return {
    seconds,
    restart: (nextSeconds = initialSeconds) => setSeconds(nextSeconds),
  };
};
