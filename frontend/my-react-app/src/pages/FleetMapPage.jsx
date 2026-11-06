import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../styles/fleetMap.css";

const refreshInterval = 30_000;
const defaultCenter = [49.0, 31.0];
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let googleMapsPromise;

function toDateTimeInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function createRelativeTimeRange(hours) {
  const to = new Date();
  return {
    from: toDateTimeInput(new Date(to.getTime() - hours * 60 * 60 * 1000)),
    to: toDateTimeInput(to),
  };
}

function formatTime(value) {
  if (!value) return "Немає даних";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Немає даних"
    : new Intl.DateTimeFormat("uk-UA", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatClock(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--:--"
    : new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function normalizeTelemetryPoint(point) {
  if (!point || typeof point !== "object") return point;
  const lat = numericValue(point.lat);
  const lng = numericValue(point.lng);
  return {
    ...point,
    lat: lat === null ? point.lat : lat,
    lng: lng === null ? point.lng : lng,
    speed: numericValue(point.speed) ?? point.speed,
  };
}

function calculateDistanceKm(points) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  return points.slice(1).reduce((distance, point, index) => {
    const previous = points[index];
    const previousLat = numericValue(previous.lat);
    const previousLng = numericValue(previous.lng);
    const lat = numericValue(point.lat);
    const lng = numericValue(point.lng);
    if (previousLat === null || previousLng === null || lat === null || lng === null) {
      return distance;
    }
    const latitudeDelta = radians(lat - previousLat);
    const longitudeDelta = radians(lng - previousLng);
    const haversine = Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(radians(previousLat)) * Math.cos(radians(lat)) *
      Math.sin(longitudeDelta / 2) ** 2;
    return distance + 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }, 0);
}

function getDeviceLabel(device) {
  return device.vehicle?.make || device.name || device.plateNumber || device.serial || "Автомобіль";
}

function getDeviceKey(device) {
  return String(device.serial || device.id);
}

function normalizeDeviceId(value) {
  return value == null ? "" : String(value).trim().toLocaleLowerCase("uk-UA");
}

const sensorLabels = {
  adblue: "AdBlue",
  analog: "Аналоговий датчик",
  alarm: "Тривога",
  alarm_arm: "Охорона",
  battery: "Акумулятор",
  course_deg: "Курс",
  digital: "Цифровий датчик",
  fuel: "Пальне",
  gps_validity_pct: "Якість GPS",
  ign_on: "Запалювання",
  reset: "Скидання",
  satellites: "Супутники",
  speed_kmh: "Швидкість",
};

function formatSensorName(value) {
  const key = String(value || "").trim();
  if (sensorLabels[key.toLocaleLowerCase("en-US")]) {
    return sensorLabels[key.toLocaleLowerCase("en-US")];
  }
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toLocaleUpperCase("uk-UA"));
}

function getSensorEntries(sensors) {
  if (!sensors || typeof sensors !== "object") return [];
  const entries = [];

  const addScalar = (key, value, name, unit) => {
    if (value === null || value === undefined || value === "") return;
    if (typeof value === "object") {
      visit(value, key, name, unit);
      return;
    }
    entries.push({
      key,
      name,
      value,
      unit: unit || "",
    });
  };

  const visit = (value, path, inheritedName, inheritedUnit = "") => {
    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemName = item && typeof item === "object"
          ? item.name || item.label || item.sensorName || inheritedName
          : inheritedName;
        visit(item, `${path}.${index}`, itemName, inheritedUnit);
      });
      return;
    }

    if (typeof value !== "object") {
      const pathName = path.split(".").filter((part) => part && !/^\d+$/.test(part)).at(-1);
      addScalar(path, value, formatSensorName(inheritedName || pathName || "Датчик"), inheritedUnit);
      return;
    }

    const unit = value.unit || value.units || inheritedUnit;
    const descriptorName = value.name || value.label || value.sensorName || value.title;
    if (Object.hasOwn(value, "value")) {
      addScalar(
        `${path}.value`,
        value.value,
        formatSensorName(descriptorName || inheritedName || path.split(".").at(-1) || "Датчик"),
        unit,
      );
    }

    const metadataKeys = new Set([
      "name", "label", "sensorName", "title", "unit", "units", "value", "id", "type",
    ]);
    for (const [key, nestedValue] of Object.entries(value)) {
      if (!metadataKeys.has(key)) {
        const nextName = descriptorName || formatSensorName(key);
        visit(nestedValue, `${path}.${key}`, nextName, unit);
      }
    }
  };

  const roots = Array.isArray(sensors)
    ? sensors.map((sensor, index) => [
      String(sensor?.id ?? sensor?.name ?? sensor?.label ?? index),
      sensor,
    ])
    : Object.entries(sensors);

  roots.forEach(([key, value]) => visit(value, key, formatSensorName(key)));
  return entries;
}

function numericValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function getTelemetryMetrics(points) {
  const metrics = [{ key: "speed", label: "Швидкість", unit: "км/год" }];
  const seenKeys = new Set(["speed"]);

  points.forEach((point) => {
    getSensorEntries(point.sensors).forEach((sensor) => {
      if (!seenKeys.has(sensor.key) && numericValue(sensor.value) !== null) {
        seenKeys.add(sensor.key);
        metrics.push({
          key: `sensor:${sensor.key}`,
          sensorKey: sensor.key,
          label: sensor.name,
          unit: sensor.unit,
        });
      }
    });
  });

  return metrics;
}

function getMetricValue(point, metric) {
  if (metric.key === "speed") return numericValue(point.speed);
  const sensor = getSensorEntries(point.sensors).find((entry) => entry.key === metric.sensorKey);
  return numericValue(sensor?.value);
}

function TelemetryChart({ points, metric }) {
  const values = points
    .map((point) => ({ point, value: getMetricValue(point, metric) }))
    .filter((item) => item.value !== null);
  if (values.length < 2) {
    return <p className="fleet-map-page__chart-empty">Недостатньо точок для графіка цього параметра.</p>;
  }

  const low = Math.min(...values.map(({ value }) => value));
  const high = Math.max(...values.map(({ value }) => value));
  const spread = high - low || 1;
  const path = values.map(({ value }, index) => {
    const x = (index / (values.length - 1)) * 1000;
    const y = 154 - ((value - low) / spread) * 138;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="fleet-map-page__chart-wrap">
      <div className="fleet-map-page__chart-values">
        <span>{high.toLocaleString("uk-UA")} {metric.unit}</span>
        <span>{low.toLocaleString("uk-UA")} {metric.unit}</span>
      </div>
      <svg className="fleet-map-page__chart" viewBox="0 0 1000 170" preserveAspectRatio="none" role="img" aria-label={`Графік: ${metric.label}`}>
        {[16, 62, 108, 154].map((y) => <line key={y} x1="0" y1={y} x2="1000" y2={y} />)}
        <path d={path} />
      </svg>
      <div className="fleet-map-page__chart-time">
        <span>{formatTime(values[0].point.timestamp)}</span>
        <span>{formatTime(values[values.length - 1].point.timestamp)}</span>
      </div>
    </div>
  );
}

function VehicleDetailsPanel({
  entry,
  history,
  databasePointCount,
  range,
  appliedRange,
  onRangeChange,
  onApplyRange,
  onClose,
  panelHeight,
  onPanelHeightChange,
  playbackIndex,
  onPlaybackIndexChange,
  isPlaying,
  onTogglePlayback,
  playbackSpeed,
  onPlaybackSpeedChange,
}) {
  const [activeMetricKey, setActiveMetricKey] = useState("speed");
  const [activeTab, setActiveTab] = useState("chart");
  const [rangeError, setRangeError] = useState("");
  const { device, position } = entry;
  const points = history.points.length ? history.points : [position];
  const metrics = getTelemetryMetrics(points);
  const metric = metrics.find((item) => item.key === activeMetricKey) || metrics[0];
  const sensors = getSensorEntries(position.sensors);
  const historyPoints = history.points;
  const safePlaybackIndex = Number.isFinite(playbackIndex)
    ? Math.min(Math.max(0, playbackIndex), Math.max(0, historyPoints.length - 1))
    : 0;
  const activePoint = historyPoints[safePlaybackIndex] || null;
  const distanceKm = calculateDistanceKm(historyPoints);
  const playbackPercent = historyPoints.length > 1
    ? (safePlaybackIndex / (historyPoints.length - 1)) * 100
    : 0;
  const startResize = (event) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = panelHeight;
    const onMove = (moveEvent) => {
      onPanelHeightChange(Math.min(
        Math.round(window.innerHeight * 0.76),
        Math.max(190, startHeight + startY - moveEvent.clientY),
      ));
    };
    const onEnd = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  };
  const applyRange = () => {
    const from = new Date(range.from);
    const to = new Date(range.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
      setRangeError("Вкажіть коректний проміжок: дата й час «від» мають передувати «до».");
      return;
    }
    setRangeError("");
    onApplyRange({ from: from.toISOString(), to: to.toISOString() });
  };

  return (
    <section
      className="fleet-map-page__details-panel"
      style={{ height: `${panelHeight}px` }}
      aria-label={`Дані GPS: ${getDeviceLabel(device)}`}
    >
      <button
        className="fleet-map-page__resize-handle"
        type="button"
        onPointerDown={startResize}
        aria-label="Змінити висоту панелі"
        title="Перетягніть, щоб змінити висоту панелі"
      />
      <header className="fleet-map-page__details-header">
        <div className="fleet-map-page__details-vehicle">
          <span className={`fleet-map-page__status${device.status === "ONLINE" ? " is-online" : ""}`} />
          <div>
            <strong>{device.vehicle?.make || getDeviceLabel(device)}</strong>
            <span>
              {device.vehicle?.plate || device.plateNumber || device.serial || "GPS-пристрій"}
              {device.vehicle?.type ? ` · ${device.vehicle.type}` : ""}
              {device.vehicle?.currentDriver?.fullName ? ` · ${device.vehicle.currentDriver.fullName}` : ""}
            </span>
          </div>
        </div>
        <div className="fleet-map-page__details-actions">
          <button className="fleet-map-page__details-close" type="button" onClick={onClose} aria-label="Закрити дані машини">×</button>
        </div>
      </header>

      <div className="fleet-map-page__range-controls">
        <div className="fleet-map-page__range-presets" aria-label="Швидкий вибір періоду">
          {[1, 6, 24].map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => {
                const preset = createRelativeTimeRange(hours);
                onRangeChange(preset);
                onApplyRange({
                  from: new Date(preset.from).toISOString(),
                  to: new Date(preset.to).toISOString(),
                });
                setRangeError("");
              }}
            >
              {hours} год
            </button>
          ))}
        </div>
        <label>Від <input type="datetime-local" value={range.from} onChange={(event) => onRangeChange({ ...range, from: event.target.value })} /></label>
        <label>До <input type="datetime-local" value={range.to} onChange={(event) => onRangeChange({ ...range, to: event.target.value })} /></label>
        <button className="fleet-map-page__range-apply" type="button" onClick={applyRange}>Показати</button>
      </div>
      {(rangeError || history.error) && (
        <p className="fleet-map-page__panel-error" role="status">{rangeError || history.error}</p>
      )}

      <nav className="fleet-map-page__detail-tabs" aria-label="Інформація про автомобіль">
        {[
          ["overview", "Огляд"],
          ["chart", "Маршрут та графік"],
          ["sensors", `Датчики (${sensors.length})`],
        ].map(([tab, label]) => (
          <button key={tab} type="button" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>
            {label}
          </button>
        ))}
        {activeTab === "chart" && (
          <div className="fleet-map-page__metric-tabs">
            {metrics.map((item) => (
              <button key={item.key} type="button" className={metric.key === item.key ? "is-active" : ""} onClick={() => setActiveMetricKey(item.key)}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="fleet-map-page__details-content">
        {activeTab === "overview" && (
          <>
            <div className="fleet-map-page__telemetry-summary">
              <article><span>Швидкість</span><strong>{Number.isFinite(position.speed) ? `${position.speed} км/год` : "—"}</strong></article>
              <article><span>Запалювання</span><strong>{position.ignition == null ? "—" : position.ignition ? "Увімкнене" : "Вимкнене"}</strong></article>
              <article><span>Курс</span><strong>{Number.isFinite(position.course) ? `${Math.round(position.course)}°` : "—"}</strong></article>
              <article><span>Висота</span><strong>{Number.isFinite(position.altitude) ? `${position.altitude} м` : "—"}</strong></article>
              <article><span>Координати</span><strong>{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</strong></article>
              <article><span>Оновлено</span><strong>{formatTime(position.timestamp)}</strong></article>
            </div>
            <div className="fleet-map-page__sensor-list" aria-label="Поточні дані датчиків">
              {sensors.length ? sensors.map((sensor) => (
                <span key={sensor.key}><i />{sensor.name}: <strong>{String(sensor.value)} {sensor.unit}</strong></span>
              )) : <span className="fleet-map-page__no-sensors">GPS не передав додаткових датчиків для останньої точки.</span>}
            </div>
          </>
        )}
        {activeTab === "chart" && (
          <div className="fleet-map-page__history">
            <div className="fleet-map-page__playback-summary">
              <div className="fleet-map-page__playback-vehicle">
                <strong>{getDeviceLabel(device)} {device.vehicle?.plate || device.plateNumber || ""}</strong>
                <span>{device.serial || device.id || "GPS"} · {historyPoints.length.toLocaleString("uk-UA")} точок за період · {databasePointCount.toLocaleString("uk-UA")} точок у БД</span>
              </div>
              <div className="fleet-map-page__playback-stats">
                <span>Період <strong>{formatTime(appliedRange.from)} — {formatTime(appliedRange.to)}</strong></span>
                <span>Шлях за GPS-точками <strong>{distanceKm.toLocaleString("uk-UA", { maximumFractionDigits: 1 })} км</strong></span>
                <span>Швидкість <strong>{Number.isFinite(activePoint?.speed) ? `${activePoint.speed} км/год` : "—"}</strong></span>
              </div>
            </div>
            <div className="fleet-map-page__playback-controls">
              <button type="button" onClick={() => onPlaybackIndexChange(0)} disabled={!historyPoints.length} aria-label="На початок маршруту" title="На початок">|◀</button>
              <button type="button" onClick={onTogglePlayback} disabled={historyPoints.length < 2} aria-label={isPlaying ? "Пауза" : "Відтворити"} title={isPlaying ? "Пауза" : "Відтворити"}>
                {isPlaying ? "Ⅱ" : "▶"}
              </button>
              <button type="button" onClick={() => onPlaybackIndexChange(Math.min(safePlaybackIndex + 1, historyPoints.length - 1))} disabled={!historyPoints.length} aria-label="Наступна точка" title="Наступна точка">▶|</button>
              <button className="fleet-map-page__playback-speed" type="button" onClick={onPlaybackSpeedChange} title="Змінити швидкість відтворення">
                ×{playbackSpeed}
              </button>
              <strong>{activePoint ? formatTime(activePoint.timestamp) : "Оберіть період"}</strong>
              <span className="fleet-map-page__playback-current">{historyPoints.length ? safePlaybackIndex + 1 : 0} / {historyPoints.length}</span>
            </div>
            <div className="fleet-map-page__timeline">
              <input
                type="range"
                min="0"
                max={Math.max(0, historyPoints.length - 1)}
                value={safePlaybackIndex}
                disabled={historyPoints.length < 2}
                onChange={(event) => {
                  const nextIndex = Number(event.target.value);
                  if (Number.isFinite(nextIndex)) onPlaybackIndexChange(nextIndex);
                }}
                style={{ "--timeline-progress": `${playbackPercent}%` }}
                aria-label="Положення автомобіля за часом"
              />
              <div className="fleet-map-page__timeline-labels">
                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                  const pointIndex = Math.round((historyPoints.length - 1) * fraction);
                  return <span key={fraction}>{historyPoints[pointIndex] ? formatClock(historyPoints[pointIndex].timestamp) : "—"}</span>;
                })}
              </div>
            </div>
            <div className="fleet-map-page__chart-toolbar">
              <strong>{history.loading ? "Завантаження історії з бази даних…" : "Параметри телеметрії"}</strong>
              <span>Маршрут відображається за GPS-точками з БД</span>
            </div>
            <div className="fleet-map-page__route-metrics" aria-label="Показники графіка">
              {metrics.map((item) => (
                <button key={item.key} type="button" className={metric.key === item.key ? "is-active" : ""} onClick={() => setActiveMetricKey(item.key)}>
                  <i />{item.label}{item.unit ? ` · ${item.unit}` : ""}
                </button>
              ))}
            </div>
            {history.error ? (
              <p className="fleet-map-page__chart-empty" role="status">{history.error}</p>
            ) : history.loading ? (
              <p className="fleet-map-page__chart-empty" role="status">Завантаження збереженої історії GPS…</p>
            ) : historyPoints.length === 0 ? (
              <p className="fleet-map-page__chart-empty" role="status">За цей період ще немає збережених точок GPS.</p>
            ) : (
              <TelemetryChart points={historyPoints} metric={metric} />
            )}
          </div>
        )}
        {activeTab === "sensors" && (
          <div className="fleet-map-page__sensor-list fleet-map-page__sensor-list--expanded" aria-label="Поточні дані датчиків">
            {sensors.length ? sensors.map((sensor) => (
              <span key={sensor.key}><i />{sensor.name}: <strong>{String(sensor.value)} {sensor.unit}</strong></span>
            )) : <span className="fleet-map-page__no-sensors">GPS не передав додаткових датчиків для останньої точки.</span>}
          </div>
        )}
      </div>
    </section>
  );
}

function loadGoogleMaps() {
  const mapsApi = window.google?.maps;
  if (mapsApi?.Map) return Promise.resolve(mapsApi);
  if (mapsApi?.importLibrary) {
    return mapsApi.importLibrary("maps").then(() => window.google.maps);
  }
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: googleMapsApiKey,
      loading: "async",
      v: "weekly",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.dataset.googleMaps = "true";
    script.onload = async () => {
      try {
        const loadedMapsApi = window.google?.maps;
        if (!loadedMapsApi?.importLibrary) {
          throw new Error("Google Maps не вдалося ініціалізувати. Перевірте API-ключ і доступ до Maps JavaScript API.");
        }
        await loadedMapsApi.importLibrary("maps");
        if (!window.google?.maps?.Map) {
          throw new Error("Бібліотека Google Maps завантажилась без конструктора карти.");
        }
        resolve(window.google.maps);
      } catch (error) {
        googleMapsPromise = null;
        reject(error);
      }
    };
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("Не вдалося завантажити Google Maps."));
    };
    document.head.append(script);
  });

  return googleMapsPromise;
}

