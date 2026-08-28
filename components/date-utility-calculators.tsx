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
  parseISO,
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

const localDate = (date: Date) => format(date, "yyyy-MM-dd");
const dateAtNoon = (value: string) => parseISO(`${value}T12:00:00`);
const currentYear = () => new Date().getFullYear();

export function DaysUntilCalculator({ initialTime }: { initialTime: string }) {
  const initial = useMemo(() => new Date(initialTime), [initialTime]);
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
    event.preventDefault();
    setDays(differenceInCalendarDays(dateAtNoon(target), dateAtNoon(today)));
    focusCalculatorResult();
  }
  return <CalculatorFrame result={<><ResultHeading>{Math.abs(days).toLocaleString()} days</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">That is {Math.floor(Math.abs(days) / 7)} weeks and {Math.abs(days) % 7} days {days < 0 ? "ago" : "away"}.</p></>}>
    <form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2">
      <div><FieldLabel htmlFor="until-start">Starting date</FieldLabel><input id="until-start" type="date" value={today} onChange={(e) => setToday(e.target.value)} className={inputClass} /></div>
      <div><FieldLabel htmlFor="until-target">Target date</FieldLabel><input id="until-target" type="date" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} /></div>
      <div className="sm:col-span-2"><CalculateButton label="Calculate days until" /></div>
    </form>
  </CalculatorFrame>;
}

export function DayOfWeekCalculator({ initialTime }: { initialTime: string }) {
  const [date, setDate] = useState(localDate(new Date(initialTime)));
  const [result, setResult] = useState(new Date(initialTime));
  useEffect(() => { const now = new Date(); setDate(localDate(now)); setResult(now); }, []);
  function calculate(event: FormEvent) { event.preventDefault(); setResult(dateAtNoon(date)); focusCalculatorResult(); }
  return <CalculatorFrame result={<><ResultHeading>{format(result, "EEEE")}</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">{format(result, "MMMM d, yyyy")} is day {getDayOfYear(result)} of the year and falls in ISO week {getISOWeek(result)}.</p></>}>
    <form onSubmit={calculate}><FieldLabel htmlFor="weekday-date">Choose a date</FieldLabel><input id="weekday-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /><CalculateButton label="Find day of week" /></form>
  </CalculatorFrame>;
}

export function DaysInMonthCalculator({ initialTime }: { initialTime: string }) {
  const initial = new Date(initialTime);
  const [month, setMonth] = useState(initial.getMonth() + 1);
  const [year, setYear] = useState(initial.getFullYear());
  const [result, setResult] = useState(initial);
  useEffect(() => { const now = new Date(); setMonth(now.getMonth() + 1); setYear(now.getFullYear()); setResult(now); }, []);
  function calculate(event: FormEvent) { event.preventDefault(); setResult(new Date(year, month - 1, 1, 12)); focusCalculatorResult(); }
  return <CalculatorFrame result={<><ResultHeading>{getDaysInMonth(result)} days</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">{format(result, "MMMM yyyy")} has {getDaysInMonth(result)} calendar days. {isLeapYear(result) ? `${result.getFullYear()} is a leap year.` : `${result.getFullYear()} is not a leap year.`}</p></>}>
    <form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="month-number">Month</FieldLabel><select id="month-number" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClass}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{format(new Date(2026,i,1),"MMMM")}</option>)}</select></div><div><FieldLabel htmlFor="month-year">Year</FieldLabel><input id="month-year" type="number" min="1" max="9999" value={year} onChange={(e)=>setYear(Number(e.target.value))} className={inputClass}/></div><div className="sm:col-span-2"><CalculateButton label="Count days in month" /></div></form>
  </CalculatorFrame>;
}

