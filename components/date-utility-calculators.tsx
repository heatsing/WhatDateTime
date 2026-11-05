"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  getDaysInMonth,
  getISOWeek,
  getISOWeeksInYear,
  getDayOfYear,
  isLeapYear,
  isValid,
  subYears,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import {
  CalculatorFrame,
  CalculateButton,
  FieldLabel,
  ResultHeading,
  focusCalculatorResult,
  inputClass,
} from "@/components/calculator-ui";

import { calendarDate, parseCalendarDate, snapshotCalendarDate } from "@/lib/date-input";

const localDate = (date: Date) => format(date, "yyyy-MM-dd");
const dateAtNoon = parseCalendarDate;
const currentYear = () => new Date().getFullYear();

export function DaysUntilCalculator({ initialTime }: { initialTime: string }) {
  const initial = useMemo(() => snapshotCalendarDate(initialTime), [initialTime]);
  const [today, setToday] = useState(localDate(initial));
  const [target, setTarget] = useState(localDate(addDays(initial, 30)));
  const [days, setDays] = useState(30);
  useEffect(() => {
    const now = new Date();
    setToday(localDate(now));
    setTarget(localDate(addDays(now, 30)));
    setDays(30);
  }, []);
  function calculate(event: FormEvent) {
    event.preventDefault(); if (!(event.currentTarget as HTMLFormElement).reportValidity()) return;
    if (!isValid(dateAtNoon(target)) || !isValid(dateAtNoon(today))) return;
    setDays(differenceInCalendarDays(dateAtNoon(target), dateAtNoon(today)));
    focusCalculatorResult();
  }
  return <CalculatorFrame result={<><ResultHeading>{Math.abs(days).toLocaleString()} days</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">That is {Math.floor(Math.abs(days) / 7)} weeks and {Math.abs(days) % 7} days {days < 0 ? "ago" : "away"}.</p></>}>
    <form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2">
      <div><FieldLabel htmlFor="until-start">Starting date</FieldLabel><input id="until-start" type="date" required min="0001-01-01" max="9999-12-31" value={today} onChange={(e) => setToday(e.target.value)} className={inputClass} /></div>
      <div><FieldLabel htmlFor="until-target">Target date</FieldLabel><input id="until-target" type="date" required min="0001-01-01" max="9999-12-31" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} /></div>
      <div className="sm:col-span-2"><CalculateButton label="Calculate days until" /></div>
    </form>
  </CalculatorFrame>;
}

export function DayOfWeekCalculator({ initialTime }: { initialTime: string }) {
  const [date, setDate] = useState(localDate(snapshotCalendarDate(initialTime)));
  const [result, setResult] = useState(snapshotCalendarDate(initialTime));
  useEffect(() => { const now = new Date(); setDate(localDate(now)); setResult(now); }, []);
  function calculate(event: FormEvent) { event.preventDefault(); if (!(event.currentTarget as HTMLFormElement).reportValidity()) return; if (!isValid(dateAtNoon(date))) return; setResult(dateAtNoon(date)); focusCalculatorResult(); }
  return <CalculatorFrame result={<><ResultHeading>{format(result, "EEEE")}</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">{format(result, "MMMM d, yyyy")} is day {getDayOfYear(result)} of the year and falls in ISO week {getISOWeek(result)}.</p></>}>
    <form onSubmit={calculate}><FieldLabel htmlFor="weekday-date">Choose a date</FieldLabel><input id="weekday-date" type="date" required min="0001-01-01" max="9999-12-31" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /><CalculateButton label="Find day of week" /></form>
  </CalculatorFrame>;
}

export function DaysInMonthCalculator({ initialTime }: { initialTime: string }) {
  const initial = snapshotCalendarDate(initialTime);
  const [month, setMonth] = useState(initial.getMonth() + 1);
  const [year, setYear] = useState(initial.getFullYear());
  const [result, setResult] = useState(initial);
  useEffect(() => { const now = new Date(); setMonth(now.getMonth() + 1); setYear(now.getFullYear()); setResult(now); }, []);
  function calculate(event: FormEvent) { event.preventDefault(); if (!(event.currentTarget as HTMLFormElement).reportValidity()) return; setResult(calendarDate(year, month)); focusCalculatorResult(); }
  return <CalculatorFrame result={<><ResultHeading>{getDaysInMonth(result)} days</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">{format(result, "MMMM yyyy")} has {getDaysInMonth(result)} calendar days. {isLeapYear(result) ? `${result.getFullYear()} is a leap year.` : `${result.getFullYear()} is not a leap year.`}</p></>}>
    <form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="month-number">Month</FieldLabel><select id="month-number" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClass}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{format(new Date(2026,i,1),"MMMM")}</option>)}</select></div><div><FieldLabel htmlFor="month-year">Year</FieldLabel><input id="month-year" type="number" required step="1" min="1" max="9999" value={year} onChange={(e)=>setYear(Number(e.target.value))} className={inputClass}/></div><div className="sm:col-span-2"><CalculateButton label="Count days in month" /></div></form>
  </CalculatorFrame>;
}

