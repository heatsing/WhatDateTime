"use client";
import { useEffect, useState, type FormEvent } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { localISO, resolveWallTime } from "@/lib/timezoneFacts";
import { countdownHash, parseCountdownHash, validCountdown, countdownStorageKey, type CountdownTarget } from "@/lib/countdown-state";
import { toolEvent } from "@/lib/tool-events";
import { CalculatorFrame, CalculateButton, FieldLabel, inputClass, ResultHeading } from "./calculator-ui";

export function CountdownCalculator({initialTime}: {initialTime:string}) {
  const sample: CountdownTarget = {name:"",instant:new Date(Date.parse(initialTime)+7*86400000).toISOString(),zone:"UTC"};
  const [target,setTarget] = useState(sample);
  const [name,setName] = useState("");
  const [zone,setZone] = useState("UTC");
  const [input,setInput] = useState(localISO(new Date(sample.instant),"UTC"));
  const [now,setNow] = useState(Date.parse(initialTime));
  const [live,setLive] = useState(false);
  const [message,setMessage] = useState("");
  const apply = (next:CountdownTarget) => {setTarget(next);setName(next.name);setZone(next.zone);setInput(localISO(new Date(next.instant),next.zone));};
  useEffect(()=>{
    let saved:CountdownTarget|null=null;
    try {saved=validCountdown(JSON.parse(localStorage.getItem(countdownStorageKey)||"null"));} catch { /* Storage may be disabled. */ }
    const shared=parseCountdownHash(location.hash);
    const localZone=Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    apply(shared || saved || {name:"",instant:new Date(Date.now()+7*86400000).toISOString(),zone:localZone});
    setLive(true);setNow(Date.now());
    if (location.hash && !shared) setMessage("Invalid shared target; using a saved or new countdown.");
    const loadShare = () => {
      const incoming = parseCountdownHash(location.hash);
      if (incoming) { apply(incoming); setMessage("Shared target restored."); }
      else if (location.hash) setMessage("Invalid share link; the current target has not changed.");
    };
    window.addEventListener("hashchange", loadShare);
    const timer=setInterval(()=>setNow(Date.now()),1000);
    return ()=>{clearInterval(timer);window.removeEventListener("hashchange",loadShare);};
  },[]);
  function submit(event:FormEvent) {
    event.preventDefault();
    let instants:Date[];
    try {instants=resolveWallTime(input,zone);} catch {setMessage("Enter a valid IANA time zone, for example Europe/London.");return;}
    if(instants.length!==1){setMessage(instants.length===2 ? "This wall-clock time occurs twice. Choose an unambiguous target time." : "This time is invalid or skipped by a clock change.");return;}
    const next=validCountdown({name,instant:instants[0].toISOString(),zone});
    if(!next){setMessage("Check the target date and event name.");return;}
    setTarget(next);setMessage("Countdown started.");toolEvent("calculate","countdown");
  }
  const remaining=Math.max(0,Math.floor((Date.parse(target.instant)-now)/1000));
  const values=[Math.floor(remaining/86400),Math.floor(remaining/3600)%24,Math.floor(remaining/60)%60,remaining%60];
  return <CalculatorFrame result={<>
    <ResultHeading>{!live ? "Example countdown (UTC)" : remaining ? target.name || "Counting down" : "Time’s up!"}</ResultHeading>
    <div className="mt-6 grid grid-cols-4 gap-2">{values.map((v,i)=><div key={i} className="rounded-md border border-[#D9DEE5] bg-white p-3"><p className="font-display text-2xl font-bold">{v}</p><p className="text-xs text-ink/50">{["Days","Hrs","Min","Sec"][i]}</p></div>)}</div>
    <p className="mt-5 text-xs text-ink/50">Target: {formatInTimeZone(new Date(target.instant),target.zone,"MMM d, yyyy 'at' h:mm a")} ({target.zone}) · {target.instant}</p>
    {!live && <p>Example only: starting at {initialTime}. Enable JavaScript for a live countdown.</p>}
  </>}>
    <form onSubmit={submit}>
      <FieldLabel htmlFor="countdown-name">Event name</FieldLabel><input id="countdown-name" maxLength={100} value={name} onChange={e=>setName(e.target.value)} className={inputClass}/>
      <FieldLabel htmlFor="countdown-target">Countdown to</FieldLabel><input id="countdown-target" type="datetime-local" required value={input} onChange={e=>setInput(e.target.value)} className={inputClass}/>
      <FieldLabel htmlFor="countdown-zone">Target time zone (IANA)</FieldLabel><input id="countdown-zone" required value={zone} onChange={e=>setZone(e.target.value)} className={inputClass}/>
      <CalculateButton label="Start countdown"/>
    </form>
    <div className="mt-3 flex flex-wrap gap-4 [&>button]:min-h-11 [&>button]:text-[#0969da] [&>button]:underline">
      <button type="button" onClick={()=>{try{localStorage.setItem(countdownStorageKey,JSON.stringify(target));setMessage("Started target saved on this device.");toolEvent("save","countdown");}catch{setMessage("Storage is unavailable in this browser.");}}}>Save target</button>
      <button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(location.origin+"/calculators/countdown"+countdownHash(target));setMessage("Share link copied. It preserves this exact instant.");toolEvent("share","countdown");}catch{setMessage("Clipboard unavailable. Please allow clipboard access.");}}}>Copy share link</button>
      <button type="button" onClick={()=>{try{const saved=validCountdown(JSON.parse(localStorage.getItem(countdownStorageKey)||"null"));if(saved){apply(saved);setMessage("Saved target restored.");}else setMessage("No saved target.");}catch{setMessage("Saved target unavailable.");}}}>Restore saved</button>
      <button type="button" onClick={()=>{try{localStorage.removeItem(countdownStorageKey);}catch{} history.replaceState(null,"",location.pathname);apply({name:"",zone:Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC",instant:new Date(Date.now()+7*86400000).toISOString()});setMessage("Saved target cleared; new seven-day countdown.");}}>Clear and reset</button>
    </div>
    <p role="status" className="mt-3 text-sm text-[#536b8d]">{message}</p>
  </CalculatorFrame>;
}