export function WeeksInYearCalculator({ initialTime }: { initialTime: string }) {
  const initial = new Date(initialTime);
  const [year, setYear] = useState(initial.getFullYear());
  const [resultYear, setResultYear] = useState(initial.getFullYear());
  useEffect(() => { const year = currentYear(); setYear(year); setResultYear(year); }, []);
  const date = new Date(resultYear, 6, 1, 12);
  function calculate(event: FormEvent) { event.preventDefault(); setResultYear(year); focusCalculatorResult(); }
  return <CalculatorFrame result={<><ResultHeading>{getISOWeeksInYear(date)} ISO weeks</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">{resultYear} contains {isLeapYear(date) ? 366 : 365} days, or {isLeapYear(date) ? "52 weeks and 2 days" : "52 weeks and 1 day"}.</p></>}><form onSubmit={calculate}><FieldLabel htmlFor="weeks-year">Year</FieldLabel><input id="weeks-year" type="number" min="1" max="9999" value={year} onChange={(e)=>setYear(Number(e.target.value))} className={inputClass}/><CalculateButton label="Calculate weeks in year"/></form></CalculatorFrame>;
}

export function HalfBirthdayCalculator({ initialTime }: { initialTime: string }) {
  const initial = new Date(initialTime);
  const initialBirth = new Date(initial.getFullYear() - 25, initial.getMonth(), initial.getDate(), 12);
  const [birth, setBirth] = useState(localDate(initialBirth));
  const [result, setResult] = useState(addMonths(initialBirth, 6));
  useEffect(() => { const now = new Date(); const sample = new Date(now.getFullYear()-25,now.getMonth(),now.getDate(),12); setBirth(localDate(sample)); setResult(addMonths(sample,6)); }, []);
  function calculate(event: FormEvent) { event.preventDefault(); setResult(addMonths(dateAtNoon(birth), 6)); focusCalculatorResult(); }
  return <CalculatorFrame result={<><ResultHeading>{format(result,"MMMM d, yyyy")}</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">The half birthday falls exactly six calendar months after the selected birthday.</p></>}><form onSubmit={calculate}><FieldLabel htmlFor="half-birthday-date">Birthday</FieldLabel><input id="half-birthday-date" type="date" value={birth} onChange={(e)=>setBirth(e.target.value)} className={inputClass}/><CalculateButton label="Find half birthday"/></form></CalculatorFrame>;
}

export function WeeksAndDaysAgoCalculator({ initialTime }: { initialTime: string }) {
  const initial = new Date(initialTime);
  const [weeks, setWeeks] = useState(8); const [days, setDays] = useState(2); const [result,setResult]=useState(subDays(initial,58));
  useEffect(()=>setResult(subDays(new Date(),58)),[]);
  function calculate(event: FormEvent){event.preventDefault();setResult(subDays(new Date(),Math.max(0,weeks)*7+Math.max(0,days)));focusCalculatorResult();}
  return <CalculatorFrame result={<><ResultHeading>{format(result,"EEEE, MMMM d, yyyy")}</ResultHeading><p className="mt-4 text-base leading-7 text-ink/60">Calculated from your current local date using {weeks} weeks and {days} additional days.</p></>}><form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="ago-weeks">Weeks</FieldLabel><input id="ago-weeks" type="number" min="0" value={weeks} onChange={(e)=>setWeeks(Number(e.target.value))} className={inputClass}/></div><div><FieldLabel htmlFor="ago-days">Additional days</FieldLabel><input id="ago-days" type="number" min="0" max="6" value={days} onChange={(e)=>setDays(Number(e.target.value))} className={inputClass}/></div><div className="sm:col-span-2"><CalculateButton label="Find past date"/></div></form></CalculatorFrame>;
}

export function CalendarGenerator({ initialTime }: { initialTime: string }) {
  const initial = new Date(initialTime); const [month,setMonth]=useState(initial.getMonth()+1); const [year,setYear]=useState(initial.getFullYear()); const [shown,setShown]=useState(initial);
  useEffect(()=>{const now=new Date();setMonth(now.getMonth()+1);setYear(now.getFullYear());setShown(now)},[]);
  function calculate(event:FormEvent){event.preventDefault();setShown(new Date(year,month-1,1,12));focusCalculatorResult();}
  const start=startOfWeek(startOfMonth(shown)); const dates=Array.from({length:42},(_,i)=>addDays(start,i));
  return <CalculatorFrame result={<div><ResultHeading>{format(shown,"MMMM yyyy")}</ResultHeading><div className="mt-5 grid grid-cols-7 gap-1 text-center">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><span key={day} className="py-1 text-xs font-bold text-ink/45">{day}</span>)}{dates.map(date=><span key={date.toISOString()} className={`grid h-8 place-items-center rounded text-sm ${date.getMonth()===shown.getMonth()?"font-semibold text-ink":"text-ink/30"}`}>{format(date,"d")}</span>)}</div></div>}><form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="calendar-month">Month</FieldLabel><select id="calendar-month" value={month} onChange={(e)=>setMonth(Number(e.target.value))} className={inputClass}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{format(new Date(2026,i,1),"MMMM")}</option>)}</select></div><div><FieldLabel htmlFor="calendar-year">Year</FieldLabel><input id="calendar-year" type="number" min="1" max="9999" value={year} onChange={(e)=>setYear(Number(e.target.value))} className={inputClass}/></div><div className="sm:col-span-2"><CalculateButton label="Generate calendar"/></div></form></CalculatorFrame>;
}
