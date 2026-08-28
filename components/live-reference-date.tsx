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
    const updateWhenVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    update();
    const timer = window.setInterval(update, 60_000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", updateWhenVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", updateWhenVisible);
    };
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
