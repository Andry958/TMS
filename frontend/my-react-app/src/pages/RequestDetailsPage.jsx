import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useToast } from "../context/useToast";
import "../styles/requests.css";

const statusLabels = {
  New: "Новий",
  InProgress: "В роботі",
  Confirmed: "Підтверджено",
  Rejected: "Відхилено",
  Ordered: "Перенесено в замовлення",
};

function RequestDetailsPage() {
  const { requestId } = useParams();
  const { apiData } = useApi();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadRequest = async () => {
      try {
        const response = await fetch(`${apiData}/requests/${requestId}`, { credentials: "include" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || `Не вдалося завантажити запит (HTTP ${response.status}).`);
        if (!cancelled) setRequest(result);
      } catch (error) {
        if (!cancelled) pushToast(error.message, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadRequest();
    return () => { cancelled = true; };
  }, [apiData, pushToast, requestId]);

  return (
    <main className="request-details-page">
      <button type="button" className="requests-secondary-button" onClick={() => navigate("/requests")}>
        ← До запитів
      </button>
      {loading ? (
        <p className="request-details-message" role="status">Завантаження запиту…</p>
      ) : request ? (
        <section className="request-details-card">
          <header>
            <div>
              <span>ЗАПИТ НА ПЕРЕВЕЗЕННЯ</span>
              <h1>Запит #{request.id}</h1>
            </div>
            <span className={`requests-status requests-status--${request.status.toLowerCase()}`}>
              {statusLabels[request.status] || request.status}
            </span>
          </header>
          <div className="request-details-grid">
            <Detail label="Клієнт" value={request.clientName} />
            <Detail label="Створено" value={formatDate(request.createdAt)} />
            <Detail label="Маршрут" value={`${request.loadingCity} → ${request.deliveryCity}`} />
            <Detail label="Адреса завантаження" value={request.loadingAddress} />
            <Detail label="Дата завантаження" value={formatDate(request.loadingDate)} />
            <Detail label="Адреса доставки" value={request.deliveryAddress} />
            <Detail label="Дата доставки" value={formatDate(request.deliveryDate)} />
            <Detail label="Вантаж" value={request.cargoDescription} />
            <Detail label="Вага, т" value={request.weightTons} />
            <Detail label="Ставка" value={request.rate == null ? null : `${formatMoney(request.rate)} ${request.currency}`} />
            <Detail label="Коментар" value={request.comment} />
          </div>
        </section>
      ) : (
        <p className="request-details-message">Запит не знайдено або він недоступний.</p>
      )}
    </main>
  );
}

function Detail({ label, value }) {
  return <div><span>{label}</span><strong>{value || "—"}</strong></div>;
}

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(year, month - 1, day));
}

function formatMoney(value) {
  return new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 2 }).format(value);
}

export default RequestDetailsPage;