function createVehicleMarkerIcon(isOnline) {
  const color = isOnline ? "#24a46c" : "#e8594f";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 40"><path fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round" d="M3 8h25v21H3zM28 15h10l7 8v6H28z"/><path fill="#d9f0ff" stroke="#fff" stroke-width="1.5" d="M31 18h6l4 5H31z"/><path fill="#263746" stroke="#fff" stroke-width="1.5" d="M9 26a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm27 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/><path fill="#eaf0f4" d="M9 29a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm27 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(42, 36),
    anchor: new window.google.maps.Point(21, 32),
  };
}

function GoogleFleetMap({
  devices,
  selectedDevice,
  selectedDeviceVersion,
  routePoints,
  playbackPoint,
  routeIdentity,
  mapErrorMessage,
  onSelectDevice,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef(new Map());
  const routeLineRef = useRef(null);
  const playbackMarkerRef = useRef(null);
  const lastRouteFitKey = useRef("");
  const selectDeviceRef = useRef(onSelectDevice);
  const lastFocusedVersion = useRef(0);
  const hasInitialView = useRef(false);
  const [mapError, setMapError] = useState("");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    selectDeviceRef.current = onSelectDevice;
  }, [onSelectDevice]);

  useEffect(() => {
    const markers = markerRefs.current;
    if (!googleMapsApiKey) {
      return undefined;
    }

    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const map = new maps.Map(containerRef.current, {
          center: { lat: defaultCenter[0], lng: defaultCenter[1] },
          zoom: 6,
          mapTypeId: "roadmap",
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
        });
        mapRef.current = map;
        setMapReady(true);
        setMapError("");
      })
      .catch((error) => {
        if (!cancelled) setMapError(error.message || "Не вдалося завантажити Google Maps.");
      });

    return () => {
      cancelled = true;
      for (const marker of markers.values()) marker.setMap(null);
      markers.clear();
      routeLineRef.current?.setMap(null);
      playbackMarkerRef.current?.setMap(null);
      routeLineRef.current = null;
      playbackMarkerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !window.google?.maps) return;

    const maps = window.google.maps;
    const activeKeys = new Set();

    devices.forEach(({ device, position }) => {
      if (!Number.isFinite(position?.lat) || !Number.isFinite(position?.lng)) return;

      const key = getDeviceKey(device);
      activeKeys.add(key);
      let marker = markerRefs.current.get(key);
      if (!marker) {
        marker = new maps.Marker({ map });
        marker.addListener("click", () => {
          selectDeviceRef.current(key);
        });
        markerRefs.current.set(key, marker);
      }

      marker.setPosition({ lat: position.lat, lng: position.lng });
      marker.setTitle(getDeviceLabel(device));
      marker.setIcon(createVehicleMarkerIcon(device.status === "ONLINE"));
    });

    for (const [key, marker] of markerRefs.current) {
      if (!activeKeys.has(key)) {
        marker.setMap(null);
        markerRefs.current.delete(key);
      }
    }

    const points = devices
      .map(({ position }) => position)
      .filter((position) => Number.isFinite(position?.lat) && Number.isFinite(position?.lng));

    if (points.length === 1) {
      if (!hasInitialView.current) {
        map.setCenter({ lat: points[0].lat, lng: points[0].lng });
        map.setZoom(13);
        hasInitialView.current = true;
      }
    } else if (points.length > 1 && !hasInitialView.current) {
      const bounds = new maps.LatLngBounds();
      points.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      map.fitBounds(bounds, 40);
      hasInitialView.current = true;
    }
  }, [devices, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = window.google?.maps;
    if (!mapReady || !map || !maps) return;

    const validRoutePoints = routePoints
      .map(normalizeTelemetryPoint)
      .filter((point) =>
        Number.isFinite(numericValue(point?.lat)) && Number.isFinite(numericValue(point?.lng)))
      .map((point) => ({
        ...point,
        lat: numericValue(point.lat),
        lng: numericValue(point.lng),
      }));

    if (validRoutePoints.length > 1) {
      if (!routeLineRef.current) {
        routeLineRef.current = new maps.Polyline({
          map,
          geodesic: true,
          clickable: false,
          zIndex: 100,
          strokeColor: "#ef2938",
          strokeOpacity: 1,
          strokeWeight: 6,
        });
      }
      routeLineRef.current.setMap(map);
      routeLineRef.current.setPath(validRoutePoints.map(({ lat, lng }) => ({ lat, lng })));
      routeLineRef.current.setOptions({ visible: true });

      if (lastRouteFitKey.current !== routeIdentity) {
        const bounds = new maps.LatLngBounds();
        validRoutePoints.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
        map.fitBounds(bounds, 56);
        lastRouteFitKey.current = routeIdentity;
      }
    } else if (routeLineRef.current) {
      routeLineRef.current.setMap(null);
      routeLineRef.current = null;
    }

    if (playbackPoint && Number.isFinite(playbackPoint.lat) && Number.isFinite(playbackPoint.lng)) {
      if (!playbackMarkerRef.current) {
        playbackMarkerRef.current = new maps.Marker({
          map,
          zIndex: 1000,
          optimized: true,
        });
      }
      playbackMarkerRef.current.setMap(map);
      playbackMarkerRef.current.setPosition({ lat: playbackPoint.lat, lng: playbackPoint.lng });
      playbackMarkerRef.current.setTitle(
        `${getDeviceLabel(selectedDevice?.device || {})} · ${formatTime(playbackPoint.timestamp)}`
      );
      playbackMarkerRef.current.setIcon(createVehicleMarkerIcon(true));
    } else if (playbackMarkerRef.current) {
      playbackMarkerRef.current.setMap(null);
    }
  }, [mapReady, playbackPoint, routeIdentity, routePoints, selectedDevice]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDevice?.position) return;
    if (lastFocusedVersion.current === selectedDeviceVersion) return;
    lastFocusedVersion.current = selectedDeviceVersion;

    map.panTo({ lat: selectedDevice.position.lat, lng: selectedDevice.position.lng });
    map.setZoom(Math.max(map.getZoom() || 0, 14));
  }, [selectedDevice, selectedDeviceVersion]);

  return (
    <div className="fleet-map-page__map">
      <div ref={containerRef} className="fleet-map-page__google-map" aria-label="Google Maps із позиціями машин" />
      {(mapErrorMessage || mapError) && (
        <div className="fleet-map-page__map-message" role="alert">{mapErrorMessage || mapError}</div>
      )}
    </div>
  );
}

