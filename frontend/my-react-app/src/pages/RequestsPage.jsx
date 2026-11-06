import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useToast } from "../context/useToast";
import QuickClientModal from "../components/client/QuickClientModal";
import "../styles/requests.css";

const statusLabels = {
  New: "Новий",
  InProgress: "В роботі",
  Confirmed: "Підтверджено",
  Rejected: "Відхилено",
  Ordered: "Перенесено в замовлення",
};

const initialFilters = {
  clientId: "",
  city: "",
  loadingFrom: "",
  loadingTo: "",
  status: "",
};

const today = new Date().toISOString().slice(0, 10);
const initialForm = {
  clientCompanyId: "",
  loadingCity: "",
  loadingAddress: "",
  loadingDate: today,
  deliveryCity: "",
  deliveryAddress: "",
  deliveryDate: today,
  cargoDescription: "",
  weightTons: "",
  rate: "",
  currency: "UAH",
  comment: "",
};

function RequestsPage() {
  const navigate = useNavigate();
  const { apiData } = useApi();
  const { pushToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [filters, setFilters] = useState(initialFilters);
  const [visibleFilters, setVisibleFilters] = useState({
    client: true,
    route: true,
    date: true,
    status: true,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("archived", String(activeTab === "archive"));
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [activeTab, filters]);

  const loadRequests = useCallback(async (query = queryString) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiData}/requests?${query}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setRequests(await response.json());
    } catch (error) {
      console.error("Помилка завантаження запитів:", error);
      pushToast("Не вдалося завантажити запити.", "error");
    } finally {
      setLoading(false);
    }
  }, [apiData, pushToast, queryString]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const loadClients = useCallback(async () => {
    const response = await fetch(`${apiData}/client`, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    setClients(await response.json());
  }, [apiData]);

  useEffect(() => {
    loadClients().catch((error) => {
      console.error("Помилка завантаження клієнтів для запитів:", error);
      pushToast("Не вдалося завантажити список клієнтів.", "error");
    });
  }, [loadClients, pushToast]);

  const setFormField = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const handleClientCreated = (created) => {
    setClients(current => [...current, created]);
    setForm(current => ({ ...current, clientCompanyId: String(created.id) }));
    setIsClientFormOpen(false);
    pushToast("Клієнта створено і додано до запиту.", "success");
  };

  const createRequest = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`${apiData}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          clientCompanyId: Number(form.clientCompanyId),
          weightTons: form.weightTons ? Number(form.weightTons) : null,
          rate: form.rate ? Number(form.rate) : null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося створити запит.");
      setForm(initialForm);
      setIsFormOpen(false);
      setActiveTab("active");
      setFilters(initialFilters);
      pushToast("Запит створено.", "success");
      await loadRequests("archived=false");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (requestId, status) => {
    try {
      const response = await fetch(`${apiData}/requests/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося оновити статус.");
      pushToast("Статус запиту оновлено.", "success");
      await loadRequests();
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const undoStatus = async requestId => {
    try {
      const response = await fetch(`${apiData}/requests/${requestId}/status/undo`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося повернути попередній статус.");
      pushToast("Повернуто попередній статус запиту.", "success");
      await loadRequests();
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const deleteRequest = async request => {
    if (!window.confirm(`Видалити запит #${request.id}? Цю дію не можна скасувати.`)) return;
    setDeletingRequestId(request.id);
    try {
      const response = await fetch(`${apiData}/requests/${request.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося видалити запит.");
      pushToast("Запит видалено.", "success");
      await loadRequests();
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setDeletingRequestId(null);
    }
  };

  const toggleFilter = (name) => {
    setVisibleFilters(current => ({ ...current, [name]: !current[name] }));
  };

  const clearFilters = () => setFilters(initialFilters);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="requests-page">
      <header className="requests-heading">
        <div>
          <div className="requests-eyebrow">РОБОЧИЙ ПРОСТІР</div>
          <h1>Запити</h1>
          <p>Керуйте запитами на перевезення — від першого звернення до замовлення.</p>
        </div>
        <button
          className="requests-primary-button"
          type="button"
          onClick={() => setIsFormOpen(true)}
        >
          <span aria-hidden="true">＋</span> Створити запит
        </button>
      </header>

      <section className="requests-workspace">
        <div className="requests-tabs" role="tablist" aria-label="Стан запитів">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "active"}
            className={activeTab === "active" ? "is-active" : ""}
            onClick={() => {
              setActiveTab("active");
              setFilters(current => ({ ...current, status: "" }));
            }}
          >
            Активні
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "archive"}
            className={activeTab === "archive" ? "is-active" : ""}
            onClick={() => {
              setActiveTab("archive");
              setFilters(current => ({ ...current, status: "" }));
            }}
          >
            Архівні
          </button>
          <span className="requests-tabs__count">{requests.length}</span>
        </div>

        <section className="requests-filter-panel" aria-label="Фільтри запитів">
          <div className="requests-filter-panel__heading">
            <div>
              <strong>Фільтри</strong>
              <span>Звузьте список за клієнтом, маршрутом або датою</span>
            </div>
            <button type="button" className="requests-clear-button" onClick={clearFilters} disabled={!hasFilters}>
              Очистити
            </button>
          </div>
          <div className="requests-filter-groups">
            <FilterGroup title="Клієнт" open={visibleFilters.client} onToggle={() => toggleFilter("client")}>
              <label>
                <span>Клієнт</span>
                <select
                  value={filters.clientId}
                  onChange={event => setFilters(current => ({ ...current, clientId: event.target.value }))}
                >
                  <option value="">Усі клієнти</option>
                  {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </label>
            </FilterGroup>
            <FilterGroup title="Напрямок" open={visibleFilters.route} onToggle={() => toggleFilter("route")}>
              <label>
                <span>Місто завантаження або доставки</span>
                <input
                  value={filters.city}
                  onChange={event => setFilters(current => ({ ...current, city: event.target.value }))}
                  placeholder="Наприклад, Київ"
                />
              </label>
            </FilterGroup>
            <FilterGroup title="Дата завантаження" open={visibleFilters.date} onToggle={() => toggleFilter("date")}>
              <div className="requests-filter-date">
                <label><span>Від</span><input type="date" value={filters.loadingFrom} onChange={event => setFilters(current => ({ ...current, loadingFrom: event.target.value }))} /></label>
                <label><span>До</span><input type="date" value={filters.loadingTo} onChange={event => setFilters(current => ({ ...current, loadingTo: event.target.value }))} /></label>
              </div>
            </FilterGroup>
            <FilterGroup title="Статус" open={visibleFilters.status} onToggle={() => toggleFilter("status")}>
              <label>
                <span>Статус запиту</span>
                <select
                  value={filters.status}
                  onChange={event => setFilters(current => ({ ...current, status: event.target.value }))}
                >
                  <option value="">Усі статуси</option>
                  {(activeTab === "active" ? ["New", "InProgress", "Confirmed"] : ["Rejected", "Ordered"]).map(status => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </label>
            </FilterGroup>
          </div>
        </section>

        <div className="requests-list-heading">
          <div>
            <h2>{activeTab === "active" ? "Активні запити" : "Архів запитів"}</h2>
            <span>{activeTab === "active" ? "Нові звернення та запити в роботі" : "Відхилені або перенесені в замовлення"}</span>
          </div>
          {hasFilters && <span className="requests-filter-indicator">Фільтри застосовано</span>}
        </div>

        <div className="requests-table-wrap">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Запит</th>
                <th>Клієнт</th>
                <th>Маршрут</th>
                <th>Завантаження</th>
                <th>Вантаж</th>
                <th>Ставка</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="requests-table__message">
                  <span className="requests-spinner" /> Завантаження запитів…
                </td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="8" className="requests-table__message">
                  <span className="requests-empty-icon" aria-hidden="true">⌕</span>
                  <strong>{hasFilters ? "За цими фільтрами запитів не знайдено" : activeTab === "active" ? "Активних запитів поки немає" : "Архів поки порожній"}</strong>
                  <span>{hasFilters ? "Спробуйте змінити параметри або очистити фільтри." : "Створені запити з’являтимуться тут."}</span>
                </td></tr>
              ) : requests.map(request => (
                <tr key={request.id}>
                  <td>
                    <button type="button" className="requests-open-link" onClick={() => navigate(`/requests/${request.id}`)}>
                      #{request.id}
                    </button>
                    <small>{formatDate(request.createdAt)}</small>
                  </td>
                  <td className="requests-table__client">{request.clientName}</td>
                  <td><span className="requests-route">{request.loadingCity}<span aria-hidden="true"> → </span>{request.deliveryCity}</span></td>
                  <td>{formatDate(request.loadingDate)}<small>доставка: {formatDate(request.deliveryDate)}</small></td>
                  <td>{request.cargoDescription}<small>{request.weightTons ? `${request.weightTons} т` : "Вага не вказана"}</small></td>
                  <td>{request.rate ? `${formatMoney(request.rate)} ${request.currency}` : "—"}</td>
                  <td><span className={`requests-status requests-status--${request.status.toLowerCase()}`}>{statusLabels[request.status] || request.status}</span></td>
                  <td><RequestActions
                    request={request}
                    onChangeStatus={updateStatus}
                    onUndoStatus={undoStatus}
                    onDelete={deleteRequest}
                    deleting={deletingRequestId === request.id}
                    onCreateOrder={item => navigate("/orders/new", { state: { sourceRequest: item } })}
                    archived={activeTab === "archive"}
                  />{request.comment && <span className="requests-comment" title={request.comment}>Коментар</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <div className="requests-modal-backdrop" role="presentation" onMouseDown={event => {
          if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false);
        }}>
          <section className="requests-modal" role="dialog" aria-modal="true" aria-labelledby="requests-modal-title">
            <header className="requests-modal__heading">
              <div><span>НОВА ЗАЯВКА</span><h2 id="requests-modal-title">Створити запит</h2></div>
              <button type="button" aria-label="Закрити" onClick={() => setIsFormOpen(false)} disabled={isSaving}>×</button>
            </header>
            <form onSubmit={createRequest}>
              <div className="requests-form-grid">
                <label className="requests-form-grid__wide">
                  <span>Клієнт <b>*</b></span>
                  <div className="requests-client-select">
                    <select name="clientCompanyId" value={form.clientCompanyId} onChange={setFormField} required>
                      <option value="">Оберіть клієнта</option>
                      {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setIsClientFormOpen(true)}>＋ Новий клієнт</button>
                  </div>
                </label>
                <div className="requests-form-grid__wide requests-form-section">Маршрут і дати</div>
                <label><span>Місто завантаження <b>*</b></span><input name="loadingCity" value={form.loadingCity} onChange={setFormField} maxLength="160" required /></label>
                <label><span>Адреса завантаження</span><input name="loadingAddress" value={form.loadingAddress} onChange={setFormField} maxLength="300" /></label>
                <label><span>Дата завантаження <b>*</b></span><input name="loadingDate" type="date" value={form.loadingDate} onChange={setFormField} required /></label>
                <label><span>Місто доставки <b>*</b></span><input name="deliveryCity" value={form.deliveryCity} onChange={setFormField} maxLength="160" required /></label>
                <label><span>Адреса доставки</span><input name="deliveryAddress" value={form.deliveryAddress} onChange={setFormField} maxLength="300" /></label>
                <label><span>Дата доставки <b>*</b></span><input name="deliveryDate" type="date" value={form.deliveryDate} onChange={setFormField} min={form.loadingDate} required /></label>
                <div className="requests-form-grid__wide requests-form-section">Вантаж і вартість</div>
                <label className="requests-form-grid__wide"><span>Опис вантажу <b>*</b></span><input name="cargoDescription" value={form.cargoDescription} onChange={setFormField} maxLength="500" required /></label>
                <label><span>Вага, т</span><input name="weightTons" type="number" min="0.001" step="0.001" value={form.weightTons} onChange={setFormField} /></label>
                <label><span>Ставка</span><input name="rate" type="number" min="0.01" step="0.01" value={form.rate} onChange={setFormField} /></label>
                <label><span>Валюта</span><select name="currency" value={form.currency} onChange={setFormField}>{["UAH", "USD", "EUR", "PLN", "GBP"].map(currency => <option key={currency}>{currency}</option>)}</select></label>
                <label className="requests-form-grid__wide"><span>Коментар</span><textarea name="comment" value={form.comment} onChange={setFormField} maxLength="2000" rows="3" /></label>
              </div>
              <footer className="requests-modal__footer">
                <button type="button" className="requests-secondary-button" onClick={() => setIsFormOpen(false)} disabled={isSaving}>Скасувати</button>
                <button type="submit" className="requests-primary-button" disabled={isSaving}>{isSaving ? "Збереження…" : "Створити запит"}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
      {isClientFormOpen && (
        <QuickClientModal
          apiUrl={apiData}
          onClose={() => setIsClientFormOpen(false)}
          onCreated={handleClientCreated}
        />
      )}
    </div>
  );
}

function FilterGroup({ title, open, onToggle, children }) {
  return (
    <section className={`requests-filter-group${open ? " is-open" : ""}`}>
      <button type="button" className="requests-filter-group__toggle" aria-expanded={open} onClick={onToggle}>
        <span>{title}</span><span className="requests-filter-group__chevron" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="requests-filter-group__body">{children}</div>}
    </section>
  );
}

function RequestActions({ request, onChangeStatus, onUndoStatus, onDelete, deleting, onCreateOrder, archived }) {
  const deleteButton = (
    <button
      type="button"
      className="requests-actions__delete"
      disabled={deleting}
      onClick={() => onDelete(request)}
    >{deleting ? "Видалення…" : "Видалити"}</button>
  );
  if (archived) {
    return <div className="requests-actions">
      {request.previousStatus && <button type="button" onClick={() => onUndoStatus(request.id)}>
        ← Повернути: {statusLabels[request.previousStatus] || request.previousStatus}
      </button>}
      {deleteButton}
    </div>;
  }
  const undoButton = request.previousStatus && (
    <button type="button" onClick={() => onUndoStatus(request.id)}>
      ← Повернути: {statusLabels[request.previousStatus] || request.previousStatus}
    </button>
  );
  if (request.status === "New") {
    return <div className="requests-actions">
      <button type="button" onClick={() => onChangeStatus(request.id, "InProgress")}>В роботу</button>
      <button type="button" className="requests-actions__reject" onClick={() => onChangeStatus(request.id, "Rejected")}>Відхилити</button>
      {undoButton}
      {deleteButton}
    </div>;
  }
  if (request.status === "InProgress") {
    return <div className="requests-actions">
      <button type="button" onClick={() => onChangeStatus(request.id, "Confirmed")}>Підтвердити</button>
      <button type="button" className="requests-actions__reject" onClick={() => onChangeStatus(request.id, "Rejected")}>Відхилити</button>
      {undoButton}
      {deleteButton}
    </div>;
  }
  return <div className="requests-actions">
    <button type="button" onClick={() => onCreateOrder(request)}>У замовлення</button>
    <button type="button" className="requests-actions__reject" onClick={() => onChangeStatus(request.id, "Rejected")}>Відхилити</button>
    {undoButton}
    {deleteButton}
  </div>;
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

export default RequestsPage;
