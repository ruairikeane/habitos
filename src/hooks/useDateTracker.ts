import { useState, useEffect, useRef } from 'react';

interface DateTrackerResult {
  currentDate: string;
  hasDateChanged: boolean;
  resetDateChange: () => void;
}

export function useDateTracker(): DateTrackerResult {
  const [currentDate, setCurrentDate] = useState(() => 
    new Date().toISOString().split('T')[0]
  );
  const [hasDateChanged, setHasDateChanged] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnownDateRef = useRef(currentDate);

  useEffect(() => {
    // Check for date change every minute
    intervalRef.current = setInterval(() => {
      const newDate = new Date().toISOString().split('T')[0];
      
      if (newDate !== lastKnownDateRef.current) {
        console.log('Date changed detected:', lastKnownDateRef.current, '->', newDate);
        lastKnownDateRef.current = newDate;
        setCurrentDate(newDate);
        setHasDateChanged(true);
      }
    }, 60000); // Check every minute

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const resetDateChange = () => {
    setHasDateChanged(false);
  };

  return {
    currentDate,
    hasDateChanged,
    resetDateChange,
  };
}