export function WeeksInYearCalculator({ initialTime }: { initialTime: string }) {
  const initial = snapshotCalendarDate(initialTime);
  const [year, setYear] = useState(initial.getFullYear());
  const [resultYear, setResultYear] = useState(initial.getFullYear());
  useEffect(() => { const year = currentYear(); setYear(year); setResultYear(year); }, []);
  const date = calendarDate(resultYear, 7);
  function calculate(event: FormEvent) { event.preventDefault(); if (!(event.currentTarget as HTMLFormElement).reportValidity()) return; setResultYear(year); focusCalculatorResult(); }
  return <CalculatorFrame result={<><ResultHeading>{getISOWeeksInYear(date)} ISO weeks</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">{resultYear} contains {isLeapYear(date) ? 366 : 365} days, or {isLeapYear(date) ? "52 weeks and 2 days" : "52 weeks and 1 day"}.</p></>}><form onSubmit={calculate}><FieldLabel htmlFor="weeks-year">Year</FieldLabel><input id="weeks-year" type="number" required step="1" min="1" max="9999" value={year} onChange={(e)=>setYear(Number(e.target.value))} className={inputClass}/><CalculateButton label="Calculate weeks in year"/></form></CalculatorFrame>;
}

export function HalfBirthdayCalculator({ initialTime }: { initialTime: string }) {
  const initial = snapshotCalendarDate(initialTime);
  const initialBirth = subYears(initial, 25);
  const [birth, setBirth] = useState(localDate(initialBirth));
  const [result, setResult] = useState(addMonths(initialBirth, 6));
  useEffect(() => { const now = new Date(); const sample = subYears(now,25); setBirth(localDate(sample)); setResult(addMonths(sample,6)); }, []);
  function calculate(event: FormEvent) { event.preventDefault(); if (!(event.currentTarget as HTMLFormElement).reportValidity()) return; if (!isValid(dateAtNoon(birth))) return; setResult(addMonths(dateAtNoon(birth), 6)); focusCalculatorResult(); }
  return <CalculatorFrame result={<><ResultHeading>{format(result,"MMMM d, yyyy")}</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">The half birthday falls exactly six calendar months after the selected birthday.</p></>}><form onSubmit={calculate}><FieldLabel htmlFor="half-birthday-date">Birthday</FieldLabel><input id="half-birthday-date" type="date" required min="0001-01-01" max="9999-12-31" value={birth} onChange={(e)=>setBirth(e.target.value)} className={inputClass}/><CalculateButton label="Find half birthday"/></form></CalculatorFrame>;
}

export function WeeksAndDaysAgoCalculator({ initialTime }: { initialTime: string }) {
  const initial = snapshotCalendarDate(initialTime);
  const [weeks, setWeeks] = useState(8); const [days, setDays] = useState(2); const [result,setResult]=useState(subDays(initial,58));
  useEffect(()=>setResult(subDays(new Date(),58)),[]);
  function calculate(event: FormEvent){event.preventDefault(); if (!(event.currentTarget as HTMLFormElement).reportValidity()) return;setResult(subDays(new Date(),Math.max(0,weeks)*7+Math.max(0,days)));focusCalculatorResult();}
  return <CalculatorFrame result={<><ResultHeading>{format(result,"EEEE, MMMM d, yyyy")}</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">Calculated from your current local date using {weeks} weeks and {days} additional days.</p></>}><form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="ago-weeks">Weeks</FieldLabel><input id="ago-weeks" type="number" required step="1" min="0" max="10000" value={weeks} onChange={(e)=>setWeeks(Number(e.target.value))} className={inputClass}/></div><div><FieldLabel htmlFor="ago-days">Additional days</FieldLabel><input id="ago-days" type="number" required step="1" min="0" max="6" value={days} onChange={(e)=>setDays(Number(e.target.value))} className={inputClass}/></div><div className="sm:col-span-2"><CalculateButton label="Find past date"/></div></form></CalculatorFrame>;
}

export function CalendarGenerator({ initialTime }: { initialTime: string }) {
  const initial = snapshotCalendarDate(initialTime); const [month,setMonth]=useState(initial.getMonth()+1); const [year,setYear]=useState(initial.getFullYear()); const [shown,setShown]=useState(initial);
  useEffect(()=>{const now=new Date();setMonth(now.getMonth()+1);setYear(now.getFullYear());setShown(now)},[]);
  function calculate(event:FormEvent){event.preventDefault(); if (!(event.currentTarget as HTMLFormElement).reportValidity()) return;setShown(calendarDate(year,month));focusCalculatorResult();}
  const start=startOfWeek(startOfMonth(shown)); const dates=Array.from({length:42},(_,i)=>addDays(start,i));
  return <CalculatorFrame result={<div><ResultHeading>{format(shown,"MMMM yyyy")}</ResultHeading><div className="mt-5 grid grid-cols-7 gap-1 text-center">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><span key={day} className="py-1 text-xs font-bold text-ink/45">{day}</span>)}{dates.map(date=><span key={date.toISOString()} className={`grid h-8 place-items-center rounded text-sm ${date.getMonth()===shown.getMonth()?"font-semibold text-ink":"text-ink/30"}`}>{format(date,"d")}</span>)}</div></div>}><form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="calendar-month">Month</FieldLabel><select id="calendar-month" value={month} onChange={(e)=>setMonth(Number(e.target.value))} className={inputClass}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{format(new Date(2026,i,1),"MMMM")}</option>)}</select></div><div><FieldLabel htmlFor="calendar-year">Year</FieldLabel><input id="calendar-year" type="number" required step="1" min="1" max="9999" value={year} onChange={(e)=>setYear(Number(e.target.value))} className={inputClass}/></div><div className="sm:col-span-2"><CalculateButton label="Generate calendar"/></div></form></CalculatorFrame>;
}
