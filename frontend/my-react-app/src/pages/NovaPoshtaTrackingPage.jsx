import { useEffect, useState, useMemo } from "react";
import TrackingFilters from "../components/novaposhta/TrackingFilters";
import TrackingPagination from "../components/novaposhta/TrackingPagination";
import TrackingTableRow from "../components/novaposhta/TrackingTableRow";
import AddTrackingForm from "../components/novaposhta/AddTrackingForm";
import { calculateDueDate, differenceInCalendarDays } from "../utils/dateUtils";
import { useToast } from "../context/ToastContext";
import { useApi } from "../context/ApiContext";

const NP_BLUE = "#0066CC";
const NP_BLUE_DARK = "#0055AA";

function NovaPoshtaTrackingWithPayment({ companyId = 1 }) {
  const { apiData } = useApi();
  const API_BASE_URL = apiData;
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRows, setEditingRows] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;
  const { pushToast } = useToast();

  // Фільтри
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTTN, setSearchTTN] = useState("");
  const [filterOverdue, setFilterOverdue] = useState("");
  const [filterPaid, setFilterPaid] = useState("");

  // ====================== LOAD TRACKINGS ======================
  const loadTrackings = async (page = 1) => {
    if (!companyId) return;
    setLoading(true);

    try {
      const url = `${API_BASE_URL}/Tracking/company/${companyId}?page=${page}&pageSize=${itemsPerPage}&sortOrder=${sortOrder}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const items = Array.isArray(data) ? data : data.Items || data.items || [];

      setTrackings(items);
      setCurrentPage(data.currentPage || data.CurrentPage || page);
      setTotalPages(data.totalPages || data.TotalPages || 1);
      setTotalItems(data.totalItems || data.TotalItems || items.length);
    } catch (error) {
      console.error("Помилка завантаження:", error);
      setTrackings([]);
    } finally {
      setLoading(false);
    }
  };

  // Фільтрація на клієнті (для розширеної фільтрації)
  const filteredTrackings = useMemo(() => {
    let result = [...trackings];

    // Фільтр по статусу
    if (filterStatus) {
      result = result.filter((t) => t.status?.includes(filterStatus));
    }

    // Пошук по ТТН
    if (searchTTN) {
      result = result.filter((t) =>
        (t.number || t.TTN || "").toLowerCase().includes(searchTTN.toLowerCase())
      );
    }

    // Фільтр протермінування
    if (filterOverdue === "overdue") {
      result = result.filter((t) => t.overdueDays > 0);
    } else if (filterOverdue === "notOverdue") {
      result = result.filter((t) => !t.overdueDays || t.overdueDays === 0);
    }

    // Фільтр оплати
    if (filterPaid === "paid") {
      result = result.filter((t) => t.paymentMark === true);
    } else if (filterPaid === "unpaid") {
      result = result.filter((t) => !t.paymentMark);
    }

    const sorted = [...result].sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;

      const getDate = (val) => {
        const d = new Date(val);
        return Number.isNaN(d.getTime()) ? null : d.getTime();
      };

      switch (sortField) {
        case "paymentDueDate": {
          const av = getDate(a.paymentDueDate) ?? 0;
          const bv = getDate(b.paymentDueDate) ?? 0;
          return (av - bv) * dir;
        }
        case "overdueDays": {
          const av = Number(a.overdueDays) || 0;
          const bv = Number(b.overdueDays) || 0;
          return (av - bv) * dir;
        }
        case "payer": {
          const av = (a.payer || "").toLowerCase();
          const bv = (b.payer || "").toLowerCase();
          return av.localeCompare(bv) * dir;
        }
        case "amount": {
          const av = Number(a.amount) || 0;
          const bv = Number(b.amount) || 0;
          return (av - bv) * dir;
        }
        case "id":
        default: {
          const av = Number(a.id) || 0;
          const bv = Number(b.id) || 0;
          return (av - bv) * dir;
        }
      }
    });

    return sorted;
  }, [trackings, filterStatus, searchTTN, filterOverdue, filterPaid, sortField, sortOrder]);

  useEffect(() => {
    loadTrackings(1);
  }, [companyId, sortOrder]);

  // ====================== REFRESH NP DATA ======================
  const refreshNPData = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Tracking/refresh-np/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      await loadTrackings(currentPage);
      pushToast(`Оновлено дані з Нової Пошти для ${data.count || 0} відправлень`, "success");
    } catch (error) {
      console.error("Помилка оновлення НП:", error);
      pushToast("Не вдалося оновити дані з Нової Пошти: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ====================== ADD TRACKING ======================
  const addTracking = async (ttn) => {
    if (!ttn) return;

    try {
      const res = await fetch(`${API_BASE_URL}/Tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TTN: ttn, IdCompany: companyId }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      pushToast("ТТН успішно додано!", "success");
      loadTrackings(1);
    } catch (error) {
      pushToast("Помилка додавання ТТН: " + error.message, "error");
    }
  };

  // ====================== DELETE TRACKING ======================
  const deleteTracking = async (tracking) => {
    if (!window.confirm(`Видалити ТТН ${tracking.number || tracking.TTN}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/Tracking/${tracking.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Помилка видалення");
      pushToast("ТТН видалено", "success");
      loadTrackings(currentPage);
    } catch (err) {
      pushToast("Помилка видалення: " + err.message, "error");
    }
  };

  // ====================== EDITING ROWS ======================
  const toggleEdit = (id) => {
    setEditingRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateTracking = (id, key, value) => {
    setTrackings((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const updated = { ...t, [key]: value };

        if (key === "daysType" || key === "daysCount") {
          const daysType = key === "daysType" ? value : updated.daysType ?? "calendar";
          const daysCount = key === "daysCount" ? Number(value) || 0 : Number(updated.daysCount) || 0;

          const deliveryDate = t.deliveryDate;
          if (deliveryDate && daysCount > 0) {
            const dueDate = calculateDueDate(deliveryDate, daysType, daysCount);
            updated.paymentDueDate = dueDate;

            if (dueDate) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const diff = differenceInCalendarDays(today, dueDate);
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
  };

  // ====================== SAVE CHANGES ======================
  const saveChanges = async (tracking) => {
    try {
      const update = {
        id: tracking.id,
        daysType: tracking.daysType || "calendar",
        daysCount: tracking.daysCount || 0,
        paymentDueDate: tracking.paymentDueDate ? new Date(tracking.paymentDueDate).toISOString() : null,
        overdueDays: tracking.overdueDays,
        amount: tracking.amount || null,
        invoiceNumber: tracking.invoiceNumber || "",
        payer: tracking.payer || "",
        vehicle: tracking.vehicle || "",
        route: tracking.route || "",
        paymentMark: !!tracking.paymentMark,
      };

      const res = await fetch(`${API_BASE_URL}/Tracking/payment/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([update]),
      });

      if (!res.ok) throw new Error(await res.text());

      pushToast(`Збережено запис ID: ${tracking.id}`, "success");
      setEditingRows((prev) => ({ ...prev, [tracking.id]: false }));
      loadTrackings(currentPage);
    } catch (error) {
      pushToast("Помилка збереження: " + error.message, "error");
    }
  };

  // ====================== JSX ======================
  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Заголовок */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 style={{ color: NP_BLUE_DARK, fontWeight: 700 }}>
            🚚 Контроль ТТН та оплат
          </h3>
          <small className="text-muted">
            Nova Poshta • Терміни оплати • Всього записів: {totalItems}
          </small>
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
        </div>
      </div>

      {/* Фільтри */}
      <TrackingFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        searchTTN={searchTTN}
        setSearchTTN={setSearchTTN}
        filterOverdue={filterOverdue}
        setFilterOverdue={setFilterOverdue}
        filterPaid={filterPaid}
        setFilterPaid={setFilterPaid}
      />

      {/* Форма додавання */}
      <AddTrackingForm onAdd={addTracking} loading={loading} />

      {/* Таблиця ТТН */}
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
                  <th>Компанія отримувача</th>
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
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {loading && !filteredTrackings.length ? (
                  <tr>
                    <td colSpan={17} className="text-center py-5">
                      <div className="spinner-border text-primary" />
                      <p className="mt-2">Завантаження...</p>
                    </td>
                  </tr>
                ) : filteredTrackings.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-5 text-muted">
                      📦 Немає відправлень за вибраними фільтрами
                    </td>
                  </tr>
                ) : (
                  filteredTrackings.map((t) => (
                    <TrackingTableRow
                      key={t.id}
                      tracking={t}
                      isEditing={editingRows[t.id] || false}
                      onToggleEdit={toggleEdit}
                      onUpdate={updateTracking}
                      onSave={saveChanges}
                      onDelete={deleteTracking}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Пагінація */}
      <TrackingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={loadTrackings}
      />
    </div>
  );
}

export default NovaPoshtaTrackingWithPayment;
