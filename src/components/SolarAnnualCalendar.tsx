import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import type { AnnualPeriod, AnnualPeriodCategory } from "../types/astro";

const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

const WEEK_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const PERIOD_COLORS: Record<AnnualPeriodCategory, { label: string; color: string; text: string }> = {
  "economy-positive": { label: "Economía favorable", color: "#a7f3d0", text: "#0f172a" },
  "economy-negative": { label: "Economía desfavorable", color: "#064e3b", text: "#e2e8f0" },
  "love-positive": { label: "Amor favorable", color: "#f9a8d4", text: "#1e293b" },
  "love-negative": { label: "Amor desfavorable", color: "#7f1d1d", text: "#f8fafc" },
  "work-positive": { label: "Trabajo favorable", color: "#facc15", text: "#1e293b" },
  "work-negative": { label: "Trabajo desfavorable", color: "#92400e", text: "#f8fafc" },
  "health-positive": { label: "Salud favorable", color: "#bae6fd", text: "#0f172a" },
  "health-negative": { label: "Salud desfavorable", color: "#1e3a8a", text: "#e2e8f0" },
  "aspect-strong": { label: "Aspecto fuerte", color: "#06b6d4", text: "#0f172a" },
  "spiritual-positive": { label: "Espiritualidad favorable", color: "#ffffff", text: "#0f172a" },
  "spiritual-negative": { label: "Espiritualidad desfavorable", color: "#000000", text: "#f8fafc" }
};

interface SolarAnnualCalendarProps {
  year: number;
  periods: AnnualPeriod[];
  onAddPeriod: (period: Omit<AnnualPeriod, "id">) => void;
  onUpdatePeriod: (period: AnnualPeriod) => void;
  onRemovePeriod: (year: number, id: string) => void;
}

const overlaps = (start: DateTime, end: DateTime, rangeStart: DateTime, rangeEnd: DateTime) =>
  start <= rangeEnd && end >= rangeStart;

