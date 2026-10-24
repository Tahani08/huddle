import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent, formatDay } from "../api";

export default function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [picker, setPicker] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addDate() {
    if (!picker || dates.includes(picker)) return;
    setDates([...dates, picker].sort());
    setPicker("");
  }

  async function handleCreate() {
    setError("");
    setLoading(true);
    try {
      const event = await createEvent(title.trim(), dates);
      navigate(`/e/${event.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Plan something with friends</h2>
      <p className="muted">
        Pick the possible dates, share the link, and Huddle finds the best one.
      </p>

      <label>What's the plan?</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Spring break trip"
        maxLength={120}
      />

      <label>Possible dates</label>
      <div className="row">
        <input
          type="date"
          value={picker}
          onChange={(e) => setPicker(e.target.value)}
        />
        <button className="secondary" onClick={addDate}>
          Add
        </button>
      </div>

      <div className="chips">
        {dates.map((d) => (
          <span key={d} className="chip">
            {formatDay(d)}
            <button
              className="chip-x"
              onClick={() => setDates(dates.filter((x) => x !== d))}
              aria-label={`Remove ${d}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleCreate}
        disabled={loading || !title.trim() || dates.length === 0}
      >
        {loading ? "Creating..." : "Create event"}
      </button>
    </div>
  );
}