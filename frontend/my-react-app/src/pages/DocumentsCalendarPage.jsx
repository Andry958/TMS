import { useEffect, useMemo, useState } from "react";
import { useApiCollection } from "../hooks/useApiCollection";
import "../styles/local-modules.css";

const blankDocument = { title: "", type: "Договір", number: "", owner: "", issueDate: "", expiryDate: "", status: "Активний", notes: "" };
const documentTypes = ["Договір", "Рахунок", "Акт", "ТТН", "Страховий поліс", "Ліцензія", "Інше"];

function expiryState(document) {
  if (!document.expiryDate) return { label: document.status, style: "" };
  const expiration = new Date(`${document.expiryDate}T00:00:00`);
  const today = new Date();
  const daysLeft = Math.ceil((expiration.setHours(0, 0, 0, 0) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000);
  if (daysLeft < 0) return { label: "Прострочений", style: "is-danger" };
  if (daysLeft <= 30) return { label: `Завершується · ${daysLeft} дн.`, style: "is-warning" };
  return { label: document.status, style: "is-success" };
}

function DocumentPreview({ document, apiData, onClose, onError }) {
  const [fileState, setFileState] = useState({ url: "", metadata: null, error: "", text: "" });
  const [docxHtml, setDocxHtml] = useState("");
  const file = document.files?.[0];

  useEffect(() => {
    if (!file) return undefined;
    let active = true;
    let objectUrl = "";
    const loadFile = async () => {
      try {
        const response = await fetch(`${apiData}/documents/${document.id}/file`, { credentials: "include" });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.message || `Не вдалося відкрити файл (${response.status}).`);
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (active) setFileState({ url: objectUrl, metadata: file, error: "", text: "" });
        if (file.contentType === "text/plain") {
          const text = await blob.text();
          if (active) setFileState(current => ({ ...current, text }));
        }
        if (file.originalFileName.toLowerCase().endsWith(".docx")) {
          const [{ default: mammoth }, { default: purifier }] = await Promise.all([import("mammoth"), import("dompurify")]);
          const result = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() });
          if (active) setDocxHtml(purifier.sanitize(result.value));
        }
      } catch (error) {
        if (active) setFileState(current => ({ ...current, error: error.message || "Не вдалося відкрити файл." }));
        onError(error.message || "Не вдалося відкрити файл документа.");
      }
    };
    loadFile();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [apiData, document.id, file, onError]);

  useEffect(() => {
    const handleKeyDown = event => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isImage = file?.contentType.startsWith("image/");
  const isPdf = file?.contentType === "application/pdf";
  const isText = file?.contentType === "text/plain";
  const isDocx = file?.originalFileName.toLowerCase().endsWith(".docx");

  return (
    <div className="document-preview-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="document-preview" role="dialog" aria-modal="true" aria-labelledby="document-preview-title">
        <header><div><span className="local-module__eyebrow">ПЕРЕГЛЯД ДОКУМЕНТА</span><h2 id="document-preview-title">{file?.originalFileName || document.title}</h2></div><div className="document-preview__actions">
          {file && <a className="btn btn-outline-primary" href={`${apiData}/documents/${document.id}/file?download=true`} onClick={async event => {
            event.preventDefault();
            try {
              const response = await fetch(`${apiData}/documents/${document.id}/file?download=true`, { credentials: "include" });
              if (!response.ok) throw new Error(`Не вдалося завантажити файл (${response.status}).`);
              const url = URL.createObjectURL(await response.blob());
              const link = window.document.createElement("a");
              link.href = url;
              link.download = file.originalFileName;
              link.click();
              window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch (error) { onError(error.message || "Не вдалося завантажити файл."); }
          }}>Завантажити</a>}
          <button className="btn btn-outline-secondary" type="button" onClick={onClose} aria-label="Закрити">Закрити</button>
        </div></header>
        <div className="document-preview__body">
          {!file && <p>До цього запису файл не доданий.</p>}
          {file && !fileState.url && !fileState.error && <p role="status">Завантаження документа…</p>}
          {fileState.error && <p role="alert">{fileState.error}</p>}
          {!fileState.error && isPdf && fileState.url && <iframe title={file.originalFileName} src={fileState.url} />}
          {!fileState.error && isImage && fileState.url && <img src={fileState.url} alt={file.originalFileName} />}
          {!fileState.error && isText && fileState.url && <pre>{fileState.text || "Завантаження тексту…"}</pre>}
          {!fileState.error && isDocx && docxHtml && <article dangerouslySetInnerHTML={{ __html: docxHtml }} />}
          {file && !fileState.error && !isPdf && !isImage && !isText && !isDocx && <p>Попередній перегляд цього формату недоступний. Файл можна завантажити.</p>}
          {file && isDocx && !docxHtml && !fileState.error && <p role="status">Відкриваємо DOCX…</p>}
        </div>
      </section>
    </div>
  );
}

function DocumentsCalendarPage() {
  const { records, loading, error, setError, request, refresh, apiData } = useApiCollection("/documents");
  const [form, setForm] = useState(blankDocument);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);
  const [saving, setSaving] = useState(false);

  const filteredDocuments = useMemo(() => records.filter(document =>
    (!typeFilter || document.type === typeFilter) &&
    `${document.title} ${document.number} ${document.owner}`.toLocaleLowerCase("uk").includes(search.toLocaleLowerCase("uk"))),
  [records, search, typeFilter]);
  const urgentCount = records.filter(document => ["is-danger", "is-warning"].includes(expiryState(document).style)).length;

  const saveDocument = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const path = `/documents${editingId ? `/${editingId}` : ""}`;
      const saved = await request(path, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, number: form.number.trim() || null, owner: form.owner.trim() || null, notes: form.notes.trim() || null }),
      });
      if (file) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch(`${apiData}/documents/${saved.id}/file`, { method: "POST", credentials: "include", body });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || `Не вдалося завантажити документ (${response.status}).`);
      }
      await refresh();
      setForm(blankDocument);
      setFile(null);
      setEditingId(null);
    } catch (saveError) {
      setError(saveError.message || "Не вдалося зберегти документ.");
      console.error("Не вдалося зберегти картку документа.", saveError);
    } finally {
      setSaving(false);
    }
  };

  const editDocument = document => {
    setEditingId(document.id);
    setFile(null);
    setForm({ title: document.title, type: document.type, number: document.number || "", owner: document.owner || "", issueDate: document.issueDate || "", expiryDate: document.expiryDate || "", status: document.status, notes: document.notes || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeDocument = async document => {
    if (!window.confirm(`Видалити документ «${document.title}» разом із файлом?`)) return;
    try {
      await request(`/documents/${document.id}`, { method: "DELETE" });
      if (previewDocument?.id === document.id) setPreviewDocument(null);
    } catch (deleteError) {
      console.error("Не вдалося видалити картку документа.", deleteError);
    }
  };

  const deleteFile = async document => {
    if (!window.confirm(`Видалити файл «${document.files[0].originalFileName}»?`)) return;
    try {
      await request(`/documents/${document.id}/file`, { method: "DELETE" });
      if (previewDocument?.id === document.id) setPreviewDocument(null);
    } catch (deleteError) {
      console.error("Не вдалося видалити файл документа.", deleteError);
    }
  };

  return (
    <div className="local-module">
      <header className="local-module__heading"><div><span className="local-module__eyebrow">РЕЄСТР КОМПАНІЇ</span><h1>Документи</h1><p>Єдиний реєстр, вкладені файли та контроль строків дії.</p></div></header>
      {error && <div className="local-module__error" role="alert">{error}</div>}
      <section className="local-module__metrics"><article><span>Документів у реєстрі</span><strong>{records.length}</strong></article><article><span>Потребують уваги</span><strong>{urgentCount}</strong></article><article><span>З файлами</span><strong>{records.filter(document => document.files?.length).length}</strong></article></section>

      <section className="local-module__panel">
        <h2>{editingId ? "Редагувати документ" : "Додати документ"}</h2>
        <form className="local-module__form" onSubmit={saveDocument}>
          <label>Назва<input className="form-control" maxLength="200" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} required /></label>
          <label>Тип<select className="form-select" value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}>{documentTypes.map(type => <option key={type}>{type}</option>)}</select></label>
          <label>Номер<input className="form-control" maxLength="100" value={form.number} onChange={event => setForm({ ...form, number: event.target.value })} /></label>
          <label>Пов'язана особа / компанія<input className="form-control" maxLength="200" value={form.owner} onChange={event => setForm({ ...form, owner: event.target.value })} /></label>
          <label>Дата документа<input className="form-control" type="date" value={form.issueDate} onChange={event => setForm({ ...form, issueDate: event.target.value })} /></label>
          <label>Дійсний до<input className="form-control" type="date" value={form.expiryDate} onChange={event => setForm({ ...form, expiryDate: event.target.value })} /></label>
          <label>Стан<select className="form-select" value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}><option>Активний</option><option>Чернетка</option><option>Архівний</option></select></label>
          <label>Примітка<input className="form-control" maxLength="1000" value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></label>
          <label className="local-module__file-input">Файл (до 20 МБ)<input className="form-control" type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" onChange={event => setFile(event.target.files?.[0] || null)} />{file && <small>{file.name}</small>}</label>
          <div className="local-module__form-actions"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Збереження…" : editingId ? "Зберегти документ" : "Додати до реєстру"}</button>{editingId && <button className="btn btn-outline-secondary" type="button" onClick={() => { setEditingId(null); setFile(null); setForm(blankDocument); }}>Скасувати</button>}</div>
        </form>
        <p className="local-module__note">Підтримуються PDF, DOC, DOCX, TXT, PNG та JPEG. Максимальний розмір файла — 20 МБ.</p>
      </section>

      <section className="local-module__panel">
        <div className="local-module__toolbar"><h2>Реєстр</h2><div><select className="form-select" value={typeFilter} onChange={event => setTypeFilter(event.target.value)} aria-label="Фільтр типу документа"><option value="">Усі типи</option>{documentTypes.map(type => <option key={type}>{type}</option>)}</select><input className="form-control" value={search} onChange={event => setSearch(event.target.value)} placeholder="Назва, номер, особа" aria-label="Пошук документів" /></div></div>
        <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Документ</th><th>Тип</th><th>Номер</th><th>Власник / компанія</th><th>Дата</th><th>Дійсний до</th><th>Стан</th><th>Файл</th><th>Дії</th></tr></thead><tbody>
          {filteredDocuments.map(document => {
            const state = expiryState(document);
            const attachedFile = document.files?.[0];
            return <tr key={document.id}><td><strong>{document.title}</strong>{document.notes && <small className="local-module__secondary">{document.notes}</small>}</td><td>{document.type}</td><td>{document.number || "—"}</td><td>{document.owner || "—"}</td><td>{document.issueDate || "—"}</td><td>{document.expiryDate || "Без строку"}</td><td><span className={`local-module__badge ${state.style}`}>{state.label}</span></td><td>{attachedFile ? <button className="local-module__file-link" type="button" onClick={() => setPreviewDocument(document)}>{attachedFile.originalFileName}</button> : "—"}</td><td className="local-module__row-actions"><button className="btn btn-sm btn-outline-primary" type="button" onClick={() => setPreviewDocument(document)}>Відкрити</button>{attachedFile && <a className="btn btn-sm btn-outline-secondary" href={`${apiData}/documents/${document.id}/file?download=true`}>Завантажити</a>}<button className="btn btn-sm btn-outline-primary" type="button" onClick={() => editDocument(document)}>Змінити</button>{attachedFile && <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => deleteFile(document)}>Видалити файл</button>}<button className="btn btn-sm btn-outline-danger" type="button" onClick={() => removeDocument(document)}>Видалити</button></td></tr>;
          })}
          {!loading && !filteredDocuments.length && <tr><td colSpan="9" className="local-module__empty">Документів не знайдено.</td></tr>}
          {loading && <tr><td colSpan="9" className="local-module__empty">Завантаження реєстру…</td></tr>}
        </tbody></table></div>
      </section>
      {previewDocument && <DocumentPreview document={previewDocument} apiData={apiData} onClose={() => setPreviewDocument(null)} onError={setError} />}
    </div>
  );
}

export default DocumentsCalendarPage;
