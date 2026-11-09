import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "../context/ApiContext";
import "../styles/drivers.css";

const blankDriver = { fullName: "", phone: "", email: "", additionalContact: "", notes: "" };
const blankDocument = { type: "", number: "", issueDate: "", expiryDate: "", comment: "" };

async function readResponse(response) {
  if (response.ok) return response.status === 204 ? null : response.json();
  const body = await response.json().catch(() => null);
  throw new Error(body?.message || body?.title || `Запит не виконано (${response.status}).`);
}

function documentExpiry(document) {
  if (!document.expiryDate) return { label: "Без строку", className: "" };
  const today = new Date();
  const expiry = new Date(`${document.expiryDate}T00:00:00`);
  const days = Math.ceil((expiry.setHours(0, 0, 0, 0) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000);
  if (days < 0) return { label: "Прострочений", className: "is-expired" };
  if (days <= 30) return { label: `Завершується за ${days} дн.`, className: "is-warning" };
  return { label: "Дійсний", className: "is-valid" };
}

function DriverFilePreview({ file, blob, onClose }) {
  const [docxHtml, setDocxHtml] = useState("");
  const [previewError, setPreviewError] = useState("");
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => {
    if (file.name.toLowerCase().endsWith(".docx")) {
      blob.arrayBuffer()
        .then((arrayBuffer) => import("mammoth").then(({ default: mammoth }) => mammoth.convertToHtml({ arrayBuffer })))
        .then(({ value }) => import("dompurify").then(({ default: purifier }) => {
          setDocxHtml(purifier.sanitize(value));
        }))
        .catch((error) => setPreviewError(error.message || "Не вдалося відобразити документ."));
    }
  }, [blob, file.name]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const isDocx = file.name.toLowerCase().endsWith(".docx");

  return (
    <div className="drivers-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="drivers-preview" role="dialog" aria-modal="true" aria-label={`Перегляд файла ${file.name}`}>
        <header><strong>{file.name}</strong><button type="button" onClick={onClose} aria-label="Закрити">×</button></header>
        {previewError ? <p role="alert">{previewError}</p>
          : isImage ? <img src={url} alt={file.name} />
            : isPdf ? <iframe title={file.name} src={url} />
              : isDocx ? (docxHtml
                ? <article className="drivers-docx-preview" dangerouslySetInnerHTML={{ __html: docxHtml }} />
                : <p>Завантаження документа…</p>)
                : <p>Попередній перегляд цього формату недоступний. Завантажте файл, щоб відкрити його.</p>}
      </section>
    </div>
  );
}

function DriversPage() {
  const { apiData } = useApi();
  const [drivers, setDrivers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState({ assignments: [], trips: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [driverForm, setDriverForm] = useState(null);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [documentForm, setDocumentForm] = useState(null);
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const selectedDriver = drivers.find((driver) => driver.id === selectedId);

  const loadDrivers = useCallback(async () => {
    const response = await fetch(`${apiData}/fleet/drivers?includeArchived=${includeArchived}`, { credentials: "include" });
    const result = await readResponse(response);
    setDrivers(result);
    setSelectedId((current) => result.some((driver) => driver.id === current) ? current : (result[0]?.id ?? null));
    setError("");
  }, [apiData, includeArchived]);

  useEffect(() => {
    let cancelled = false;
    const task = window.setTimeout(() => {
      setLoading(true);
      loadDrivers().catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Не вдалося завантажити водіїв.");
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(task);
    };
  }, [loadDrivers]);

  const loadDetails = useCallback(async () => {
    if (!selectedId) {
      setDocuments([]);
      setHistory({ assignments: [], trips: [] });
      return;
    }
    const [documentsResponse, historyResponse] = await Promise.all([
      fetch(`${apiData}/fleet/drivers/${selectedId}/documents`, { credentials: "include" }),
      fetch(`${apiData}/fleet/drivers/${selectedId}/history`, { credentials: "include" }),
    ]);
    const [driverDocuments, driverHistory] = await Promise.all([
      readResponse(documentsResponse),
      readResponse(historyResponse),
    ]);
    setDocuments(driverDocuments);
    setHistory(driverHistory);
  }, [apiData, selectedId]);

  useEffect(() => {
    let cancelled = false;
    const task = window.setTimeout(() => {
      loadDetails().catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Не вдалося завантажити історію та документи водія.");
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(task);
    };
  }, [loadDetails]);

  const saveDriver = async (event) => {
    event.preventDefault();
    try {
      const editing = editingDriverId !== null;
      const response = await fetch(`${apiData}/fleet/drivers${editing ? `/${editingDriverId}` : ""}`, {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driverForm),
      });
      const saved = await readResponse(response);
      setDriverForm(null);
      setEditingDriverId(null);
      await loadDrivers();
      setSelectedId(editing ? editingDriverId : saved.id);
    } catch (saveError) {
      setError(saveError.message || "Не вдалося зберегти водія.");
    }
  };

  const archiveDriver = async (driver, archived) => {
    try {
      const response = await fetch(`${apiData}/fleet/drivers/${driver.id}/archive?archived=${archived}`, {
        method: "PUT",
        credentials: "include",
      });
      await readResponse(response);
      await loadDrivers();
    } catch (archiveError) {
      setError(archiveError.message || "Не вдалося змінити статус архіву.");
    }
  };

  const saveDocument = async (event) => {
    event.preventDefault();
    if (!selectedDriver) return;
    try {
      const editing = editingDocumentId !== null;
      const path = `${apiData}/fleet/drivers/${selectedDriver.id}/documents${editing ? `/${editingDocumentId}` : ""}`;
      const response = await fetch(path, {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentForm),
      });
      const saved = await readResponse(response);
      const documentId = editing ? editingDocumentId : saved.id;
      if (!editing) setEditingDocumentId(documentId);
      if (documentFile) {
        const body = new FormData();
        body.append("file", documentFile);
        const uploadResponse = await fetch(`${apiData}/fleet/drivers/${selectedDriver.id}/documents/${documentId}/file`, {
          method: "POST",
          credentials: "include",
          body,
        });
        await readResponse(uploadResponse);
      }
      setDocumentForm(null);
      setEditingDocumentId(null);
      setDocumentFile(null);
      await loadDetails();
      await loadDrivers();
    } catch (saveError) {
      setError(saveError.message || "Не вдалося зберегти документ водія.");
    }
  };

  const deleteDocument = async (document) => {
    if (!window.confirm(`Видалити документ «${document.type}»?`)) return;
    try {
      const response = await fetch(`${apiData}/fleet/drivers/${selectedId}/documents/${document.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await readResponse(response);
      await loadDetails();
      await loadDrivers();
    } catch (deleteError) {
      setError(deleteError.message || "Не вдалося видалити документ.");
    }
  };

  const retrieveFile = async (document, previewFile) => {
    try {
      const response = await fetch(`${apiData}/fleet/drivers/${selectedId}/documents/${document.id}/file`, { credentials: "include" });
      if (!response.ok) await readResponse(response);
      const blob = await response.blob();
      const metadata = document.files?.[0];
      if (!metadata) throw new Error("Файл документа не знайдений.");
      if (previewFile) {
        setPreview({
          file: { ...metadata, name: metadata.originalFileName, type: metadata.contentType },
          blob,
        });
      }
      else {
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        link.href = url;
        link.download = metadata.originalFileName;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (fileError) {
      setError(fileError.message || "Не вдалося відкрити файл документа.");
    }
  };

  return (
    <main className="drivers-page">
      <header className="drivers-heading">
        <div><span className="drivers-eyebrow">УПРАВЛІННЯ АВТОПАРКОМ</span><h1>Водії</h1><p>Контакти, документи, призначення та історія рейсів.</p></div>
        <button type="button" className="drivers-primary" onClick={() => {
          setEditingDriverId(null);
          setDriverForm({ ...blankDriver });
        }}>+ Додати водія</button>
      </header>

      {error && <div className="drivers-error" role="alert">{error}<button type="button" onClick={() => setError("")}>×</button></div>}
      <div className="drivers-layout">
        <aside className="drivers-list-panel">
          <div className="drivers-list-title"><h2>Водії автопарку</h2><label><input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} /> Архів</label></div>
          {loading ? <p className="drivers-empty">Завантаження…</p> : drivers.map((driver) => (
            <button type="button" key={driver.id} className={`drivers-list-item${driver.id === selectedId ? " is-active" : ""}`} onClick={() => setSelectedId(driver.id)}>
              <span className="drivers-avatar">{driver.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
              <span className="drivers-list-info"><strong>{driver.fullName}</strong><small>{driver.phone}</small><small>{driver.currentVehicle ? `${driver.currentVehicle.plate} · ${driver.currentVehicle.make}` : "Автомобіль не призначено"}</small></span>
              {driver.isArchived && <span className="drivers-archived">Архів</span>}
            </button>
          ))}
          {!loading && !drivers.length && <p className="drivers-empty">Водіїв не знайдено.</p>}
        </aside>

        <section className="drivers-content">
          {!selectedDriver ? <div className="drivers-empty-state"><h2>Оберіть водія</h2><p>Додайте водія, щоб почати вести документи та історію рейсів.</p></div> : (
            <>
              <header className="drivers-profile-header">
                <div><h2>{selectedDriver.fullName}</h2><p>{selectedDriver.phone}{selectedDriver.email ? ` · ${selectedDriver.email}` : ""}</p></div>
                <div className="drivers-actions">
                  <button type="button" onClick={() => {
                    setEditingDriverId(selectedDriver.id);
                    setDriverForm({
                      fullName: selectedDriver.fullName,
                      phone: selectedDriver.phone,
                      email: selectedDriver.email || "",
                      additionalContact: selectedDriver.additionalContact || "",
                      notes: selectedDriver.notes || "",
                    });
                  }}>Редагувати</button>
                  <button type="button" onClick={() => archiveDriver(selectedDriver, !selectedDriver.isArchived)}>
                    {selectedDriver.isArchived ? "Відновити" : "Архівувати"}
                  </button>
                </div>
              </header>
              <div className="drivers-summary">
                <div><span>Поточний автомобіль</span><strong>{selectedDriver.currentVehicle ? `${selectedDriver.currentVehicle.plate} · ${selectedDriver.currentVehicle.make}` : "Не призначено"}</strong></div>
                <div><span>Документи</span><strong>{documents.length}</strong></div>
                <div><span>Рейси в історії</span><strong>{history.trips.length}</strong></div>
              </div>
              {selectedDriver.additionalContact && <p className="drivers-note"><strong>Додатковий контакт:</strong> {selectedDriver.additionalContact}</p>}
              {selectedDriver.notes && <p className="drivers-note"><strong>Примітки:</strong> {selectedDriver.notes}</p>}

              <section className="drivers-section">
                <div className="drivers-section-heading"><div><h3>Документи водія</h3><p>Термін дії та прикріплені файли</p></div>
                  {!selectedDriver.isArchived && <button type="button" className="drivers-primary" onClick={() => {
                    setEditingDocumentId(null);
                    setDocumentForm({ ...blankDocument });
                    setDocumentFile(null);
                  }}>+ Додати документ</button>}
                </div>
                <div className="drivers-document-list">
                  {documents.map((document) => {
                    const expiry = documentExpiry(document);
                    return <article key={document.id} className="drivers-document">
                      <div className="drivers-document-main"><strong>{document.type}</strong><span>{document.number || "Номер не вказано"}</span><span>{document.issueDate ? `Виданий ${document.issueDate}` : ""}{document.expiryDate ? ` · до ${document.expiryDate}` : ""}</span>{document.comment && <small>{document.comment}</small>}</div>
                      <span className={`drivers-expiry ${expiry.className}`}>{expiry.label}</span>
                      <div className="drivers-document-actions">
                        {document.files?.length > 0 ? <>
                          <button type="button" className="drivers-file-name" title={`Відкрити ${document.files[0].originalFileName}`} onClick={() => retrieveFile(document, true)}>{document.files[0].originalFileName}</button>
                          <button type="button" onClick={() => retrieveFile(document, true)}>Переглянути</button>
                          <button type="button" onClick={() => retrieveFile(document, false)}>Завантажити</button>
                        </> : <span className="drivers-no-file">Файл відсутній</span>}
                        {!selectedDriver.isArchived && <>
                          <button type="button" onClick={() => {
                            setEditingDocumentId(document.id);
                            setDocumentForm({
                              type: document.type,
                              number: document.number || "",
                              issueDate: document.issueDate || "",
                              expiryDate: document.expiryDate || "",
                              comment: document.comment || "",
                            });
                            setDocumentFile(null);
                          }}>Змінити</button>
                          <button type="button" className="is-danger" onClick={() => deleteDocument(document)}>Видалити</button>
                        </>}
                      </div>
                      {!selectedDriver.isArchived && <label className="drivers-replace-file">Завантажити / замінити файл<input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={async (event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        if (file.size > 20 * 1024 * 1024) { setError("Розмір файла не повинен перевищувати 20 МБ."); return; }
                        const form = new FormData();
                        form.append("file", file);
                        try {
                          const response = await fetch(`${apiData}/fleet/drivers/${selectedId}/documents/${document.id}/file`, { method: "POST", credentials: "include", body: form });
                          await readResponse(response);
                          await loadDetails();
                        } catch (uploadError) { setError(uploadError.message || "Не вдалося завантажити файл."); }
                      }} /></label>}
                    </article>;
                  })}
                  {!documents.length && <p className="drivers-empty">Документів ще не додано.</p>}
                </div>
              </section>

              <section className="drivers-section">
                <div className="drivers-section-heading"><div><h3>Історія призначень</h3><p>Автомобілі, за якими закріплювали водія</p></div></div>
                <div className="drivers-history-list">{history.assignments.map((assignment) => <article key={assignment.id}>
                  <strong>{assignment.vehicle}</strong><span>{new Date(assignment.startedAt).toLocaleDateString("uk-UA")} — {assignment.endedAt ? new Date(assignment.endedAt).toLocaleDateString("uk-UA") : "Поточне"}</span>
                  {assignment.changeReason && <small>{assignment.changeReason}</small>}
                </article>)}
                {!history.assignments.length && <p className="drivers-empty">Історії призначень ще немає.</p>}</div>
              </section>

              <section className="drivers-section">
                <div className="drivers-section-heading"><div><h3>Історія рейсів</h3><p>Збережено водія та автомобіль, які виконували кожен рейс</p></div></div>
                <div className="drivers-trip-list">{history.trips.map((trip) => <article key={trip.id}>
                  <div><strong>{trip.title}</strong><span>{trip.vehiclePlate} · {trip.status}</span></div>
                  <span>{trip.plannedStartAt ? new Date(trip.plannedStartAt).toLocaleDateString("uk-UA") : "Без дати"}</span>
                  <span>{trip.mileageKm ?? "—"} км</span>
                  <span>Залишок: {trip.balance} {trip.currency}</span>
                </article>)}
                {!history.trips.length && <p className="drivers-empty">Рейсів ще немає.</p>}</div>
              </section>
            </>
          )}
        </section>
      </div>

      {driverForm && <div className="drivers-modal-backdrop"><form className="drivers-form-modal" onSubmit={saveDriver}>
        {error && <div className="drivers-error" role="alert">{error}<button type="button" onClick={() => setError("")}>×</button></div>}
        <header><h2>{editingDriverId ? "Редагування водія" : "Новий водій"}</h2><button type="button" onClick={() => setDriverForm(null)}>×</button></header>
        <label>ПІБ<input required maxLength={160} value={driverForm.fullName} onChange={(event) => setDriverForm({ ...driverForm, fullName: event.target.value })} /></label>
        <label>Телефон<input required maxLength={40} value={driverForm.phone} onChange={(event) => setDriverForm({ ...driverForm, phone: event.target.value })} /></label>
        <label>Email<input type="email" maxLength={160} value={driverForm.email} onChange={(event) => setDriverForm({ ...driverForm, email: event.target.value })} /></label>
        <label>Додаткові контакти<input maxLength={160} value={driverForm.additionalContact} onChange={(event) => setDriverForm({ ...driverForm, additionalContact: event.target.value })} /></label>
        <label>Примітки<textarea rows={3} value={driverForm.notes} onChange={(event) => setDriverForm({ ...driverForm, notes: event.target.value })} /></label>
        <footer><button type="button" onClick={() => setDriverForm(null)}>Скасувати</button><button type="submit" className="drivers-primary">Зберегти</button></footer>
      </form></div>}

      {documentForm && <div className="drivers-modal-backdrop"><form className="drivers-form-modal" onSubmit={saveDocument}>
        {error && <div className="drivers-error" role="alert">{error}<button type="button" onClick={() => setError("")}>×</button></div>}
        <header><h2>{editingDocumentId ? "Редагування документа" : "Новий документ водія"}</h2><button type="button" onClick={() => setDocumentForm(null)}>×</button></header>
        <label>Тип документа<input required maxLength={80} value={documentForm.type} onChange={(event) => setDocumentForm({ ...documentForm, type: event.target.value })} /></label>
        <label>Номер<input maxLength={100} value={documentForm.number} onChange={(event) => setDocumentForm({ ...documentForm, number: event.target.value })} /></label>
        <div className="drivers-date-fields"><label>Дата видачі<input type="date" value={documentForm.issueDate} onChange={(event) => setDocumentForm({ ...documentForm, issueDate: event.target.value })} /></label><label>Дійсний до<input type="date" value={documentForm.expiryDate} onChange={(event) => setDocumentForm({ ...documentForm, expiryDate: event.target.value })} /></label></div>
        <label>Коментар<textarea rows={2} value={documentForm.comment} onChange={(event) => setDocumentForm({ ...documentForm, comment: event.target.value })} /></label>
        <label>Файл (PDF, DOC, DOCX, PNG, JPEG; до 20 МБ)<input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} /></label>
        <footer><button type="button" onClick={() => setDocumentForm(null)}>Скасувати</button><button type="submit" className="drivers-primary">Зберегти</button></footer>
      </form></div>}

      {preview && <DriverFilePreview file={preview.file} blob={preview.blob} onClose={() => setPreview(null)} />}
    </main>
  );
}

export default DriversPage;
