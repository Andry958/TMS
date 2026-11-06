import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useToast } from "../context/useToast";
import "../styles/loading-calendar.css";

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function LoadingCalendarPage() {
  const navigate = useNavigate();
  const { apiData } = useApi();
  const { pushToast } = useToast();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [board, setBoard] = useState({ vehicles: [], availableOrders: [], requests: [] });
  const [clientFilter, setClientFilter] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [draggedOrderId, setDraggedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);

  const monthDays = useMemo(() => {
    const count = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: count }, (_, index) =>
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1));
  }, [visibleMonth]);
  const rangeStart = dateKey(monthDays[0]);
  const rangeEnd = dateKey(monthDays[monthDays.length - 1]);
  const monthLabel = new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric" }).format(visibleMonth);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: rangeStart, to: rangeEnd });
      const response = await fetch(`${apiData}/transport-planning?${params}`, { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`);
      setBoard({
        vehicles: result.vehicles || [],
        availableOrders: result.availableOrders || [],
        requests: result.requests || [],
      });
    } catch (error) {
      console.error("Помилка завантаження календаря перевезень:", error);
      pushToast(error.message || "Не вдалося завантажити календар перевезень.", "error");
    } finally {
      setLoading(false);
    }
  }, [apiData, pushToast, rangeEnd, rangeStart]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const clients = useMemo(() => {
    const names = new Set(board.availableOrders.map(order => order.clientName));
    board.requests.forEach(request => names.add(request.clientName));
    board.vehicles.forEach(vehicle => vehicle.trips.forEach(trip =>
      trip.orders.forEach(order => names.add(order.clientName))));
    return [...names].sort((first, second) => first.localeCompare(second, "uk"));
  }, [board]);

  const availableOrders = useMemo(() => board.availableOrders.filter(order =>
    (!clientFilter || order.clientName === clientFilter) &&
    (!orderSearch || `${order.orderNumber} ${order.clientName} ${order.loadingCity || ""} ${order.deliveryCity || ""}`
      .toLocaleLowerCase("uk").includes(orderSearch.toLocaleLowerCase("uk")))),
  [board.availableOrders, clientFilter, orderSearch]);
  const visibleRequests = useMemo(() => board.requests.filter(request =>
    (!clientFilter || request.clientName === clientFilter) &&
    (!orderSearch || `${request.id} ${request.clientName} ${request.loadingCity} ${request.deliveryCity} ${request.cargoDescription}`
      .toLocaleLowerCase("uk").includes(orderSearch.toLocaleLowerCase("uk")))),
  [board.requests, clientFilter, orderSearch]);

  const scheduledOrderCount = board.vehicles.reduce((sum, vehicle) =>
    sum + vehicle.trips.reduce((tripSum, trip) => tripSum + trip.orders.length, 0), 0);
  const scheduleOrder = async (orderId, vehicle, date, trip = null) => {
    if (scheduling) return;
    const order = board.availableOrders.find(item => item.id === orderId);
    if (!order) return;
    const scheduledDate = order.loadingDate || order.deliveryDate || dateKey(date);

    setScheduling(true);
    try {
      const response = await fetch(
        `${apiData}/transport-planning/orders/${orderId}/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            vehicleId: vehicle.id,
            scheduledDate,
            tripId: trip?.id ?? null,
          }),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося запланувати замовлення.");
      pushToast(trip ? "Замовлення додано до рейсу." : "Рейс створено й замовлення заплановано.", "success");
      await loadBoard();
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setScheduling(false);
      setDraggedOrderId(null);
    }
  };

  const changeMonth = amount => setVisibleMonth(current =>
    new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const goToToday = () => {
    const now = new Date();
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div className="loading-calendar-page">
      <header className="loading-calendar-heading">
        <div>
          <div className="loading-calendar-eyebrow">ПЛАНУВАННЯ ПЕРЕВЕЗЕНЬ</div>
          <h1>Календар завантажень</h1>
          <p>Календар показує лише автопоїзди та призначені їм рейси. Перетягніть замовлення зі списку праворуч на автопоїзд, щоб призначити його.</p>
        </div>
      </header>

      <section className="loading-calendar-stats" aria-label="Підсумок">
        <div><span>Автопоїздів</span><strong>{loading ? "…" : board.vehicles.length}</strong></div>
        <div><span>Замовлень у рейсах</span><strong>{loading ? "…" : scheduledOrderCount}</strong></div>
        <div><span>Доступно для планування</span><strong>{loading ? "…" : availableOrders.length}</strong></div>
      </section>

      <section className="loading-calendar-workspace">
        <main className="loading-calendar-main">
          <div className="loading-calendar-toolbar">
            <div className="loading-calendar-month-control">
              <button type="button" aria-label="Попередній місяць" onClick={() => changeMonth(-1)}>‹</button>
              <h2>{monthLabel}</h2>
              <button type="button" aria-label="Наступний місяць" onClick={() => changeMonth(1)}>›</button>
              <button type="button" className="loading-calendar-today" onClick={goToToday}>Сьогодні</button>
            </div>
            <label className="loading-calendar-client-filter">
              <span>Клієнт</span>
              <select value={clientFilter} onChange={event => setClientFilter(event.target.value)}>
                <option value="">Усі клієнти</option>
                {clients.map(client => <option key={client} value={client}>{client}</option>)}
              </select>
            </label>
          </div>

          <div className="loading-calendar-board-scroll">
            <div
              className="loading-calendar-board"
              style={{ "--calendar-day-count": monthDays.length }}
              role="grid"
              aria-label={`Календар автопоїздів за ${monthLabel}`}
            >
              <div className="loading-calendar-vehicle-heading">Автопоїзд / водій</div>
              {monthDays.map(date => (
                <div className="loading-calendar-date-heading" key={dateKey(date)}>
                  <span>{weekdayLabels[(date.getDay() + 6) % 7]}</span>
                  <strong>{date.getDate()}</strong>
                </div>
              ))}

              {board.vehicles.map(vehicle => (
                <VehicleCalendarRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  dates={monthDays}
                  clientFilter={clientFilter}
                  draggedOrderId={draggedOrderId}
                  onDropOrder={scheduleOrder}
                  onOpenOrder={id => navigate(`/orders/${id}`)}
                  onOpenRequest={id => navigate(`/requests/${id}`)}
                />
              ))}

              {!loading && board.vehicles.length === 0 && (
                <div className="loading-calendar-no-vehicles">
                  Додайте автопоїзди в розділі «Транспорт», щоб планувати рейси.
                </div>
              )}
            </div>
          </div>
          {loading && <div className="loading-calendar-loading" role="status">Оновлюємо календар…</div>}
        </main>

        <aside className="loading-calendar-orders-panel">
          <header>
            <span>ЗАМОВЛЕННЯ ДЛЯ ПЛАНУВАННЯ</span>
            <strong>{availableOrders.length}</strong>
          </header>
          <label className="loading-calendar-order-search">
            <span className="visually-hidden">Пошук замовлень</span>
            <input value={orderSearch} onChange={event => setOrderSearch(event.target.value)} placeholder="Пошук замовлення або клієнта" />
          </label>
          <div className="loading-calendar-available-list">
            {availableOrders.map(order => (
              <article
                className={[
                  "loading-calendar-available-order",
                  draggedOrderId === order.id && "is-dragging",
                ].filter(Boolean).join(" ")}
                key={order.id}
                draggable={!scheduling}
                onDragStart={event => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(order.id));
                  setDraggedOrderId(order.id);
                }}
                onDragEnd={() => setDraggedOrderId(null)}
              >
                <strong>{order.orderNumber} · {order.clientName}</strong>
                <span>{order.loadingCity || "Завантаження"} → {order.deliveryCity || "Доставка"}</span>
                <small>{formatDate(order.loadingDate)} — {formatDate(order.deliveryDate)}</small>
                {order.cargoDescription && <small>{order.cargoDescription}</small>}
                <span className="loading-calendar-drag-hint">Перетягніть на рядок автопоїзда</span>
                <button
                  type="button"
                  className="loading-calendar-open-link"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >Відкрити замовлення</button>
                {order.sourceRequestId && (
                  <button
                    type="button"
                    className="loading-calendar-open-link"
                    onClick={() => navigate(`/requests/${order.sourceRequestId}`)}
                  >Запит #{order.sourceRequestId}</button>
                )}
              </article>
            ))}
            {!loading && availableOrders.length === 0 && (
              <div className="loading-calendar-no-orders">
                <strong>Немає доступних замовлень</strong>
                <span>Створіть замовлення або змініть фільтр клієнта.</span>
              </div>
            )}
          </div>
          <section className="loading-calendar-requests">
            <header>
              <span>ЗАПИТИ ЗА ЦЕЙ МІСЯЦЬ</span>
              <strong>{visibleRequests.length}</strong>
            </header>
            <div className="loading-calendar-available-list">
              {visibleRequests.map(request => (
                <button
                  type="button"
                  className="loading-calendar-request-link"
                  key={request.id}
                  onClick={() => navigate(`/requests/${request.id}`)}
                >
                  <strong>Запит #{request.id} · {request.clientName}</strong>
                  <span>{request.loadingCity} → {request.deliveryCity}</span>
                  <small>{formatDate(request.loadingDate)} — {formatDate(request.deliveryDate)}</small>
                  <small>{request.cargoDescription} · {request.status}</small>
                </button>
              ))}
              {!loading && visibleRequests.length === 0 && (
                <div className="loading-calendar-no-orders">Запитів за цей місяць немає.</div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function VehicleCalendarRow({
  vehicle,
  dates,
  clientFilter,
  draggedOrderId,
  onDropOrder,
  onOpenOrder,
  onOpenRequest,
}) {
  const isUnavailable = vehicle.status === "Неактивний";
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const visibleTrips = vehicle.trips
    .filter(trip => trip.status !== "Скасований" &&
      (!clientFilter || trip.orders.some(order => order.clientName === clientFilter)))
    .map(trip => {
      const orderStarts = trip.orders
        .map(order => parseDate(order.loadingDate || order.deliveryDate))
        .filter(Boolean);
      const orderEnds = trip.orders
        .map(order => parseDate(order.deliveryDate || order.loadingDate))
        .filter(Boolean);
      const start = parseDate(trip.plannedStartAt) ||
        (orderStarts.length ? new Date(Math.min(...orderStarts)) : null);
      const end = parseDate(trip.plannedEndAt) ||
        (orderEnds.length ? new Date(Math.max(...orderEnds)) : null);
      if (!start || !end || end < firstDate || start > lastDate) return null;

      const visibleStart = start < firstDate ? firstDate : start;
      const visibleEnd = end > lastDate ? lastDate : end;
      const startColumn = dates.findIndex(date => dateKey(date) === dateKey(visibleStart)) + 1;
      const endColumn = dates.findIndex(date => dateKey(date) === dateKey(visibleEnd)) + 2;

      return { trip, start, end, startColumn, endColumn };
    })
    .filter(Boolean)
    .sort((first, second) => first.start - second.start);

  const laneEnds = [];
  const tripsWithLanes = visibleTrips.map(item => {
    let lane = laneEnds.findIndex(end => end < item.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = item.end;
    return { ...item, lane };
  });
  const laneCount = Math.max(laneEnds.length, 1);

  return (
    <div className="loading-calendar-vehicle-row" style={{ "--calendar-day-count": dates.length }}>
      <div className={`loading-calendar-vehicle${isUnavailable ? " is-unavailable" : ""}`}>
        <strong>{vehicle.plate}{vehicle.trailerPlate ? ` + ${vehicle.trailerPlate}` : ""}</strong>
        <span>{vehicle.driverName || "Водія не призначено"}</span>
        {isUnavailable && <small>Автопоїзд неактивний</small>}
      </div>
      <div
        className={[
          "loading-calendar-vehicle-timeline",
          draggedOrderId && !isUnavailable && "is-drag-active",
        ].filter(Boolean).join(" ")}
        style={{ "--trip-lane-count": laneCount }}
      >
        {dates.map((date, index) => {
          const key = dateKey(date);
          const isToday = key === dateKey(new Date());
          const dayTrips = tripsWithLanes.filter(item =>
            date >= item.start && date <= item.end);
          return (
            <div
              className={`loading-calendar-timeline-day${isToday ? " is-today" : ""}`}
              style={{ gridColumn: index + 1, gridRow: "1 / -1" }}
              key={`${vehicle.id}-${key}`}
              role="gridcell"
              aria-label={`${vehicle.plate}, ${formatDate(key)}`}
              onDragOver={event => {
                if (!isUnavailable && draggedOrderId && (vehicle.driverId || dayTrips.length > 0)) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={event => {
                event.preventDefault();
                const orderId = Number(event.dataTransfer.getData("text/plain")) || draggedOrderId;
                const targetTripId = Number(event.target.closest("[data-trip-id]")?.dataset.tripId);
                const trip = dayTrips.find(item => item.trip.id === targetTripId)?.trip;
                if (!isUnavailable && orderId && (trip || vehicle.driverId)) {
                  onDropOrder(orderId, vehicle, date, trip || null);
                }
              }}
            />
          );
        })}
        {tripsWithLanes.map(({ trip, startColumn, endColumn, lane }) => (
          <div
            className="loading-calendar-trip-container"
            data-trip-id={trip.id}
            style={{ gridColumn: `${startColumn} / ${endColumn}`, gridRow: lane + 1 }}
            key={trip.id}
            onDragOver={event => {
              if (!isUnavailable && draggedOrderId) event.preventDefault();
            }}
            onDrop={event => {
              event.preventDefault();
              event.stopPropagation();
              const orderId = Number(event.dataTransfer.getData("text/plain")) || draggedOrderId;
              if (!isUnavailable && orderId) onDropOrder(orderId, vehicle, firstDate, trip);
            }}
          >
            <button
              type="button"
              className="loading-calendar-trip"
              aria-label={`${trip.title}, відкрити замовлення`}
              title={`${trip.title} · ${trip.driverName}`}
              onClick={() => {
                if (!isUnavailable && trip.orders[0]) onOpenOrder(trip.orders[0].id);
              }}
            >
              <strong>{trip.title}</strong>
              <span>{trip.orders.map(order => order.orderNumber).join(", ")}</span>
            </button>
            {trip.orders.map(order => (
              <div className="loading-calendar-trip-links" key={order.id}>
                <button type="button" onClick={event => {
                  event.stopPropagation();
                  onOpenOrder(order.id);
                }}>{order.orderNumber}</button>
                {order.sourceRequestId && (
                  <button type="button" onClick={event => {
                    event.stopPropagation();
                    onOpenRequest(order.sourceRequestId);
                  }}>Запит #{order.sourceRequestId}</button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(value) {
  const date = typeof value === "string" ? parseDate(value) : value;
  if (!date) return "Дати не вказані";
  return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export default LoadingCalendarPage;
