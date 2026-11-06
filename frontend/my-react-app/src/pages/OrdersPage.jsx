import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useToast } from "../context/useToast";
import "../styles/orders.css";

const statusLabels = {
  New: "Нове",
  InProgress: "В роботі",
  Completed: "Завершене",
  Cancelled: "Скасоване",
};

const currencyCodes = ["UAH", "USD", "EUR", "PLN", "GBP"];
const documentCategories = {
  trip: "Документи рейсу",
  vehicle: "Документи автопоїзда",
  client: "Документи клієнта",
  company: "Документи нашої компанії",
  cargo: "Документи вантажу",
};
const formatDocumentSize = bytes => {
  const value = Number(bytes || 0);
  if (!value) return "0 Б";
  if (value < 1024) return `${value} Б`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} КБ`;
  return `${(value / (1024 * 1024)).toFixed(1)} МБ`;
};

const formatDocumentDate = value => value ? new Date(value).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const emptyForm = () => ({
  clientCompanyId: "",
  clientContactId: "",
  managerUserId: "",
  additionalManagerUserIds: [],
  sourceRequestId: null,
  clientOrderNumber: "",
  orderDate: today(),
  tags: "",
  contractNumber: "",
  initialRate: "",
  currency: "UAH",
  vatRate: "",
  paymentTerms: "",
  paymentDelayDays: "",
  loadingCity: "",
  loadingAddress: "",
  loadingDate: "",
  deliveryCity: "",
  deliveryAddress: "",
  deliveryDate: "",
  cargoDescription: "",
  weightTons: "",
  fleetVehicleId: "",
  comment: "",
});

function formFromOrder(order) {
  return {
    clientCompanyId: String(order.clientCompanyId),
    clientContactId: order.clientContactId == null ? "" : String(order.clientContactId),
    managerUserId: order.managerUserId,
    additionalManagerUserIds: order.additionalManagerUserIds || [],
    sourceRequestId: order.sourceRequestId,
    clientOrderNumber: order.clientOrderNumber || "",
    orderDate: order.orderDate,
    tags: order.tags || "",
    contractNumber: order.contractNumber || "",
    initialRate: String(order.initialRate),
    currency: order.currency,
    vatRate: order.vatRate == null ? "" : String(order.vatRate),
    paymentTerms: order.paymentTerms || "",
    paymentDelayDays: order.paymentDelayDays == null ? "" : String(order.paymentDelayDays),
    loadingCity: order.loadingCity || "",
    loadingAddress: order.loadingAddress || "",
    loadingDate: order.loadingDate || "",
    deliveryCity: order.deliveryCity || "",
    deliveryAddress: order.deliveryAddress || "",
    deliveryDate: order.deliveryDate || "",
    cargoDescription: order.cargoDescription || "",
    weightTons: order.weightTons == null ? "" : String(order.weightTons),
    fleetVehicleId: order.fleetVehicleId == null ? "" : String(order.fleetVehicleId),
    comment: order.comment || "",
  };
}

function formFromRequest(request, managerUserId) {
  return {
    ...emptyForm(),
    clientCompanyId: String(request.clientCompanyId),
    managerUserId,
    sourceRequestId: request.id,
    initialRate: request.rate == null ? "" : String(request.rate),
    currency: request.currency || "UAH",
    loadingCity: request.loadingCity || "",
    loadingAddress: request.loadingAddress || "",
    loadingDate: request.loadingDate || "",
    deliveryCity: request.deliveryCity || "",
    deliveryAddress: request.deliveryAddress || "",
    deliveryDate: request.deliveryDate || "",
    cargoDescription: request.cargoDescription || "",
    weightTons: request.weightTons == null ? "" : String(request.weightTons),
    comment: request.comment || "",
  };
}

function OrdersPage() {
  const { apiData } = useApi();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [fleetVehicles, setFleetVehicles] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ fullName: "", phoneNumber: "", email: "" });
  const [uploadingCategory, setUploadingCategory] = useState("");
  const [documentView, setDocumentView] = useState("all");
  const [fleetDocuments, setFleetDocuments] = useState(null);
  const [inlineFleetDocuments, setInlineFleetDocuments] = useState(null);
  const [fleetDocumentsLoading, setFleetDocumentsLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    return params.toString();
  }, [search, statusFilter]);

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch(`${apiData}/orders${query ? `?${query}` : ""}`, { credentials: "include" });
      const result = await response.json().catch(() => []);
      if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`);
      setOrders(result);
    } catch (error) {
      console.error("Помилка завантаження замовлень:", error);
      pushToast("Не вдалося завантажити замовлення.", "error");
    } finally {
      setLoading(false);
    }
  }, [apiData, pushToast, query]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const [clientsResponse, optionsResponse, vehiclesResponse] = await Promise.all([
          fetch(`${apiData}/client`, { credentials: "include" }),
          fetch(`${apiData}/orders/options`, { credentials: "include" }),
          fetch(`${apiData}/fleet/vehicles`, { credentials: "include" }),
        ]);
        const [clientResult, optionsResult, vehiclesResult] = await Promise.all([
          clientsResponse.json(),
          optionsResponse.json(),
          vehiclesResponse.json(),
        ]);
        if (!clientsResponse.ok) throw new Error(clientResult.message || "Не вдалося завантажити клієнтів.");
        if (!optionsResponse.ok) throw new Error(optionsResult.message || "Не вдалося завантажити менеджерів.");
        if (!vehiclesResponse.ok) throw new Error(vehiclesResult.message || "Не вдалося завантажити автопоїзди.");
        if (cancelled) return;

        setClients(clientResult);
        setManagers(optionsResult.managers || []);
        setFleetVehicles(vehiclesResult || []);
        setCompanyName(optionsResult.companyName || "");
        setCurrentUserId(optionsResult.currentUserId || "");
        if (orderId === "new") {
          const sourceRequest = location.state?.sourceRequest;
          setForm(sourceRequest
            ? formFromRequest(sourceRequest, optionsResult.currentUserId || "")
            : { ...emptyForm(), managerUserId: optionsResult.currentUserId || "" });
          setEditingId(null);
          setIsFormOpen(true);
        }
      } catch (error) {
        console.error("Помилка завантаження довідників замовлень:", error);
        pushToast(error.message || "Не вдалося завантажити дані для замовлення.", "error");
      }
    };
    loadOptions();
    return () => { cancelled = true; };
  }, [apiData, location.state, orderId, pushToast]);

  const loadOrder = useCallback(async (id) => {
    try {
      const response = await fetch(`${apiData}/orders/${id}`, { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося завантажити замовлення.");
      setSelectedOrder(result);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Помилка завантаження картки замовлення:", error);
      pushToast(error.message, "error");
      navigate("/orders", { replace: true });
    }
  }, [apiData, navigate, pushToast]);

  useEffect(() => {
    if (orderId && orderId !== "new" && /^\d+$/.test(orderId)) loadOrder(orderId);
    if (!orderId || orderId === "new") setSelectedOrder(null);
  }, [loadOrder, orderId]);

  const uploadFiles = async (category, files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    setUploadingCategory(category);
    let uploaded = 0;
    for (const file of selectedFiles) {
      const success = await uploadDocument(category, file, false);
      if (success) uploaded += 1;
    }
    setUploadingCategory("");
    if (uploaded) pushToast(uploaded === selectedFiles.length ? `${uploaded} документ(ів) завантажено.` : `Завантажено ${uploaded} із ${selectedFiles.length} документів.`, uploaded === selectedFiles.length ? "success" : "warning");
  };

  const uploadDocument = async (category, file, manageUploading = true) => {
    if (!file || !selectedOrder) return false;
    const body = new FormData();
    body.append("file", file);
    body.append("category", category);
    if (manageUploading) setUploadingCategory(category);
    try {
      const response = await fetch(`${apiData}/orders/${selectedOrder.id}/documents`, {
        method: "POST", credentials: "include", body
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося завантажити документ.");
      setSelectedOrder(current => ({ ...current, documents: [...(current.documents || []), result] }));
      if (manageUploading) pushToast("Документ завантажено.", "success");
      return true;
    } catch (error) {
      pushToast(error.message, "error");
      return false;
    } finally {
      if (manageUploading) setUploadingCategory("");
    }
  };

  const deleteDocument = async document => {
    if (!window.confirm(`Видалити документ «${document.originalFileName}»?`)) return;
    try {
      const response = await fetch(`${apiData}/orders/${selectedOrder.id}/documents/${document.id}`, {
        method: "DELETE", credentials: "include"
      });
      if (!response.ok) throw new Error("Не вдалося видалити документ.");
      setSelectedOrder(current => ({ ...current, documents: current.documents.filter(item => item.id !== document.id) }));
      pushToast("Документ видалено.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const downloadOrderDocument = async document => {
    try {
      const response = await fetch(`${apiData}/orders/${selectedOrder.id}/documents/${document.id}/file?download=true`, { credentials: "include" });
      if (!response.ok) throw new Error("Не вдалося завантажити документ.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalFileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    if (orderId === "new") navigate("/orders", { replace: true });
  };

  const setField = event => {
    const { name, value } = event.target;
    setForm(current => ({
      ...current,
      [name]: value,
      ...(name === "clientCompanyId" ? { clientContactId: "" } : {}),
    }));
    if (name === "clientCompanyId") setIsAddingContact(false);
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), managerUserId: currentUserId });
    setIsAddingContact(false);
    setNewContact({ fullName: "", phoneNumber: "", email: "" });
    setIsFormOpen(true);
  };

  const openOrder = order => navigate(`/orders/${order.id}`);

  const addClientContact = async () => {
    if (!selectedClient || !newContact.fullName.trim()) {
      pushToast("Вкажіть ім’я контактної особи.", "warning");
      return;
    }
    try {
      const response = await fetch(`${apiData}/client/${selectedClient.id}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: newContact.fullName.trim(),
          phoneNumber: newContact.phoneNumber.trim() || null,
          email: newContact.email.trim() || null,
          position: 2,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося додати контакт.");
      setClients(current => current.map(client => client.id === selectedClient.id
        ? { ...client, contactPersons: [...(client.contactPersons || []), result] }
        : client));
      setForm(current => ({ ...current, clientContactId: String(result.id) }));
      setNewContact({ fullName: "", phoneNumber: "", email: "" });
      setIsAddingContact(false);
      pushToast("Контактну особу додано до клієнта.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const submitOrder = async event => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      clientCompanyId: Number(form.clientCompanyId),
      clientContactId: form.clientContactId ? Number(form.clientContactId) : null,
      initialRate: Number(form.initialRate),
      vatRate: form.vatRate === "" ? null : Number(form.vatRate),
      paymentDelayDays: form.paymentDelayDays === "" ? null : Number(form.paymentDelayDays),
      weightTons: form.weightTons === "" ? null : Number(form.weightTons),
      fleetVehicleId: selectedOrder?.tripId
        ? selectedOrder.fleetVehicleId ?? null
        : form.fleetVehicleId ? Number(form.fleetVehicleId) : null,
      loadingDate: form.loadingDate || null,
      deliveryDate: form.deliveryDate || null,
    };
    try {
      const response = await fetch(editingId ? `${apiData}/orders/${editingId}` : `${apiData}/orders`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося зберегти замовлення.");
      pushToast(editingId ? "Замовлення оновлено." : "Замовлення створено.", "success");
      setIsFormOpen(false);
      setEditingId(null);
      await loadOrders();
      if (editingId) {
        await loadOrder(editingId);
      } else if (result.id) {
        navigate(`/orders/${result.id}`);
      }
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const openFleetDocuments = async (scope = "all", inline = false) => {
    const vehicleId = selectedOrder?.fleetVehicleId;
    const driverId = fleetVehicles.find(vehicle => String(vehicle.id) === String(vehicleId))?.currentDriver?.driverId
      ?? fleetVehicles.find(vehicle => String(vehicle.id) === String(vehicleId))?.currentDriver?.id;
    if (!vehicleId) {
      pushToast("Спочатку призначте автопоїзд.", "warning");
      return;
    }
    setFleetDocumentsLoading(true);
    const placeholder = { title: scope === "driver" ? "Документи водія" : scope === "vehicle" ? "Документи автопоїзда" : "Документи автопоїзда та водія", groups: [] };
    if (inline) setInlineFleetDocuments(placeholder);
    else setFleetDocuments(placeholder);
    try {
      const requests = [];
      if (scope !== "driver") requests.push(["Автомобіль", fetch(`${apiData}/fleet/vehicles/${vehicleId}/documents`, { credentials: "include" })]);
      if (scope !== "vehicle" && driverId) requests.push(["Водій", fetch(`${apiData}/fleet/drivers/${driverId}/documents`, { credentials: "include" })]);
      const groups = await Promise.all(requests.map(async ([label, pending]) => {
        const response = await pending;
        const result = await response.json().catch(() => []);
        if (!response.ok) throw new Error(result.message || `Не вдалося завантажити документи: ${label}.`);
        return { label, documents: result || [] };
      }));
      if (scope === "driver" && !driverId) groups.push({ label: "Водій", documents: [], empty: "Водій не призначений до поточного автопоїзда." });
      const result = { title: scope === "driver" ? "Документи водія" : scope === "vehicle" ? "Документи автопоїзда" : "Документи автопоїзда та водія", groups };
      if (inline) setInlineFleetDocuments(result);
      else setFleetDocuments(result);
    } catch (error) {
      pushToast(error.message, "error");
      if (inline) setInlineFleetDocuments(null);
      else setFleetDocuments(null);
    } finally {
      setFleetDocumentsLoading(false);
    }
  };

  const openFleetDocumentFile = async (kind, documentId, vehicleId, driverId, download = false, fileName = "document") => {
    try {
      const url = kind === "driver"
        ? `${apiData}/fleet/drivers/${driverId}/documents/${documentId}/file`
        : `${apiData}/fleet/vehicles/${vehicleId}/documents/${documentId}/file`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Не вдалося відкрити документ.");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      if (download) {
        const link = window.document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      } else {
        window.open(objectUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`${apiData}/orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося оновити статус.");
      await loadOrders();
      if (selectedOrder?.id === id) await loadOrder(id);
      pushToast("Статус замовлення оновлено.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const undoStatus = async id => {
    try {
      const response = await fetch(`${apiData}/orders/${id}/status/undo`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося повернути попередній статус.");
      await loadOrders();
      if (selectedOrder?.id === id) await loadOrder(id);
      pushToast("Повернуто попередній статус замовлення.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const deleteOrder = async order => {
    if (!window.confirm(`Видалити замовлення ${order.orderNumber}? Цю дію не можна скасувати.`)) return;
    setDeletingOrderId(order.id);
    try {
      const response = await fetch(`${apiData}/orders/${order.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Не вдалося видалити замовлення.");
      setSelectedOrder(null);
      navigate("/orders", { replace: true });
      await loadOrders();
      pushToast("Замовлення видалено.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const selectedClient = clients.find(client => String(client.id) === form.clientCompanyId);
  const initialRateWithVat = form.initialRate && form.vatRate !== ""
    ? Number(form.initialRate) * (1 + Number(form.vatRate) / 100)
    : null;

  if (!selectedOrder && isFormOpen) return (        <main className="orders-page orders-form-page">
          <section className="orders-form-page__workspace" aria-labelledby="orders-dialog-title">
            <header className="orders-form-page__header">
              <div>
                <button type="button" className="order-detail-page__back" onClick={closeForm} disabled={saving}>← До замовлень</button>
                <span>{form.sourceRequestId ? `ЗАПИТ #${form.sourceRequestId}` : editingId ? selectedOrder?.orderNumber : "НОВЕ ЗАМОВЛЕННЯ"}</span>
                <h1 id="orders-dialog-title">{editingId ? "Редагувати замовлення" : "Нове замовлення"}</h1>
                <p>Заповніть основну інформацію та перевезення.</p>
              </div>
            </header>
            <form onSubmit={submitOrder}>
              <div className="orders-form-grid">
                <div className="orders-section-title">Контактна інформація</div>
                <label><span>№ замовлення у клієнта</span><input name="clientOrderNumber" value={form.clientOrderNumber} onChange={setField} maxLength="100" /></label>
                <label><span>Дата замовлення <b>*</b></span><input name="orderDate" type="date" value={form.orderDate} onChange={setField} required /></label>
                <label className="orders-field-wide"><span>Теги</span><input name="tags" value={form.tags} onChange={setField} maxLength="1000" placeholder="Наприклад: термінове, експорт" /></label>
                <label><span>Клієнт <b>*</b></span><select name="clientCompanyId" value={form.clientCompanyId} onChange={setField} required disabled={Boolean(form.sourceRequestId)}>
                  <option value="">Оберіть клієнта</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select></label>
                <label><span>Номер договору з клієнтом</span><input name="contractNumber" value={form.contractNumber} onChange={setField} maxLength="100" /></label>
                <label><span>Контактна особа</span><select name="clientContactId" value={form.clientContactId} onChange={setField}>
                  <option value="">Не обрано</option>{(selectedClient?.contactPersons || []).map(contact => <option key={contact.id} value={contact.id}>{contact.fullName}</option>)}
                </select></label>
                <div className="orders-contact-action">
                  {selectedClient && !isAddingContact && <button type="button" onClick={() => setIsAddingContact(true)}>＋ Додати контактну особу</button>}
                  {isAddingContact && <>
                    <input aria-label="Ім’я контактної особи" placeholder="Ім’я та прізвище *" value={newContact.fullName} onChange={event => setNewContact(current => ({ ...current, fullName: event.target.value }))} />
                    <input aria-label="Телефон контактної особи" placeholder="Телефон" value={newContact.phoneNumber} onChange={event => setNewContact(current => ({ ...current, phoneNumber: event.target.value }))} />
                    <input aria-label="Email контактної особи" placeholder="Email" type="email" value={newContact.email} onChange={event => setNewContact(current => ({ ...current, email: event.target.value }))} />
                    <button type="button" onClick={addClientContact}>Зберегти контакт</button>
                    <button type="button" className="orders-contact-cancel" onClick={() => setIsAddingContact(false)}>Скасувати</button>
                  </>}
                </div>
                <label><span>Менеджер <b>*</b></span><select name="managerUserId" value={form.managerUserId} onChange={setField} required>
                  <option value="">Оберіть менеджера</option>{managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                </select></label>
                <label className="orders-field-wide"><span>Додаткові менеджери</span><select multiple value={form.additionalManagerUserIds} onChange={event => setForm(current => ({
                  ...current,
                  additionalManagerUserIds: Array.from(event.target.selectedOptions, option => option.value),
                }))}>
                  {managers.filter(manager => manager.id !== form.managerUserId).map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                </select><small>Для вибору кількох утримуйте Ctrl або Command.</small></label>
                <label className="orders-field-wide"><span>Компанія</span><input value={companyName} readOnly /></label>

                <div className="orders-section-title">Цінник</div>
                <label><span>Початкова ставка <b>*</b></span><input name="initialRate" type="number" min="0.01" step="0.01" value={form.initialRate} onChange={setField} required /></label>
                <label><span>Валюта <b>*</b></span><select name="currency" value={form.currency} onChange={setField} required>{currencyCodes.map(currency => <option key={currency}>{currency}</option>)}</select></label>
                <label><span>Тариф ПДВ, %</span><input name="vatRate" type="number" min="0" max="100" step="0.01" value={form.vatRate} onChange={setField} /></label>
                <label><span>Початкова ставка з ПДВ</span><input value={initialRateWithVat == null ? "" : `${formatMoney(initialRateWithVat)} ${form.currency}`} readOnly /></label>
                <label className="orders-field-wide"><span>Умови відстрочки платежу</span><input name="paymentTerms" value={form.paymentTerms} onChange={setField} maxLength="500" /></label>
                <label><span>Відстрочка платежу, днів</span><input name="paymentDelayDays" type="number" min="0" max="3650" step="1" value={form.paymentDelayDays} onChange={setField} /></label>

                <div className="orders-section-title">Перевезення</div>
                <label><span>Місто завантаження</span><input name="loadingCity" value={form.loadingCity} onChange={setField} maxLength="160" /></label>
                <label><span>Адреса завантаження</span><input name="loadingAddress" value={form.loadingAddress} onChange={setField} maxLength="300" /></label>
                <label><span>Дата завантаження</span><input name="loadingDate" type="date" value={form.loadingDate} onChange={setField} /></label>
                <label><span>Місто доставки</span><input name="deliveryCity" value={form.deliveryCity} onChange={setField} maxLength="160" /></label>
                <label><span>Адреса доставки</span><input name="deliveryAddress" value={form.deliveryAddress} onChange={setField} maxLength="300" /></label>
                <label><span>Дата доставки</span><input name="deliveryDate" type="date" min={form.loadingDate || undefined} value={form.deliveryDate} onChange={setField} /></label>
                <label className="orders-field-wide"><span>Автопоїзд</span><select name="fleetVehicleId" value={form.fleetVehicleId} onChange={setField} disabled={Boolean(selectedOrder?.tripId)}>
                  <option value="">Не призначено</option>
                  {fleetVehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate}{vehicle.trailerPlate ? ` + ${vehicle.trailerPlate}` : ""}{vehicle.make ? ` · ${vehicle.make}` : ""}
                  </option>)}
                </select></label>
                <label className="orders-field-wide"><span>Опис вантажу</span><input name="cargoDescription" value={form.cargoDescription} onChange={setField} maxLength="500" /></label>
                <label><span>Вага, т</span><input name="weightTons" type="number" min="0.001" step="0.001" value={form.weightTons} onChange={setField} /></label>
                <label className="orders-field-wide"><span>Коментар</span><textarea name="comment" value={form.comment} onChange={setField} maxLength="2000" rows="3" /></label>
              </div>
              <footer className="orders-dialog__footer">
                <button type="button" className="orders-secondary-button" onClick={closeForm} disabled={saving}>Скасувати</button>
                <button type="submit" className="orders-primary-button" disabled={saving}>{saving ? "Збереження…" : editingId ? "Зберегти зміни" : "Зберегти замовлення"}</button>
              </footer>
            </form>
          </section>
        </main>
  );

  if (selectedOrder) {
    return (
      <main className="orders-page order-detail-page">
        <header className="order-detail-page__heading">
          <div>
            <button type="button" className="order-detail-page__back" onClick={() => navigate("/orders")}>← До замовлень</button>
            <div className="orders-eyebrow">{selectedOrder.orderNumber}</div>
            <h1>{selectedOrder.clientName}</h1>
            <p>{selectedOrder.loadingCity || "—"} → {selectedOrder.deliveryCity || "—"}</p>
          </div>
          <span className={`orders-status orders-status--${selectedOrder.status.toLowerCase()}`}>
            {statusLabels[selectedOrder.status] || selectedOrder.status}
          </span>
        </header>

        <div className="order-detail-page__actions">
          {selectedOrder.previousStatus && <button type="button" className="orders-secondary-button" onClick={() => undoStatus(selectedOrder.id)}>← Повернути статус</button>}
          {selectedOrder.status === "New" && <button type="button" className="orders-secondary-button" onClick={() => updateStatus(selectedOrder.id, "InProgress")}>Взяти в роботу</button>}
          {selectedOrder.status === "InProgress" && <button type="button" className="orders-secondary-button" onClick={() => updateStatus(selectedOrder.id, "Completed")}>Завершити</button>}
          {["New", "InProgress"].includes(selectedOrder.status) && <button type="button" className="orders-danger-button" onClick={() => updateStatus(selectedOrder.id, "Cancelled")}>Скасувати</button>}
          <button type="button" className="orders-primary-button" onClick={() => { setForm(formFromOrder(selectedOrder)); setEditingId(selectedOrder.id); setIsFormOpen(true); }}>Редагувати</button>
          <button type="button" className="orders-danger-button" disabled={deletingOrderId === selectedOrder.id} onClick={() => deleteOrder(selectedOrder)}>{deletingOrderId === selectedOrder.id ? "Видалення…" : "Видалити"}</button>
        </div>

        {isFormOpen ? (
          <form className="order-detail-page__layout order-detail-page__layout--edit" onSubmit={submitOrder}>
            <section className="order-detail-card order-detail-edit-card">
              <div className="order-detail-edit-card__heading">
                <div><span>РЕДАГУВАННЯ</span><h2>Основна інформація</h2></div>
                <small>Зміни збережуться у картці замовлення</small>
              </div>
              <div className="orders-form-grid order-detail-edit-grid">
                <label><span>№ замовлення у клієнта</span><input name="clientOrderNumber" value={form.clientOrderNumber} onChange={setField} /></label>
                <label><span>Дата замовлення <b>*</b></span><input name="orderDate" type="date" value={form.orderDate} onChange={setField} required /></label>
                <label><span>Клієнт <b>*</b></span><select name="clientCompanyId" value={form.clientCompanyId} onChange={setField} required disabled={Boolean(form.sourceRequestId)}>
                  <option value="">Оберіть клієнта</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                <label><span>Контактна особа</span><select name="clientContactId" value={form.clientContactId} onChange={setField}><option value="">Не обрано</option>{(selectedClient?.contactPersons || []).map(contact => <option key={contact.id} value={contact.id}>{contact.fullName}</option>)}</select></label>
                <label><span>Менеджер <b>*</b></span><select name="managerUserId" value={form.managerUserId} onChange={setField} required><option value="">Оберіть менеджера</option>{managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}</select></label>
                <label><span>Номер договору</span><input name="contractNumber" value={form.contractNumber} onChange={setField} /></label>
                <label><span>Початкова ставка <b>*</b></span><input name="initialRate" type="number" min="0.01" step="0.01" value={form.initialRate} onChange={setField} required /></label>
                <label><span>Валюта <b>*</b></span><select name="currency" value={form.currency} onChange={setField} required>{currencyCodes.map(currency => <option key={currency}>{currency}</option>)}</select></label>
                <div className="orders-section-title">Маршрут і вантаж</div>
                <label><span>Місто завантаження</span><input name="loadingCity" value={form.loadingCity} onChange={setField} /></label>
                <label><span>Місто доставки</span><input name="deliveryCity" value={form.deliveryCity} onChange={setField} /></label>
                <label><span>Адреса завантаження</span><input name="loadingAddress" value={form.loadingAddress} onChange={setField} /></label>
                <label><span>Адреса доставки</span><input name="deliveryAddress" value={form.deliveryAddress} onChange={setField} /></label>
                <label><span>Дата завантаження</span><input name="loadingDate" type="date" value={form.loadingDate} onChange={setField} /></label>
                <label><span>Дата доставки</span><input name="deliveryDate" type="date" min={form.loadingDate || undefined} value={form.deliveryDate} onChange={setField} /></label>
                <label className="orders-field-wide"><span>Опис вантажу</span><input name="cargoDescription" value={form.cargoDescription} onChange={setField} /></label>
                <label><span>Вага, т</span><input name="weightTons" type="number" min="0.001" step="0.001" value={form.weightTons} onChange={setField} /></label>
                <label className="orders-field-wide"><span>Теги</span><input name="tags" value={form.tags} onChange={setField} /></label>
                <label className="orders-field-wide"><span>Коментар</span><textarea name="comment" rows="3" value={form.comment} onChange={setField} /></label>
              </div>
            </section>

          <section className="order-detail-card order-detail-vehicle">
            <h2>Автопоїзд</h2>
            {isFormOpen ? (() => {
              const effectiveVehicleId = selectedOrder.tripId ? String(selectedOrder.fleetVehicleId ?? "") : form.fleetVehicleId;
              const selectedVehicle = fleetVehicles.find(vehicle => String(vehicle.id) === effectiveVehicleId);
              return <div className="order-detail-vehicle__editor">
                {selectedOrder.tripId ? <div className="order-detail-vehicle__locked-picker"><span>Автопоїзд</span><strong>{selectedVehicle ? `${selectedVehicle.plate}${selectedVehicle.trailerPlate ? ` + ${selectedVehicle.trailerPlate}` : ""}` : "Автопоїзд не призначено"}</strong></div> : <label><span>Автопоїзд</span><select name="fleetVehicleId" value={form.fleetVehicleId} onChange={setField}><option value="">Не призначено</option>{fleetVehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.plate}{vehicle.trailerPlate ? ` + ${vehicle.trailerPlate}` : ""}</option>)}</select></label>}
                {selectedOrder.tripId && <p className="order-detail-vehicle__locked">Автопоїзд закріплено поточним рейсом і недоступний для зміни.</p>}
                {selectedVehicle ? <div className="order-detail-vehicle__composition">
                  <div><span>ТЯГАЧ / ФУРА</span><strong>{selectedVehicle.plate}</strong><small>{[selectedVehicle.make, selectedVehicle.type].filter(Boolean).join(" · ") || "Транспортний засіб"}</small></div>
                  <div><span>ПРИЧІП</span><strong>{selectedVehicle.trailerPlate || "Не вказано"}</strong><small>{selectedVehicle.capacity ? `${selectedVehicle.capacity} т вантажопідйомності` : "Причіп у складі"}</small></div>
                  <div><span>ВОДІЙ</span><strong>{selectedVehicle.currentDriver?.fullName || "Не призначено"}</strong><small>{selectedVehicle.status || "Статус невідомий"}</small></div>
                </div> : <p className="order-detail-vehicle__empty">Оберіть автопоїзд, щоб переглянути його склад.</p>}
                <div className="order-detail-vehicle__document-actions">
                  <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("all")}>Усі документи</button>
                  <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("vehicle")}>Документи ТЗ і причепа</button>
                  <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("driver")}>Документи водія</button>
                </div>
              </div>;
            })() : <>
              <div className="order-detail-vehicle__plate">{selectedOrder.fleetVehiclePlate ? `${selectedOrder.fleetVehiclePlate}${selectedOrder.fleetTrailerPlate ? ` + ${selectedOrder.fleetTrailerPlate}` : ""}` : "Автопоїзд не призначено"}</div>
              <div className="order-detail-vehicle__document-actions">
                <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("all")}>Усі документи</button>
                <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("vehicle")}>Документи ТЗ і причепа</button>
                <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("driver")}>Документи водія</button>
              </div>
            </>}
          </section>

          <section className="order-detail-card order-detail-documents">
            <div className="orders-documents__header"><span>ДОКУМЕНТИ</span><h2>Документи до перевезення</h2></div>
            <nav className="order-document-tabs" aria-label="Категорії документів">
              <button type="button" className={documentView === "all" ? "is-active" : ""} onClick={() => setDocumentView("all")}>Усі документи</button>
              <button type="button" onClick={() => { setDocumentView("vehicle"); openFleetDocuments("vehicle", true); }}>Автомобіль і причіп</button>
              <button type="button" onClick={() => { setDocumentView("driver"); openFleetDocuments("driver", true); }}>Водій</button>
              <button type="button" className={documentView === "client" ? "is-active" : ""} onClick={() => setDocumentView("client")}>Клієнт</button>
              <button type="button" className={documentView === "company" ? "is-active" : ""} onClick={() => setDocumentView("company")}>Моя фірма</button>
              <button type="button" className={documentView === "trip" ? "is-active" : ""} onClick={() => setDocumentView("trip")}>Рейс</button>
              <button type="button" className={documentView === "cargo" ? "is-active" : ""} onClick={() => setDocumentView("cargo")}>Вантаж</button>
            </nav>
            {(documentView === "vehicle" || documentView === "driver") && <div className="order-inline-fleet-documents orders-document-group">
              <div className="orders-document-group__heading"><strong>{inlineFleetDocuments?.title || (documentView === "driver" ? "Документи водія" : "Документи автомобіля і причепа")}</strong><span className="orders-document-source">З прив’язаного автопарку</span></div>
              {fleetDocumentsLoading ? <p className="orders-document-empty">Завантаження документів…</p> : inlineFleetDocuments?.groups.map((group, index) => {
                const kind = group.label === "Водій" ? "driver" : "vehicle";
                const vehicleId = selectedOrder?.fleetVehicleId;
                const driverId = fleetVehicles.find(vehicle => String(vehicle.id) === String(vehicleId))?.currentDriver?.driverId ?? fleetVehicles.find(vehicle => String(vehicle.id) === String(vehicleId))?.currentDriver?.id;
                return <div key={`${group.label}-${index}`}>
                  {group.empty ? <p className="orders-document-empty">{group.empty}</p> : group.documents.length === 0 ? <p className="orders-document-empty">Документів не знайдено.</p> : group.documents.map(document => {
                    const id = document.id ?? document.documentId;
                    const title = document.type || document.originalFileName || document.fileName || `Документ ${id}`;
                    return <div className="orders-document" key={id}>
                      <span className="orders-document__icon">📄</span>
                      <div className="orders-document__name"><strong>{title}</strong>{document.number && <small>№ {document.number}</small>}{document.expiryDate && <small>Дійсний до {document.expiryDate}</small>}</div>
                      <button type="button" className="orders-document__action" onClick={() => openFleetDocumentFile(kind, id, vehicleId, driverId)}>Переглянути</button>
                      <button type="button" className="orders-document__action" onClick={() => openFleetDocumentFile(kind, id, vehicleId, driverId, true, `${title}.pdf`)}>Завантажити</button>
                    </div>;
                  })}
                </div>;
              })}
            </div>}
            {Object.entries(documentCategories).filter(([category]) => documentView === "all" || documentView === category).map(([category, label]) => {
              const categoryDocuments = (selectedOrder.documents || []).filter(document => document.category === category
                || (category === "trip" && document.category === "transport"));
              return <div className="orders-document-group" id={`order-document-${category}`} key={category}>
                <div className="orders-document-group__heading"><strong>{label}</strong><label className="orders-document-upload">
                  {uploadingCategory === category ? "Завантаження…" : "+ Додати документ"}
                  <input type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" multiple disabled={Boolean(uploadingCategory)} onChange={event => { uploadFiles(category, event.target.files); event.target.value = ""; }} />
                </label></div>
                {categoryDocuments.length === 0 ? <p className="orders-document-empty">Документів немає</p> : categoryDocuments.map(document => <div className="orders-document" key={document.id}>
                  <span className="orders-document__icon">📄</span>
                  <div className="orders-document__name"><a href={`${apiData}/orders/${selectedOrder.id}/documents/${document.id}/file?download=false`} target="_blank" rel="noreferrer">{document.originalFileName}</a><small>{formatDocumentSize(document.sizeBytes)}{document.uploadedAt ? ` · ${formatDocumentDate(document.uploadedAt)}` : ""}</small></div>
                  <button type="button" className="orders-document__action" onClick={() => downloadOrderDocument(document)}>Завантажити</button>
                  <button type="button" className="orders-document__delete" onClick={() => deleteDocument(document)} aria-label={`Видалити ${document.originalFileName}`}>×</button>
                </div>)}
              </div>;
            })}
          </section>
          {isFormOpen && <footer className="order-detail-page__edit-actions">
            <button type="button" className="orders-secondary-button" onClick={closeForm} disabled={saving}>Скасувати</button>
            <button type="submit" className="orders-primary-button" disabled={saving}>{saving ? "Збереження…" : "Зберегти зміни"}</button>
          </footer>}
          </form>
        ) : (
          <div className="order-detail-page__layout">
            <section className="order-detail-card">
              <h2>Основна інформація</h2>
              <div className="orders-detail-grid">
                <Detail label="Статус" value={statusLabels[selectedOrder.status]} />
                <Detail label="Дата замовлення" value={formatDate(selectedOrder.orderDate)} />
                <Detail label="Номер у клієнта" value={selectedOrder.clientOrderNumber} />
                <Detail label="Контракт" value={selectedOrder.contractNumber} />
                <Detail label="Контактна особа" value={selectedOrder.clientContactName} />
                <Detail label="Менеджер" value={selectedOrder.managerName} />
                <Detail label="Початкова ставка" value={`${formatMoney(selectedOrder.initialRate)} ${selectedOrder.currency}`} />
                <Detail label="Початкова ставка з ПДВ" value={selectedOrder.initialRateWithVat == null ? "—" : `${formatMoney(selectedOrder.initialRateWithVat)} ${selectedOrder.currency}`} />
                <Detail label="Умови відстрочки" value={selectedOrder.paymentTerms} />
                <Detail label="Відстрочка, днів" value={selectedOrder.paymentDelayDays} />
                <Detail label="Маршрут" value={`${selectedOrder.loadingCity || "—"} → ${selectedOrder.deliveryCity || "—"}`} />
                <Detail label="Дати" value={`${formatDate(selectedOrder.loadingDate)} → ${formatDate(selectedOrder.deliveryDate)}`} />
                <Detail label="Вантаж" value={selectedOrder.cargoDescription} />
                <Detail label="Вага, т" value={selectedOrder.weightTons} />
                <Detail label="Теги" value={selectedOrder.tags} />
                <Detail label="Коментар" value={selectedOrder.comment} />
              </div>
            </section>

            <section className="order-detail-card order-detail-vehicle">
              <h2>Автопоїзд</h2>
              <div className="order-detail-vehicle__plate">{selectedOrder.fleetVehiclePlate
                ? `${selectedOrder.fleetVehiclePlate}${selectedOrder.fleetTrailerPlate ? ` + ${selectedOrder.fleetTrailerPlate}` : ""}`
                : "Автопоїзд не призначено"}</div>
              <div className="order-detail-vehicle__document-actions">
                <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("all")}>Усі документи</button>
                <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("vehicle")}>Документи ТЗ і причепа</button>
                <button type="button" className="orders-secondary-button" onClick={() => openFleetDocuments("driver")}>Документи водія</button>
              </div>
            </section>

            <section className="order-detail-card order-detail-documents">
              <div className="orders-documents__header"><span>ДОКУМЕНТИ</span><h2>Документи до перевезення</h2></div>
              <nav className="order-document-tabs" aria-label="Категорії документів">
                <button type="button" className={documentView === "all" ? "is-active" : ""} onClick={() => setDocumentView("all")}>Усі документи</button>
                <button type="button" onClick={() => { setDocumentView("vehicle"); openFleetDocuments("vehicle", true); }}>Автомобіль і причіп</button>
                <button type="button" onClick={() => { setDocumentView("driver"); openFleetDocuments("driver", true); }}>Водій</button>
                <button type="button" className={documentView === "client" ? "is-active" : ""} onClick={() => setDocumentView("client")}>Клієнт</button>
                <button type="button" className={documentView === "company" ? "is-active" : ""} onClick={() => setDocumentView("company")}>Моя фірма</button>
                <button type="button" className={documentView === "trip" ? "is-active" : ""} onClick={() => setDocumentView("trip")}>Рейс</button>
                <button type="button" className={documentView === "cargo" ? "is-active" : ""} onClick={() => setDocumentView("cargo")}>Вантаж</button>
              </nav>
              {(documentView === "vehicle" || documentView === "driver") && <div className="order-inline-fleet-documents orders-document-group">
              <div className="orders-document-group__heading"><strong>{inlineFleetDocuments?.title || (documentView === "driver" ? "Документи водія" : "Документи автомобіля і причепа")}</strong><span className="orders-document-source">З прив’язаного автопарку</span></div>
              {fleetDocumentsLoading ? <p className="orders-document-empty">Завантаження документів…</p> : inlineFleetDocuments?.groups.map((group, index) => {
                const kind = group.label === "Водій" ? "driver" : "vehicle";
                const vehicleId = selectedOrder?.fleetVehicleId;
                const driverId = fleetVehicles.find(vehicle => String(vehicle.id) === String(vehicleId))?.currentDriver?.driverId ?? fleetVehicles.find(vehicle => String(vehicle.id) === String(vehicleId))?.currentDriver?.id;
                return <div key={`${group.label}-${index}`}>
                  {group.empty ? <p className="orders-document-empty">{group.empty}</p> : group.documents.length === 0 ? <p className="orders-document-empty">Документів не знайдено.</p> : group.documents.map(document => {
                    const id = document.id ?? document.documentId;
                    const title = document.type || document.originalFileName || document.fileName || `Документ ${id}`;
                    return <div className="orders-document" key={id}>
                      <span className="orders-document__icon">📄</span>
                      <div className="orders-document__name"><strong>{title}</strong>{document.number && <small>№ {document.number}</small>}{document.expiryDate && <small>Дійсний до {document.expiryDate}</small>}</div>
                      <button type="button" className="orders-document__action" onClick={() => openFleetDocumentFile(kind, id, vehicleId, driverId)}>Переглянути</button>
                      <button type="button" className="orders-document__action" onClick={() => openFleetDocumentFile(kind, id, vehicleId, driverId, true, `${title}.pdf`)}>Завантажити</button>
                    </div>;
                  })}
                </div>;
              })}
            </div>}
            {Object.entries(documentCategories).filter(([category]) => documentView === "all" || documentView === category).map(([category, label]) => {
                const categoryDocuments = (selectedOrder.documents || []).filter(document => document.category === category
                || (category === "trip" && document.category === "transport"));
                return <div className="orders-document-group" id={`order-document-${category}`} key={category}>
                  <div className="orders-document-group__heading"><strong>{label}</strong><label className="orders-document-upload">
                    {uploadingCategory === category ? "Завантаження…" : "+ Додати документ"}
                    <input type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" multiple disabled={Boolean(uploadingCategory)} onChange={event => { uploadFiles(category, event.target.files); event.target.value = ""; }} />
                  </label></div>
                  {categoryDocuments.length === 0 ? <p className="orders-document-empty">Документів немає</p> : categoryDocuments.map(document => <div className="orders-document" key={document.id}>
                    <span className="orders-document__icon">📄</span>
                    <div className="orders-document__name"><a href={`${apiData}/orders/${selectedOrder.id}/documents/${document.id}/file?download=false`} target="_blank" rel="noreferrer">{document.originalFileName}</a><small>{formatDocumentSize(document.sizeBytes)}{document.uploadedAt ? ` · ${formatDocumentDate(document.uploadedAt)}` : ""}</small></div>
                    <button type="button" className="orders-document__action" onClick={() => downloadOrderDocument(document)}>Завантажити</button>
                    <button type="button" className="orders-document__delete" onClick={() => deleteDocument(document)} aria-label={`Видалити ${document.originalFileName}`}>×</button>
                  </div>)}
                </div>;
              })}
            </section>
          </div>
        )}
        {fleetDocuments && <div className="order-document-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setFleetDocuments(null); }}>
          <section className="order-document-dialog" role="dialog" aria-modal="true" aria-label={fleetDocuments.title}>
            <header><div><span>ПРИВ’ЯЗАНИЙ АВТОПARK</span><h2>{fleetDocuments.title}</h2></div><button type="button" onClick={() => setFleetDocuments(null)} aria-label="Закрити">×</button></header>
            {fleetDocumentsLoading ? <p className="orders-message">Завантаження документів…</p> : fleetDocuments.groups.map((group, index) => {
              const kind = group.label === "Водій" ? "driver" : "vehicle";
              const vehicleId = selectedOrder?.fleetVehicleId;
              const driverId = fleetVehicles.find(vehicle => String(vehicle.id) === String(vehicleId))?.currentDriver?.driverId
                ?? fleetVehicles.find(vehicle => String(vehicle.id) === String(vehicleId))?.currentDriver?.id;
              return <div className="order-document-group" key={`${group.label}-${index}`}>
                <h3>{group.label}</h3>
                {group.empty ? <p>{group.empty}</p> : group.documents.length === 0 ? <p>Документів не знайдено.</p> : group.documents.map(document => {
                  const documentId = document.id ?? document.documentId;
                  return <button type="button" className="order-document-item" key={documentId} onClick={() => openFleetDocumentFile(kind, documentId, vehicleId, driverId)}>
                    <span>📄</span><strong>{document.originalFileName || document.fileName || document.name || `Документ ${documentId}`}</strong><small>{document.documentType || document.type || "Відкрити документ"}</small>
                  </button>;
                })}
              </div>;
            })}
          </section>
        </div>}
      </main>
    );
  }

  return (
    <div className="orders-page">
      <header className="orders-heading">
        <div>
          <div className="orders-eyebrow">РОБОЧИЙ ПРОСТІР</div>
          <h1>Замовлення</h1>
          <p>Створюйте та ведіть замовлення на перевезення.</p>
        </div>
        <button type="button" className="orders-primary-button" onClick={openNewForm} disabled={!clients.length || !managers.length}>
          <span aria-hidden="true">＋</span> Нове замовлення
        </button>
      </header>

      <section className="orders-workspace">
        <div className="orders-toolbar">
          <label className="orders-search">
            <span className="visually-hidden">Пошук замовлень</span>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Пошук за клієнтом, номером або маршрутом" />
          </label>
          <label className="orders-status-filter">
            <span className="visually-hidden">Фільтр за статусом</span>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              <option value="">Усі статуси</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <span className="orders-count">{orders.length} замовл.</span>
        </div>

        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead><tr>
              <th>Номер</th><th>Клієнт</th><th>Маршрут</th><th>Дата</th><th>Початкова ставка</th><th>Менеджер</th><th>Статус</th><th>Дії</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="8" className="orders-message">Завантаження замовлень…</td></tr>
                : orders.length === 0 ? <tr><td colSpan="8" className="orders-message">Замовлень поки немає.</td></tr>
                  : orders.map(order => <tr key={order.id} onClick={() => openOrder(order)} tabIndex="0" onKeyDown={event => {
                    if (event.target === event.currentTarget && event.key === "Enter") openOrder(order);
                  }}>
                    <td><strong>{order.orderNumber}</strong>{order.clientOrderNumber && <small>Клієнтський № {order.clientOrderNumber}</small>}</td>
                    <td>{order.clientName}{order.clientContactName && <small>{order.clientContactName}</small>}</td>
                    <td>
                      {order.loadingCity || "—"} → {order.deliveryCity || "—"}
                      {order.fleetVehiclePlate && <small>Автопоїзд: {order.fleetVehiclePlate}{order.fleetTrailerPlate ? ` + ${order.fleetTrailerPlate}` : ""}</small>}
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{formatMoney(order.initialRate)} {order.currency}</td>
                    <td>{order.managerName || "—"}</td>
                    <td>
                      <span className={`orders-status orders-status--${order.status.toLowerCase()}`}>{statusLabels[order.status] || order.status}</span>
                      <div className="orders-row-status-actions" onClick={event => event.stopPropagation()}>
                        {order.previousStatus && (
                          <button type="button" onClick={() => undoStatus(order.id)}>Повернути</button>
                        )}
                        {order.status === "New" && (
                          <button type="button" onClick={() => updateStatus(order.id, "InProgress")}>Взяти в роботу</button>
                        )}
                        {order.status === "InProgress" && (
                          <button type="button" onClick={() => updateStatus(order.id, "Completed")}>Завершити</button>
                        )}
                        {["New", "InProgress"].includes(order.status) && (
                          <button type="button" className="orders-row-status-cancel" onClick={() => updateStatus(order.id, "Cancelled")}>Скасувати</button>
                        )}
                      </div>
                    </td>
                    <td><button
                      type="button"
                      className="orders-danger-button orders-row-delete"
                      disabled={deletingOrderId === order.id}
                      onClick={event => {
                        event.stopPropagation();
                        deleteOrder(order);
                      }}
                    >{deletingOrderId === order.id ? "Видалення…" : "Видалити"}</button></td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </section>



    </div>
  );
}

function Detail({ label, value }) {
  return <div className="orders-detail"><span>{label}</span><strong>{value || "—"}</strong></div>;
}

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(year, month - 1, day));
}

function formatMoney(value) {
  return new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default OrdersPage;
