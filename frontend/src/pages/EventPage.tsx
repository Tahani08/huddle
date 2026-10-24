import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  formatDay,
  getEvent,
  getResults,
  submitResponse,
  type EventData,
  type RankedSlot,
} from "../api";

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [results, setResults] = useState<RankedSlot[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load the event once
  useEffect(() => {
    if (!id) return;
    getEvent(id)
      .then(setEvent)
      .catch((e) => setError(e.message));
  }, [id]);

  // Load results now, then refresh every 5 seconds
  // (Phase 3 replaces this polling with instant WebSocket updates)
  useEffect(() => {
    if (!id) return;
    let active = true;
    const load = () =>
      getResults(id)
        .then((r) => active && setResults(r))
        .catch(() => {});
    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  function toggle(slotId: number) {
    const next = new Set(selected);
    if (next.has(slotId)) next.delete(slotId);
    else next.add(slotId);
    setSelected(next);
    setSaved(false);
  }

  async function handleSubmit() {
    if (!id) return;
    setError("");
    try {
      await submitResponse(id, name.trim(), [...selected]);
      setSaved(true);
      setResults(await getResults(id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error && !event) return <p className="error">{error}</p>;
  if (!event) return <p className="muted">Loading...</p>;

  const total = results.length
    ? results[0].free_count + results[0].busy_names.length
    : 0;
  const best = results[0] && results[0].free_count > 0 ? results[0] : null;

  return (
    <>
      <div className="card">
        <div className="row spread">
          <h2>{event.title}</h2>
          <button className="secondary" onClick={copyLink}>
            {copied ? "Copied!" : "Copy invite link"}
          </button>
        </div>

        <label>Your name</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder="Ana"
          maxLength={60}
        />

        <label>Tap the days you're free</label>
        <div className="chips">
          {event.slots.map((s) => (
            <button
              key={s.id}
              className={selected.has(s.id) ? "day on" : "day"}
              onClick={() => toggle(s.id)}
            >
              {formatDay(s.day)}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <button onClick={handleSubmit} disabled={!name.trim()}>
          {saved ? "Saved ✓" : "Submit my availability"}
        </button>
      </div>

      <div className="card">
        <h2>Results</h2>
        {total === 0 ? (
          <p className="muted">No responses yet. Share the link!</p>
        ) : (
          <>
            {best && (
              <div className="best">
                Best date: <strong>{formatDay(best.day)}</strong> ·{" "}
                {best.free_count} of {total} free
              </div>
            )}
            {results.map((r) => (
              <div key={r.slot_id} className="result">
                <div className="row spread">
                  <span>{formatDay(r.day)}</span>
                  <span className="muted">
                    {r.free_count}/{total}
                  </span>
                </div>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${(r.free_count / total) * 100}%` }}
                  />
                </div>
                <div className="muted small">
                  {r.free_names.length > 0 && <>Free: {r.free_names.join(", ")}</>}
                  {r.busy_names.length > 0 && (
                    <> · Can't: {r.busy_names.join(", ")}</>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}