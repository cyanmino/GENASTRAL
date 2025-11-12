import { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { useChartStore } from "../state/chartStore";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export const LocationSearch = () => {
  const input = useChartStore((state) => state.input);
  const setInput = useChartStore((state) => state.setInput);
  const [query, setQuery] = useState(input.locationLabel);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setQuery(input.locationLabel);
  }, [input.locationLabel]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(undefined);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const handler = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          {
            headers: {
              "Accept-Language": "es",
              "User-Agent": "GENASTRAL/1.0 (contact: info@example.com)"
            },
            signal: controller.signal
          }
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener sugerencias");
        }
        const data: Suggestion[] = await response.json();
        setResults(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("No se pudieron cargar sugerencias");
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (suggestion: Suggestion) => {
    const latitude = parseFloat(suggestion.lat);
    const longitude = parseFloat(suggestion.lon);
    const timezoneId = tzlookup(latitude, longitude);
    const dt = DateTime.fromISO(`${input.date}T${input.time}`, { zone: timezoneId });
    const offset = dt.isValid ? dt.offset : DateTime.now().setZone(timezoneId).offset;
    setInput({
      latitude,
      longitude,
      locationLabel: suggestion.display_name,
      timezoneId,
      timezoneOffset: offset
    });
    setQuery(suggestion.display_name);
    setResults([]);
    setIsFocused(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <label
        style={{
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "rgba(148,163,184,0.9)"
        }}
      >
        Buscar ubicación
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ej. Calle, ciudad o país"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 120)}
      />
      {loading && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Buscando...</div>}
      {error && <div style={{ fontSize: "0.75rem", color: "#f87171" }}>{error}</div>}

      {results.length > 0 && isFocused && (
        <ul
          style={{
            position: "absolute",
            zIndex: 10,
            background: "#0f172a",
            border: "1px solid rgba(148,163,184,0.4)",
            borderRadius: "8px",
            marginTop: "0.25rem",
            padding: "0.25rem 0",
            maxHeight: "220px",
            overflowY: "auto",
            width: "100%"
          }}
        >
          {results.map((suggestion) => (
            <li
              key={`${suggestion.lat}-${suggestion.lon}`}
              style={{
                listStyle: "none",
                padding: "0.35rem 0.75rem",
                cursor: "pointer"
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(suggestion);
              }}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
