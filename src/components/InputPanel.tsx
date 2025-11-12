import { FormEvent, useEffect, useMemo, useState } from "react";
import { useChartStore } from "../state/chartStore";
import { LocationSearch } from "./LocationSearch";

const fieldWrap = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.25rem"
};

const labelStyle = {
  fontSize: "0.8rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "rgba(148, 163, 184, 0.9)"
};

const TIMEZONE_OPTIONS = [
  { value: -12, label: "UTC-12:00 (Baker Island)" },
  { value: -11, label: "UTC-11:00 (Pago Pago)" },
  { value: -10, label: "UTC-10:00 (Hawái)" },
  { value: -9.5, label: "UTC-09:30 (Islas Marquesas)" },
  { value: -9, label: "UTC-09:00 (Alaska)" },
  { value: -8, label: "UTC-08:00 (Los Ángeles)" },
  { value: -7, label: "UTC-07:00 (Denver)" },
  { value: -6, label: "UTC-06:00 (Ciudad de México)" },
  { value: -5, label: "UTC-05:00 (Nueva York / Lima)" },
  { value: -4, label: "UTC-04:00 (Caracas)" },
  { value: -3.5, label: "UTC-03:30 (Terranova)" },
  { value: -3, label: "UTC-03:00 (Buenos Aires / São Paulo)" },
  { value: -2, label: "UTC-02:00 (Atlántico Sur)" },
  { value: -1, label: "UTC-01:00 (Azores)" },
  { value: 0, label: "UTC±00:00 (Londres)" },
  { value: 1, label: "UTC+01:00 (Madrid)" },
  { value: 2, label: "UTC+02:00 (Atenas)" },
  { value: 3, label: "UTC+03:00 (Estambul)" },
  { value: 3.5, label: "UTC+03:30 (Teherán)" },
  { value: 4, label: "UTC+04:00 (Dubái)" },
  { value: 4.5, label: "UTC+04:30 (Kabul)" },
  { value: 5, label: "UTC+05:00 (Islamabad)" },
  { value: 5.5, label: "UTC+05:30 (Nueva Delhi)" },
  { value: 5.75, label: "UTC+05:45 (Katmandú)" },
  { value: 6, label: "UTC+06:00 (Dhaka)" },
  { value: 6.5, label: "UTC+06:30 (Naypyidó)" },
  { value: 7, label: "UTC+07:00 (Bangkok)" },
  { value: 8, label: "UTC+08:00 (Beijing)" },
  { value: 8.75, label: "UTC+08:45 (Australia Central-Oeste)" },
  { value: 9, label: "UTC+09:00 (Tokio)" },
  { value: 9.5, label: "UTC+09:30 (Adelaida)" },
  { value: 10, label: "UTC+10:00 (Sídney)" },
  { value: 10.5, label: "UTC+10:30 (Isla Lord Howe)" },
  { value: 11, label: "UTC+11:00 (Islas Salomón)" },
  { value: 12, label: "UTC+12:00 (Auckland)" },
  { value: 12.75, label: "UTC+12:45 (Islas Chatham)" },
  { value: 13, label: "UTC+13:00 (Tonga)" },
  { value: 14, label: "UTC+14:00 (Kiritimati)" }
];

