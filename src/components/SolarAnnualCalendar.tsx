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

const PERIOD_COLORS: Record<AnnualPeriodCategory, { label: string; color: string; text: string }> = {
  "economy-positive": { label: "Economia favorable", color: "#a7f3d0", text: "#0f172a" },
  "economy-negative": { label: "Economia desfavorable", color: "#064e3b", text: "#e2e8f0" },
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
      return { label, items };
    });
  }, [periods, year]);

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

      <div className="annual-calendar__grid">
        {monthBuckets.map((month) => (
          <div key={month.label} className="annual-calendar__month">
            <div className="annual-calendar__month-header">{month.label}</div>
            <div className="annual-calendar__periods">
              {month.items.length === 0 && <span className="annual-calendar__placeholder">Sin periodos</span>}
              {month.items.map((period) => {
                const info = PERIOD_COLORS[period.colorKey];
                return (
                  <div
                    key={period.id}
                    className="annual-calendar__period"
                    style={{ background: info.color, color: info.text, position: "relative" }}
                    title={info.label}
                  >
                    <div className="annual-calendar__period-title">
                      {info.label}
                      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                        <button
                          type="button"
                          className="annual-calendar__edit"
                          onClick={() => handleEdit(period)}
                          aria-label="Editar periodo"
                        >
                          ✎
                        </button>
                        <button type="button" onClick={() => onRemovePeriod(year, period.id)} aria-label="Eliminar periodo">
                          ×
                        </button>
                      </div>
                    </div>
                    <div>{period.start} → {period.end}</div>
                    {period.note && <div style={{ fontSize: "0.85rem" }}>{period.note}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