export const SolarAnnualCalendar = ({
  year,
  periods,
  onAddPeriod,
  onUpdatePeriod,
  onRemovePeriod
}: SolarAnnualCalendarProps) => {
  const [start, setStart] = useState(`${year}-01-01`);
  const [end, setEnd] = useState(`${year}-01-07`);
  const [colorKey, setColorKey] = useState<AnnualPeriodCategory>("economy-positive");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setStart(`${year}-01-01`);
    setEnd(`${year}-01-07`);
    setColorKey("economy-positive");
    setNote("");
    setEditingId(null);
  }, [year]);

  const monthBuckets = useMemo(() => {
    return MONTH_LABELS.map((label, index) => {
      const monthStart = DateTime.fromObject({ year, month: index + 1, day: 1 });
      const monthEnd = monthStart.endOf("month");
      const items = periods.filter((period) => {
        const periodStart = DateTime.fromISO(period.start);
        const periodEnd = DateTime.fromISO(period.end);
        if (!periodStart.isValid || !periodEnd.isValid) return false;
        return overlaps(periodStart, periodEnd, monthStart, monthEnd);
      });
      return { label, monthStart, monthEnd, items };
    });
  }, [periods, year]);

  const [activeMonth, setActiveMonth] = useState<number>(DateTime.now().month - 1);

  const normalizeToYear = (value: string) => {
    const parsed = DateTime.fromISO(value);
    if (!parsed.isValid) return DateTime.fromObject({ year, month: 1, day: 1 });
    return parsed.set({ year });
  };

  const handleSubmit = () => {
    const startDate = normalizeToYear(start);
    const endDate = normalizeToYear(end);
    if (!startDate.isValid || !endDate.isValid) return;
    if (endDate < startDate) return;
    const startIso = startDate.toISODate() ?? `${year}-01-01`;
    const endIso = endDate.toISODate() ?? `${year}-01-01`;
    const payload = { year, start: startIso, end: endIso, colorKey, note: note.trim() || undefined };

    if (editingId) {
      onUpdatePeriod({ ...payload, id: editingId });
    } else {
      onAddPeriod(payload);
    }

    setStart(startIso);
    setEnd(endIso);
    setNote("");
    setColorKey("economy-positive");
    setEditingId(null);
  };

  const handleEdit = (period: AnnualPeriod) => {
    setEditingId(period.id);
    setStart(period.start);
    setEnd(period.end);
    setColorKey(period.colorKey);
    setNote(period.note ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNote("");
    setColorKey("economy-positive");
  };

  const submitLabel = editingId ? "Actualizar periodo" : "Agregar periodo";

  const renderMonthCalendar = (month: typeof monthBuckets[number]) => {
    const monthStart = month.monthStart.startOf("week"); // lunes
    const monthEnd = month.monthEnd.endOf("week");
    const days: DateTime[] = [];
    let cursor = monthStart;
    while (cursor <= monthEnd) {
      days.push(cursor);
      cursor = cursor.plus({ days: 1 });
    }

    return (
      <div className="annual-calendar__month">
        <div className="annual-calendar__month-header">{month.label}</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: "4px",
            fontSize: "0.8rem",
            color: "#cbd5e1"
          }}
        >
          {WEEK_LABELS.map((d) => (
            <div key={d} style={{ textAlign: "center", opacity: 0.7 }}>
              {d}
            </div>
          ))}
          {days.map((day) => {
            const inMonth = day.month === month.monthStart.month;
            const dayPeriods = month.items.filter((p) => {
              const ps = DateTime.fromISO(p.start);
              const pe = DateTime.fromISO(p.end);
              return ps.isValid && pe.isValid && overlaps(ps, pe, day.startOf("day"), day.endOf("day"));
            });
            return (
              <div
                key={day.toISODate()}
                style={{
                  minHeight: "78px",
                  borderRadius: "6px",
                  border: "1px solid rgba(148,163,184,0.2)",
                  background: inMonth ? "rgba(15,23,42,0.6)" : "rgba(15,23,42,0.3)",
                  padding: "4px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >
                <div style={{ fontWeight: 700, color: "#e2e8f0", opacity: inMonth ? 1 : 0.4 }}>{day.day}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
                  {dayPeriods.map((p) => {
                    const info = PERIOD_COLORS[p.colorKey];
                    return (
                      <span
                        key={p.id}
                        title={`${info.label}${p.note ? ` · ${p.note}` : ""}`}
                        style={{
                          background: info.color,
                          color: info.text,
                          borderRadius: "4px",
                          padding: "2px 4px",
                          fontSize: "0.7rem",
                          lineHeight: 1
                        }}
                      >
                        {info.label}
                      </span>
                    );
                  })}
                  {dayPeriods.length === 0 && <span style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.7)" }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="panel" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: 0 }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem" }}>Inicio</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem" }}>Fin</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem" }}>Categoría</label>
          <select value={colorKey} onChange={(e) => setColorKey(e.target.value as AnnualPeriodCategory)}>
            {Object.entries(PERIOD_COLORS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <label style={{ display: "block", fontSize: "0.85rem" }}>Nota (opcional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: cierre de proyecto" />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.35rem" }}>
          <button type="button" onClick={handleSubmit}>{submitLabel}</button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={{ background: "transparent", border: "1px solid rgba(148,163,184,0.5)" }}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="annual-calendar__legend">
        {Object.entries(PERIOD_COLORS).map(([key, value]) => (
          <span key={key} className="annual-calendar__legend-item">
            <span className="annual-calendar__swatch" style={{ background: value.color }} />
            {value.label}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button type="button" onClick={() => setActiveMonth((m) => Math.max(0, m - 1))} disabled={activeMonth === 0}>
          ◀
        </button>
        <select value={activeMonth} onChange={(e) => setActiveMonth(Number(e.target.value))}>
          {monthBuckets.map((m, idx) => (
            <option key={m.label} value={idx}>
              {m.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setActiveMonth((m) => Math.min(11, m + 1))} disabled={activeMonth === 11}>
          ▶
        </button>
        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Muestra un mes completo para ver todos los días y periodos.</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{renderMonthCalendar(monthBuckets[activeMonth])}</div>
    </div>
  );
};
