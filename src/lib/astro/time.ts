import * as Astronomy from "astronomy-engine";

export interface TimePayload {
  local: Date;
  utc: Date;
  timezoneOffset: number;
  julianDay: number;
}

export function buildTime(
  date: string,
  time: string,
  timezoneOffsetMinutes: number
): TimePayload {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    throw new Error("Fecha u hora inválida para el cálculo.");
  }

  // Construimos la fecha en UTC a partir de componentes para evitar problemas de parsing
  const baseUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const utcMillis = baseUtc - timezoneOffsetMinutes * 60 * 1000;
  const utc = new Date(utcMillis);
  const local = new Date(utcMillis + timezoneOffsetMinutes * 60 * 1000);

  const astroTime = new Astronomy.AstroTime(utc);
  const julianDay = astroTime.ut + 2451545.0;

  return {
    local,
    utc,
    timezoneOffset: timezoneOffsetMinutes,
    julianDay
  };
}
