"use client";
import { useEffect, useState, type FormEvent } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { localISO, resolveWallTime } from "@/lib/timezoneFacts";
import {
  countdownHash,
  countdownSeconds,
  parseCountdownHash,
  validCountdown,
  countdownStorageKey,
  type CountdownTarget,
} from "@/lib/countdown-state";
import { toolEvent } from "@/lib/tool-events";
import {
  CalculatorFrame,
  CalculateButton,
  FieldLabel,
  inputClass,
  ResultHeading,
} from "./calculator-ui";

export function CountdownCalculator({ initialTime }: { initialTime: string }) {
  const sample: CountdownTarget = {
    name: "",
    instant: new Date(Date.parse(initialTime) + 7 * 86400000).toISOString(),
    zone: "UTC",
  };
  const [target, setTarget] = useState(sample);
  const [name, setName] = useState("");
  const [zone, setZone] = useState("UTC");
  const [input, setInput] = useState(localISO(new Date(sample.instant), "UTC"));
  const [now, setNow] = useState(Date.parse(initialTime));
  const [live, setLive] = useState(false);
  const [message, setMessage] = useState("");
  const [inputEdited, setInputEdited] = useState(false);
  const apply = (next: CountdownTarget) => {
    setTarget(next);
    setName(next.name);
    setZone(next.zone);
    setInput(localISO(new Date(next.instant), next.zone));
    setInputEdited(false);
  };
  useEffect(() => {
    let saved: CountdownTarget | null = null;
    try {
      saved = validCountdown(
        JSON.parse(localStorage.getItem(countdownStorageKey) || "null"),
      );
    } catch {
      /* Storage may be disabled. */
    }
    const shared = parseCountdownHash(location.hash);
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    apply(
      shared ||
        saved || {
          name: "",
          instant: new Date(Date.now() + 7 * 86400000).toISOString(),
          zone: localZone,
        },
    );
    setLive(true);
    setNow(Date.now());
    if (location.hash && !shared)
      setMessage("Invalid shared target; using a saved or new countdown.");
    const loadShare = () => {
      const incoming = parseCountdownHash(location.hash);
      if (incoming) {
        apply(incoming);
        setMessage("Shared target restored.");
      } else if (location.hash)
        setMessage("Invalid share link; the current target has not changed.");
    };
    window.addEventListener("hashchange", loadShare);
    const refresh = () => setNow(Date.now());
    const timer = setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("hashchange", loadShare);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  function changeDisplayZone() {
    if (zone === target.zone) return;
    if (!validCountdown({ ...target, zone })) {
      setMessage("Enter a valid IANA time zone, for example Europe/London.");
      return;
    }
    const draft = inputEdited
      ? resolveWallTime(input, target.zone)
      : [new Date(target.instant)];
    if (draft.length !== 1) {
      setMessage("Correct the target time before changing its display zone.");
      return;
    }
    setInput(localISO(draft[0], zone));
    setTarget({ ...target, zone });
    setMessage(
      "Display zone changed. The started target instant is unchanged.",
    );
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (zone !== target.zone) {
      setMessage("Apply a valid display zone before starting the countdown.");
      return;
    }
    let instants: Date[];
    try {
      instants = inputEdited
        ? resolveWallTime(input, zone)
        : [new Date(target.instant)];
    } catch {
      setMessage("Enter a valid IANA time zone, for example Europe/London.");
      return;
    }
    if (instants.length !== 1) {
      setMessage(
        instants.length === 2
          ? "This wall-clock time occurs twice. Choose an unambiguous target time."
          : "This time is invalid or skipped by a clock change.",
      );
      return;
    }
    const next = validCountdown({
      name,
      instant: instants[0].toISOString(),
      zone,
    });
    if (!next) {
      setMessage("Check the target date and event name.");
      return;
    }
    apply(next);
    setNow(Date.now());
    setMessage("Countdown started.");
    toolEvent("calculate", "countdown");
  }
  const remaining = countdownSeconds(target.instant, now);
  const values = [
    Math.floor(remaining / 86400),
    Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60,
    remaining % 60,
  ];
  const pending = inputEdited || name !== target.name;
  return (
    <CalculatorFrame
      liveResult={false}
      result={
        <>
          <ResultHeading>
            {!live
              ? "Example countdown (UTC)"
              : remaining
                ? target.name || "Counting down"
                : "Time’s up!"}
          </ResultHeading>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {values.map((v, i) => (
              <div
                key={i}
                className="min-w-0 rounded-md border border-[#D9DEE5] bg-white p-3"
              >
                <p className="break-words font-display text-2xl font-bold tabular-nums">
                  {v}
                </p>
                <p className="text-xs text-ink/50">
                  {["Days", "Hrs", "Min", "Sec"][i]}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 break-words text-sm text-ink/50">
            Started target:{" "}
            {formatInTimeZone(
              new Date(target.instant),
              target.zone,
              "MMM d, yyyy 'at' h:mm:ss a",
            )}{" "}
            ({target.zone}) · {target.instant}
          </p>
          {pending && (
            <p className="mt-3 text-sm">
              Changes not started. The countdown, Save, and Share still use the
              target shown above. Choose Start countdown to apply your edits.
            </p>
          )}
          {!live && (
            <p>
              Example only: starting at {initialTime}. Enable JavaScript for a
              live countdown.
            </p>
          )}
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FieldLabel htmlFor="countdown-name">Event name</FieldLabel>
        <input
          id="countdown-name"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <FieldLabel htmlFor="countdown-target">
          Countdown to ({target.zone})
        </FieldLabel>
        <input
          id="countdown-target"
          type="datetime-local"
          required
          min="0001-01-01T00:00"
          max="9999-12-31T23:59"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setInputEdited(true);
          }}
          className={inputClass}
        />
        <FieldLabel htmlFor="countdown-zone">
          Display time zone (IANA)
        </FieldLabel>
        <input
          id="countdown-zone"
          required
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          onBlur={changeDisplayZone}
          className={inputClass}
        />
        <button
          type="button"
          onClick={changeDisplayZone}
          className="min-h-11 text-[#0969da] underline"
        >
          Apply display zone
        </button>
        <p className="text-sm text-[#536b8d]">
          Changing the display zone preserves the target instant. Edit the date
          and time to choose a new target.
        </p>
        <CalculateButton label="Start countdown" />
      </form>
      <div className="mt-3 flex flex-wrap gap-4 [&>button]:min-h-11 [&>button]:text-[#0969da] [&>button]:underline">
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(countdownStorageKey, JSON.stringify(target));
              setMessage("Started target saved on this device.");
              toolEvent("save", "countdown");
            } catch {
              setMessage("Storage is unavailable in this browser.");
            }
          }}
        >
          Save target
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                location.origin +
                  "/calculators/countdown" +
                  countdownHash(target),
              );
              setMessage("Share link copied. It preserves this exact instant.");
              toolEvent("share", "countdown");
            } catch {
              setMessage(
                "Clipboard unavailable. Please allow clipboard access.",
              );
            }
          }}
        >
          Copy share link
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              const saved = validCountdown(
                JSON.parse(localStorage.getItem(countdownStorageKey) || "null"),
              );
              if (saved) {
                apply(saved);
                setMessage("Saved target restored.");
              } else setMessage("No saved target.");
            } catch {
              setMessage("Saved target unavailable.");
            }
          }}
        >
          Restore saved
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem(countdownStorageKey);
            } catch {}
            history.replaceState(null, "", location.pathname);
            apply({
              name: "",
              zone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
              instant: new Date(Date.now() + 7 * 86400000).toISOString(),
            });
            setMessage("Saved target cleared; new seven-day countdown.");
          }}
        >
          Clear and reset
        </button>
      </div>
      <p role="status" className="mt-3 text-sm text-[#536b8d]">
        {message}
      </p>
    </CalculatorFrame>
  );
}
