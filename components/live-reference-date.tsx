"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LiveReferenceDateContext = createContext<Date | null>(null);

export function LiveReferenceDateProvider({
  initialTime,
  children,
}: {
  initialTime: string;
  children: React.ReactNode;
}) {
  const initialDate = useMemo(() => new Date(initialTime), [initialTime]);
  const [referenceDate, setReferenceDate] = useState(initialDate);

  useEffect(() => {
    const update = () => setReferenceDate(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <LiveReferenceDateContext.Provider value={referenceDate}>
      {children}
    </LiveReferenceDateContext.Provider>
  );
}

export function useLiveReferenceDate(fallback: Date) {
  return useContext(LiveReferenceDateContext) ?? fallback;
}