const formatDateDisplay = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return "";
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const parseDisplayDate = (value: string): string | null => {
  const parts = value.split("/").map((part) => part.trim());
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year) return null;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
  if (y < 100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const iso = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d
    .toString()
    .padStart(2, "0")}`;
  const dateObj = new Date(iso);
  if (Number.isNaN(dateObj.getTime())) return null;
  return iso;
};

const formatTimezoneLabel = (hours: number) => {
  if (!Number.isFinite(hours)) return "UTC±00:00";
  const sign = hours >= 0 ? "+" : "-";
  const abs = Math.abs(hours);
  const hourPart = Math.floor(abs);
  const minutePart = Math.round((abs - hourPart) * 60);
  return `UTC${sign}${hourPart.toString().padStart(2, "0")}:${minutePart.toString().padStart(2, "0")}`;
};

export const InputPanel = () => {
  const input = useChartStore((state) => state.input);
  const setInput = useChartStore((state) => state.setInput);
  const computeChart = useChartStore((state) => state.computeChart);
  const loading = useChartStore((state) => state.loading);
  const profiles = useChartStore((state) => state.profiles);
  const activeProfileId = useChartStore((state) => state.activeProfileId);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId),
    [profiles, activeProfileId]
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!activeProfile) return false;
    return JSON.stringify(activeProfile.input) !== JSON.stringify(input);
  }, [activeProfile, input]);

  const isLocked = Boolean(activeProfileId);
  const timezoneHours = (input.timezoneOffset ?? 0) / 60;
  const [birthDateDisplay, setBirthDateDisplay] = useState(() => formatDateDisplay(input.date));

  useEffect(() => {
    setBirthDateDisplay(formatDateDisplay(input.date));
  }, [input.date]);

  const normalizedTimezone = Number.isFinite(timezoneHours) ? Number(timezoneHours.toFixed(2)) : 0;
  const timezoneMatch = TIMEZONE_OPTIONS.find((option) => option.value === normalizedTimezone);
  const timezoneSelectValue = timezoneMatch ? timezoneMatch.value.toString() : "__custom";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isLocked) {
      computeChart();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <h2>Datos natales</h2>
      {hasUnsavedChanges && (
        <div style={{ fontSize: "0.8rem", color: "#facc15" }}>
          Cambios sin guardar para el perfil activo.
        </div>
      )}

      {isLocked ? (
        <div style={fieldWrap}>
          <label style={labelStyle}>Lugar de nacimiento</label>
          <div className="read-only-field">{input.locationLabel || "Sin ubicación seleccionada"}</div>
        </div>
      ) : (
        <LocationSearch />
      )}

      <div style={fieldWrap}>
        <label style={labelStyle}>Fecha de nacimiento (dd/mm/aaaa)</label>
        {isLocked ? (
          <div className="read-only-field">{birthDateDisplay}</div>
        ) : (
          <input
            type="text"
            inputMode="numeric"
            placeholder="25/10/1993"
            value={birthDateDisplay}
            onChange={(e) => {
              const value = e.target.value;
              setBirthDateDisplay(value);
              const iso = parseDisplayDate(value);
              if (iso) {
                setInput({ date: iso });
              }
            }}
          />
        )}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Hora de nacimiento</label>
        {isLocked ? (
          <div className="read-only-field">{input.time}</div>
        ) : (
          <input type="time" value={input.time} onChange={(e) => setInput({ time: e.target.value })} />
        )}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Huso horario (UTC)</label>
        {isLocked ? (
          <div className="read-only-field">{formatTimezoneLabel(normalizedTimezone)}</div>
        ) : (
          <select
            value={timezoneSelectValue}
            onChange={(e) => {
              if (e.target.value === "__custom") return;
              const hours = Number(e.target.value);
              if (!Number.isNaN(hours)) {
                setInput({ timezoneOffset: Math.round(hours * 60) });
              }
            }}
          >
            {!timezoneMatch && <option value="__custom">{formatTimezoneLabel(normalizedTimezone)}</option>}
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        {input.timezoneId && (
          <small style={{ color: "#94a3b8" }}>Zona detectada: {input.timezoneId}</small>
        )}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Sistema de casas</label>
        <select
          value={input.houseSystem}
          onChange={(e) => setInput({ houseSystem: e.target.value as any })}
          disabled={isLocked}
        >
          <option value="placidus">Placidus (igualado)</option>
          <option value="whole-sign">Whole Sign</option>
          <option value="equal">Equal</option>
          <option value="koch">Koch (igualado)</option>
        </select>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Zodíaco</label>
        <select
          value={input.zodiacType}
          onChange={(e) => setInput({ zodiacType: e.target.value as any })}
          disabled={isLocked}
        >
          <option value="tropical">Tropical</option>
          <option value="sidereal">Sideral (placeholder)</option>
        </select>
      </div>

      {isLocked && (
        <small style={{ color: "#94a3b8" }}>
          Para editar estos datos, cierra la carta activa desde la pestaña del mandala.
        </small>
      )}

      <button type="submit" disabled={loading || isLocked} style={{ marginTop: "0.5rem" }}>
        {loading ? "Calculando..." : isLocked ? "Bloqueado por perfil" : "Generar carta"}
      </button>
    </form>
  );
};
