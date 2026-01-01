import { useEffect, useState } from "react";
import { addBusinessDays, addDays, differenceInCalendarDays, parse } from "date-fns";

const API_BASE_URL = "https://localhost:7060";

// Фірмові кольори Nova Poshta
const NP_BLUE = "#0066CC";
const NP_BLUE_DARK = "#0055AA";
const NP_BLUE_LIGHT = "#E6F0FF";

// Форматування дати для таблиці
// Форматування для таблиці
const formatDate = (value) => {
  if (!value) return "—";

  let date;
  if (value instanceof Date) {
    date = value;
  } else {
    const parts = value.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (parts) {
      const [, day, month, year] = parts;
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(value);
      if (isNaN(date)) return "—";
    }
  }

  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Обчислення крайнього терміну
const calculateDueDate = (startDate, daysType, daysCount) => {
  if (!startDate || daysCount <= 0) return null;

  // Парсимо startDate
  let baseDate;
  if (startDate instanceof Date) {
    baseDate = new Date(startDate);
  } else {
    // Спроба DD.MM.YYYY HH:mm(:ss)
    const parts = startDate.match(/(\d{2})\.(\d{2})\.(\d{4})[, ] (\d{2}):(\d{2}):?(\d{0,2})?/);
    if (parts) {
      const [, day, month, year, hour, minute, second] = parts;
      baseDate = new Date(year, month - 1, day, hour, minute, second || 0);
    } else {
      baseDate = new Date(startDate);
    }
  }

  if (isNaN(baseDate)) return null;

  const result =
    daysType === "business"
      ? addBusinessDays(baseDate, daysCount)
      : addDays(baseDate, daysCount);

  // Ставимо кінець дня
  result.setHours(23, 59, 59, 999);

  return result.toISOString(); // ISO для БД
};




// Парсинг дати НП з формату "dd.MM.yyyy HH:mm:ss"
const parseDeliveryDate = (str) => {
  if (!str) return null;
  const parsed = parse(str, "dd.MM.yyyy HH:mm:ss", new Date());
  return isNaN(parsed) ? null : parsed;
};

export default function NovaPoshtaTrackingWithPayment({ companyId }) {
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTTN, setNewTTN] = useState("");
  const [changes, setChanges] = useState({});

  // Пагінація
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  const loadTrackings = async (page = currentPage) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/Tracking/company/${companyId}?page=${page}&pageSize=${itemsPerPage}&sortOrder=desc`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const items = Array.isArray(data)
        ? data
        : data.Items || data.items || [];

      setTrackings(items);
      setCurrentPage(data.currentPage || data.CurrentPage || page);
      setTotalPages(
        data.totalPages ||
        data.TotalPages ||
        Math.ceil(items.length / itemsPerPage) ||
        1
      );
    } catch (error) {
      console.error("Помилка завантаження:", error);
      setTrackings([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshNPData = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/Tracking/refresh-np/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      await loadTrackings(currentPage);
      alert(
        `✅ Оновлено дані з Нової Пошти для ${data.count || data.countUpdated || 0} відправлень`
      );
    } catch (error) {
      console.error("Помилка оновлення НП:", error);
      alert("Не вдалося оновити дані з Нової Пошти: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackings();
  }, [companyId]);

  const addTracking = async (e) => {
    e.preventDefault();
    if (!newTTN.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/Tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TTN: newTTN.trim(), IdCompany: companyId }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setNewTTN("");
      loadTrackings(1);
    } catch (error) {
      alert("Помилка додавання ТТН: " + error.message);
    }
  };

  const parseDeliveryDate = (value) => {
    if (!value) return null;

    // Очікуємо формат "DD.MM.YYYY HH:mm"
    const parts = value.match(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/);
    if (!parts) return null;

    const [, day, month, year, hour, minute] = parts;
    return new Date(year, Number(month) - 1, day, hour, minute);
  };


// Обчислення крайнього терміну без годин
const calculateDueDate = (startDate, daysType, daysCount) => {
  if (!startDate || daysCount <= 0) return null;

  let baseDate;
  const parts = startDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (parts) {
    const [, day, month, year] = parts;
    baseDate = new Date(year, month - 1, day);
  } else {
    baseDate = new Date(startDate);
  }

  if (isNaN(baseDate)) return null;

  let result =
    daysType === "business"
      ? addBusinessDays(baseDate, daysCount)
      : addDays(baseDate, daysCount);

  // Ставимо початок дня (00:00)
  result.setHours(0, 0, 0, 0);

  return result.toISOString().split("T")[0]; // Тільки дата YYYY-MM-DD для БД
};




  const updateTracking = (id, key, value) => {
    setTrackings((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const updated = { ...t, [key]: value };

        if (key === "daysType" || key === "daysCount") {
          const daysType = key === "daysType" ? value : updated.daysType ?? "calendar";
          const daysCount =
            key === "daysCount" ? Number(value) || 0 : Number(updated.daysCount) || 0;
          console.log(t)
          const deliveryDate = t.deliveryDate;

          if (deliveryDate && daysCount > 0) {
            const dueDate = calculateDueDate(deliveryDate, daysType, daysCount);
            updated.paymentDueDate = dueDate;

            if (dueDate) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const due = new Date(dueDate);
              due.setHours(0, 0, 0, 0);

              const diff = differenceInCalendarDays(today, due);
              updated.overdueDays = diff > 0 ? diff : 0;
            } else {
              updated.overdueDays = null;
            }
          } else {
            updated.paymentDueDate = null;
            updated.overdueDays = null;
          }
        }

        return updated;
      })
    );

    setChanges((prev) => ({ ...prev, [id]: true }));
  };
  const formatForDB = (date) => {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    const pad = (n) => (n < 10 ? "0" + n : n);
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes()) +
      ":" +
      pad(d.getSeconds())
    );
  };

  const saveAllChanges = async () => {
    const changed = trackings.filter((t) => changes[t.id]);
    if (!changed.length) {
      alert("Немає змін для збереження");
      return;
    }

    setSaving(true);
    try {
      const updates = changed.map((t) => ({
        id: t.id,
        daysType: t.daysType || "calendar",
        daysCount: t.daysCount || 0,
        paymentDueDate: t.paymentDueDate ? new Date(t.paymentDueDate).toISOString() : null, // правильний ISO
        overdueDays: t.overdueDays,
        amount: t.amount || null,
        invoiceNumber: t.invoiceNumber || "",
        payer: t.payer || "",
        vehicle: t.vehicle || "",
        route: t.route || "",
        paymentMark: !!t.paymentMark,
      }));




      const res = await fetch(`${API_BASE_URL}/api/Tracking/payment/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error(await res.text());

      alert(`✅ Збережено ${updates.length} записів`);
      setChanges({});
      loadTrackings(currentPage);
    } catch (error) {
      alert("Помилка збереження: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Шапка */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 style={{ color: NP_BLUE_DARK, fontWeight: 700 }}>
            🚚 Контроль ТТН та оплат
          </h3>
          <small className="text-muted">Nova Poshta • Терміни оплати</small>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            style={{ borderColor: NP_BLUE, color: NP_BLUE }}
            onClick={refreshNPData}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Оновлення...
              </>
            ) : (
              "🔄 Оновити дані НП"
            )}
          </button>

          <button
            className="btn"
            style={{ backgroundColor: NP_BLUE, borderColor: NP_BLUE, color: "white" }}
            onClick={saveAllChanges}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Збереження...
              </>
            ) : (
              `💾 Зберегти ${hasChanges ? `(${Object.keys(changes).length})` : ""}`
            )}
          </button>
        </div>
      </div>

      {/* Форма додавання */}
      <div className="card border-0 shadow mb-4">
        <div className="card-body">
          <h5 style={{ color: NP_BLUE_DARK }}>Додати нове відправлення</h5>
          <form onSubmit={addTracking} className="row g-3">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Номер ТТН (наприклад: 2040000012345678)"
                value={newTTN}
                onChange={(e) => setNewTTN(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <button
                type="submit"
                className="btn btn-primary w-100 btn-lg"
                style={{ backgroundColor: NP_BLUE, borderColor: NP_BLUE }}
                disabled={loading}
              >
                ➕ Додати
              </button>
            </div>
          </form>
        </div>
      </div>

      {hasChanges && (
        <div className="alert alert-warning mb-4 d-flex align-items-center gap-2">
          <strong>⚠️</strong>
          <span>Є незбережені зміни ({Object.keys(changes).length})</span>
        </div>
      )}

      {/* Таблиця */}
      <div className="card border-0 shadow">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead style={{ backgroundColor: NP_BLUE, color: "white" }}>
                <tr>
                  <th className="ps-3">ID</th>
                  <th>ТТН</th>
                  <th>Статус</th>
                  <th>Дата отримання</th>
                  <th>Отримувач</th>
                  <th>Тип днів</th>
                  <th>Кількість</th>
                  <th>Крайній термін</th>
                  <th>Протермінування</th>
                  <th>Сума, грн</th>
                  <th>№ рахунку</th>
                  <th>Платник</th>
                  <th>ТЗ</th>
                  <th>Маршрут</th>
                  <th className="text-center">Оплата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && !trackings.length ? (
                  <tr>
                    <td colSpan={16} className="text-center py-5">
                      <div className="spinner-border text-primary" />
                      <p className="mt-2">Завантаження...</p>
                    </td>
                  </tr>
                ) : trackings.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="text-center py-5 text-muted">
                      📦 Немає відправлень
                    </td>
                  </tr>
                ) : (
                  trackings.map((t) => {
                    const isChanged = changes[t.id];
                    return (
                      <tr key={t.id} className={isChanged ? "table-warning" : ""}>
                        <td className="ps-3">
                          <span className="badge bg-secondary">{t.id}</span>
                        </td>
                        <td className="font-monospace fw-bold">{t.number || t.TTN}</td>
                        <td>
                          <span
                            className={`badge ${t.status?.includes("Доставлено")
                              ? "bg-success"
                              : t.status?.includes("В дорозі")
                                ? "bg-warning"
                                : "bg-secondary"
                              }`}
                          >
                            {t.status || "—"}
                          </span>
                        </td>
                        <td>{formatDate(parseDeliveryDate(t.deliveryDate))}</td>
                        <td>{t.recipientFullName || "—"}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={t.daysType || "calendar"}
                            onChange={(e) => updateTracking(t.id, "daysType", e.target.value)}
                          >
                            <option value="calendar">Календарні</option>
                            <option value="business">Робочі(Банківські)</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ width: "80px" }}
                            value={t.daysCount ?? 10}
                            onChange={(e) => updateTracking(t.id, "daysCount", e.target.value)}
                            min="1"
                          />
                        </td>
                        <td>{t.paymentDueDate ? formatDate(t.paymentDueDate) : "—"}</td>
                        <td>
                          {t.overdueDays ? <span className="badge bg-danger">{t.overdueDays} дн</span> : "—"}
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={t.amount ?? ""}
                            onChange={(e) => updateTracking(t.id, "amount", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={t.invoiceNumber ?? ""}
                            onChange={(e) => updateTracking(t.id, "invoiceNumber", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={t.payer ?? ""}
                            onChange={(e) => updateTracking(t.id, "payer", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={t.vehicle ?? ""}
                            onChange={(e) => updateTracking(t.id, "vehicle", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={t.route ?? ""}
                            onChange={(e) => updateTracking(t.id, "route", e.target.value)}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={!!t.paymentMark}
                            onChange={(e) => updateTracking(t.id, "paymentMark", e.target.checked)}
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              if (!window.confirm(`Видалити ТТН ${t.number || t.TTN}?`)) return;
                              try {
                                const res = await fetch(`${API_BASE_URL}/api/Tracking/${t.id}`, {
                                  method: "DELETE",
                                });
                                if (!res.ok) throw new Error("Помилка видалення");
                                loadTrackings(currentPage);
                              } catch (err) {
                                alert("Помилка видалення: " + err.message);
                              }
                            }}
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
