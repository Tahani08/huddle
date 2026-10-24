export type Slot = { id: number; day: string };
export type EventData = { id: string; title: string; slots: Slot[] };
export type RankedSlot = {
  slot_id: number;
  day: string;
  free_count: number;
  free_names: string[];
  busy_names: string[];
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      typeof body?.detail === "string" ? body.detail : "Something went wrong"
    );
  }
  return res.json();
}

export const createEvent = (title: string, dates: string[]) =>
  request<EventData>("/events", {
    method: "POST",
    body: JSON.stringify({ title, dates }),
  });

export const getEvent = (id: string) => request<EventData>(`/events/${id}`);

export const getResults = (id: string) =>
  request<RankedSlot[]>(`/events/${id}/results`);

export const submitResponse = (
  id: string,
  name: string,
  freeSlotIds: number[]
) =>
  request<{ ok: boolean }>(`/events/${id}/responses`, {
    method: "POST",
    body: JSON.stringify({ name, free_slot_ids: freeSlotIds }),
  });

// "2027-03-13" -> "Sat, Mar 13"
export function formatDay(day: string): string {
  return new Date(day + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}