function FleetMapPage() {
  const [mapData, setMapData] = useState({ devices: [], vehicles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehiclesError, setVehiclesError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedDeviceKey, setSelectedDeviceKey] = useState(null);
  const [historyRange, setHistoryRange] = useState(() => createRelativeTimeRange(6));
  const [appliedRange, setAppliedRange] = useState(() => {
    const range = createRelativeTimeRange(6);
    return {
      from: new Date(range.from).toISOString(),
      to: new Date(range.to).toISOString(),
    };
  });
  const [detailsPanelHeight, setDetailsPanelHeight] = useState(360);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [telemetryHistory, setTelemetryHistory] = useState({
    points: [],
    loading: false,
    error: "",
  });
  const [databasePointCount, setDatabasePointCount] = useState(0);

  const loadMapData = useCallback(async (signal) => {
    try {
      const [response, vehiclesResponse] = await Promise.all([
        fetch("/api/globus/map-data", { credentials: "include", signal }),
        fetch("/api/fleet/vehicles", { credentials: "include", signal }),
      ]);
      const [payload, vehiclesPayload] = await Promise.all([
        response.json().catch(() => ({})),
        vehiclesResponse.json().catch(() => ({})),
      ]);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Endpoint карти не знайдений у бекенді. Перезапустіть TMS API, щоб завантажився GlobusMapController."
          );
        }
        throw new Error(payload.detail || payload.title || "Не вдалося отримати дані GPS.");
      }

      if (!vehiclesResponse.ok) {
        setVehiclesError(vehiclesPayload.detail || vehiclesPayload.title || "Не вдалося завантажити дані транспорту.");
      } else {
        setVehiclesError("");
      }

      setMapData({
        devices: Array.isArray(payload.devices) ? payload.devices : [],
        vehicles: vehiclesResponse.ok && Array.isArray(vehiclesPayload) ? vehiclesPayload : [],
      });
      setLastUpdated(new Date());
      setError("");
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setError(loadError.message || "Не вдалося отримати дані GPS.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const [selectionVersion, setSelectionVersion] = useState(0);
  const selectDevice = useCallback((key) => {
    setSelectedDeviceKey(key);
    setTelemetryHistory({ points: [], loading: true, error: "" });
    setPlaybackIndex(0);
    setIsPlaying(false);
    setSelectionVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timerId;
    const refresh = async () => {
      await loadMapData(controller.signal);
      if (!controller.signal.aborted) {
        timerId = window.setTimeout(refresh, refreshInterval);
      }
    };

    refresh();
    return () => {
      controller.abort();
      window.clearTimeout(timerId);
    };
  }, [loadMapData]);

  const linkedDevices = useMemo(() => mapData.devices.map((entry) => {
    const deviceIds = new Set([
      normalizeDeviceId(entry.device.serial),
      normalizeDeviceId(entry.device.id),
    ].filter(Boolean));
    const vehicle = mapData.vehicles.find((candidate) =>
      deviceIds.has(normalizeDeviceId(candidate.imei || candidate.gpsDeviceId))
    );
    return { ...entry, device: { ...entry.device, vehicle } };
  }), [mapData.devices, mapData.vehicles]);

  const filteredDevices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("uk-UA");
    return linkedDevices.filter(({ device, position }) => {
      const online = device.status === "ONLINE";
      const matchesFilter = filter === "all" || (filter === "online" ? online : !online);
      const matchesQuery = !normalizedQuery || [
        device.name,
        device.plateNumber,
        device.serial,
        device.model,
        device.vehicle?.plate,
        device.vehicle?.make,
      ].some((value) => value?.toLocaleLowerCase("uk-UA").includes(normalizedQuery));

      return matchesFilter && matchesQuery && position &&
        Number.isFinite(position.lat) && Number.isFinite(position.lng);
    });
  }, [filter, linkedDevices, query]);

  const onlineCount = mapData.devices.filter(({ device }) => device.status === "ONLINE").length;
  const devicesWithoutPosition = mapData.devices.length - filteredDevices.length;
  const selectedDevice = filteredDevices.find(({ device }) => getDeviceKey(device) === selectedDeviceKey);
  const mapErrorMessage = googleMapsApiKey
    ? null
    : "Додайте ключ Google Maps у frontend/my-react-app/.env.local як VITE_GOOGLE_MAPS_API_KEY.";

  const selectedDeviceSerial = selectedDevice?.device.serial;
  const selectedLinkedSerial = selectedDevice?.device.vehicle?.imei ||
    selectedDevice?.device.vehicle?.gpsDeviceId;
  useEffect(() => {
    if (!selectedDeviceSerial) {
      setDatabasePointCount(0);
      setTelemetryHistory({ points: [], loading: false, error: "" });
      setPlaybackIndex(0);
      setIsPlaying(false);
      return undefined;
    }

    if (normalizeDeviceId(selectedLinkedSerial) !== normalizeDeviceId(selectedDeviceSerial)) {
      setTelemetryHistory({
        points: [],
        loading: false,
        error: "Цей GPS-пристрій не прив’язаний до машини за серійним номером. Вкажіть правильний серійний номер у картці транспорту → Телематика.",
      });
      setPlaybackIndex(0);
      setIsPlaying(false);
      return undefined;
    }

    const controller = new AbortController();
    const params = new URLSearchParams(appliedRange);
    setTelemetryHistory({ points: [], loading: true, error: "" });

    fetch(`/api/globus/devices/${encodeURIComponent(selectedDeviceSerial)}/telemetry/count`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = await response.json().catch(() => ({}));
        setDatabasePointCount(Number(payload.count) || 0);
      })
      .catch(() => {});

    fetch(
      `/api/globus/devices/${encodeURIComponent(selectedDeviceSerial)}/telemetry?${params}`,
      { credentials: "include", signal: controller.signal },
    )
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.detail || payload.title || "Не вдалося завантажити історію телеметрії.");
        }
        setTelemetryHistory({
          points: Array.isArray(payload)
            ? payload.map(normalizeTelemetryPoint).filter((point) =>
              Number.isFinite(point?.lat) && Number.isFinite(point?.lng))
            : [],
          loading: false,
          error: "",
        });
      })
      .catch((historyError) => {
        if (!controller.signal.aborted) {
          setTelemetryHistory({
            points: [],
            loading: false,
            error: historyError.message || "Не вдалося завантажити історію телеметрії.",
          });
        }
      });

    return () => controller.abort();
  }, [appliedRange, selectedDeviceSerial, selectedLinkedSerial]);

  useEffect(() => {
    setPlaybackIndex(0);
    setIsPlaying(false);
  }, [appliedRange, selectedDeviceSerial]);

  useEffect(() => {
    if (!isPlaying || telemetryHistory.points.length < 2) return undefined;
    const timerId = window.setTimeout(() => {
      setPlaybackIndex((currentIndex) => {
        if (currentIndex >= telemetryHistory.points.length - 1) {
          setIsPlaying(false);
          return currentIndex;
        }
        return currentIndex + 1;
      });
    }, 1000 / playbackSpeed);
    return () => window.clearTimeout(timerId);
  }, [isPlaying, playbackIndex, playbackSpeed, telemetryHistory.points.length]);

  const playbackPoint = telemetryHistory.points[playbackIndex] || null;
  const routeIdentity = `${selectedDeviceSerial || ""}:${appliedRange.from}:${appliedRange.to}:${selectionVersion}`;
  const togglePlayback = () => {
    if (!isPlaying && playbackIndex >= telemetryHistory.points.length - 1) {
      setPlaybackIndex(0);
    }
    setIsPlaying((playing) => !playing);
  };
  const cyclePlaybackSpeed = () => {
    setPlaybackSpeed((speed) => (speed >= 8 ? 1 : speed * 2));
  };

  return (
    <section className={`fleet-map-page${selectedDevice ? " has-selected-device" : ""}`}>
      <header className="fleet-map-page__header">
        <div>
          <span className="fleet-map-page__eyebrow">GPS моніторинг</span>
          <h1>Карта автопарку</h1>
          <p>Розташування машин за поточними GPS-координатами.</p>
        </div>
        <div className="fleet-map-page__refresh">
          <span>{lastUpdated ? `Оновлено ${formatTime(lastUpdated)}` : "Очікуємо дані GPS"}</span>
          <button type="button" onClick={() => loadMapData()} disabled={loading}>
            {loading ? "Оновлення…" : "Оновити"}
          </button>
        </div>
      </header>

      {error && (
        <div className="fleet-map-page__error" role="alert">
          <strong>Не вдалося оновити дані.</strong> {error}
          {mapData.devices.length > 0 && <span> Показано останні успішно завантажені дані.</span>}
        </div>
      )}

      <div className="fleet-map-page__stats">
        <article><span>Машини</span><strong>{mapData.devices.length}</strong></article>
        <article><span>На зв’язку</span><strong>{onlineCount}</strong></article>
      </div>

      <div className="fleet-map-page__workspace">
        <aside
          className={`fleet-map-page__sidebar${selectedDevice ? " has-selected-device" : ""}`}
          style={selectedDevice ? { bottom: `${detailsPanelHeight + 30}px` } : undefined}
        >
          <label className="fleet-map-page__search">
            <span className="visually-hidden">Пошук машини</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Пошук за назвою, номером або IMEI"
            />
          </label>
          <div className="fleet-map-page__filters" aria-label="Фільтр машин">
            {[
              ["all", "Усі"],
              ["online", "На зв’язку"],
              ["offline", "Не на зв’язку"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={filter === value ? "is-active" : ""}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {vehiclesError && (
            <p className="fleet-map-page__footnote" role="status">
              Не вдалося зв’язати GPS-пристрої з картками транспорту: {vehiclesError}
            </p>
          )}

          {loading && mapData.devices.length === 0 ? (
            <p className="fleet-map-page__empty" role="status">Завантажуємо автопарк…</p>
          ) : filteredDevices.length === 0 ? (
            <p className="fleet-map-page__empty">
              {mapData.devices.length === 0
                ? "Машини не знайдені. Перевірте API-токен і доступ devices:read."
                : "Немає машин із позицією за вибраними умовами."}
            </p>
          ) : (
            <ul className="fleet-map-page__vehicle-list">
              {filteredDevices.map(({ device, position }) => (
                <li key={getDeviceKey(device)}>
                  <button
                    type="button"
                    className={`fleet-map-page__vehicle${getDeviceKey(device) === selectedDeviceKey ? " is-selected" : ""}`}
                    onClick={() => selectDevice(getDeviceKey(device))}
                    aria-label={`Показати на карті: ${getDeviceLabel(device)}`}
                  >
                    <span className={`fleet-map-page__status${device.status === "ONLINE" ? " is-online" : ""}`} />
                    <span className="fleet-map-page__vehicle-info">
                      <strong>{getDeviceLabel(device)}</strong>
                      <span>{device.vehicle
                        ? `${device.vehicle.plate} · ${device.vehicle.type}`
                        : device.plateNumber || device.serial || device.model || "Не прив’язано до картки транспорту"}</span>
                      <small>
                        {Number.isFinite(position.speed) ? `${position.speed} км/год` : "Швидкість —"}
                        {" · "}
                        {formatTime(position.timestamp)}
                      </small>
                    </span>
                    <span className="fleet-map-page__vehicle-action" aria-hidden="true">↗</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {mapData.devices.length > filteredDevices.length && (
            <p className="fleet-map-page__footnote">
              Без позиції або приховано фільтром: {devicesWithoutPosition}
            </p>
          )}
          <div className="fleet-map-page__legend">
            <span><i className="is-online" /> На зв’язку</span>
            <span><i /> Немає зв’язку / GPS</span>
          </div>
        </aside>

        <GoogleFleetMap
          devices={filteredDevices}
          selectedDevice={selectedDevice}
          selectedDeviceVersion={selectionVersion}
          routePoints={telemetryHistory.points}
          playbackPoint={playbackPoint}
          routeIdentity={routeIdentity}
          mapErrorMessage={mapErrorMessage}
          onSelectDevice={selectDevice}
        />
      </div>
      {selectedDevice && (
        <VehicleDetailsPanel
          key={getDeviceKey(selectedDevice.device)}
          entry={selectedDevice}
          history={telemetryHistory}
          databasePointCount={databasePointCount}
          range={historyRange}
          appliedRange={appliedRange}
          onRangeChange={setHistoryRange}
          onApplyRange={(nextRange) => {
            setTelemetryHistory({ points: [], loading: true, error: "" });
            setPlaybackIndex(0);
            setIsPlaying(false);
            setAppliedRange(nextRange);
          }}
          onClose={() => setSelectedDeviceKey(null)}
          panelHeight={detailsPanelHeight}
          onPanelHeightChange={setDetailsPanelHeight}
          playbackIndex={playbackIndex}
          onPlaybackIndexChange={(index) => {
            setPlaybackIndex(index);
            setIsPlaying(false);
          }}
          isPlaying={isPlaying}
          onTogglePlayback={togglePlayback}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={cyclePlaybackSpeed}
        />
      )}
    </section>
  );
}

export default FleetMapPage;
