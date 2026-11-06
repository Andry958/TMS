import { useMemo, useState } from "react";
import { useApiCollection } from "../hooks/useApiCollection";
import "../styles/local-modules.css";

const today = new Date().toISOString().slice(0, 10);
const emptyForm = { date: today, type: "income", category: "", description: "", amount: "", currency: "UAH", status: "planned" };
const currencyOptions = ["UAH", "USD", "EUR", "PLN", "GBP"];

function formatMoney(value, currency) {
  return new Intl.NumberFormat("uk-UA", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

function FinancePage() {
  const { records, loading, error, setError, request } = useApiCollection("/finance");
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const visibleRecords = useMemo(() => records.filter(record =>
    (filter === "all" || record.type === filter) &&
    `${record.description} ${record.category}`.toLocaleLowerCase("uk").includes(search.toLocaleLowerCase("uk"))),
  [filter, records, search]);
  const totalsByCurrency = useMemo(() => records.reduce((totals, record) => {
    const sign = record.type === "income" ? 1 : -1;
    const bucket = totals[record.currency] || { paid: 0, planned: 0 };
    bucket[record.status === "paid" ? "paid" : "planned"] += sign * Number(record.amount);
    totals[record.currency] = bucket;
    return totals;
  }, {}), [records]);

  const addTransaction = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await request("/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount), category: form.category.trim() || null }),
      });
      setForm({ ...emptyForm, date: today });
    } catch (saveError) {
      console.error("Не вдалося зберегти фінансовий запис.", saveError);
    } finally {
      setSaving(false);
    }
  };

  const removeTransaction = async (id) => {
    if (!window.confirm("Видалити цей фінансовий запис?")) return;
    try {
      await request(`/finance/${id}`, { method: "DELETE" });
    } catch (deleteError) {
      console.error("Не вдалося видалити фінансовий запис.", deleteError);
    }
  };

  return (
    <div className="local-module">
      <header className="local-module__heading"><div><span className="local-module__eyebrow">ОБЛІК КОМПАНІЇ</span><h1>Фінанси</h1><p>Доходи, витрати та заплановані платежі.</p></div></header>
      {error && <div className="local-module__error" role="alert">{error}</div>}
      <section className="local-module__metrics" aria-label="Підсумки за валютами">
        {Object.keys(totalsByCurrency).length === 0
          ? <article><span>Баланс</span><strong>{loading ? "Завантаження…" : "Додайте перший запис"}</strong></article>
          : Object.entries(totalsByCurrency).map(([currency, totals]) => <article key={currency}><span>Сплачений баланс · {currency}</span><strong>{formatMoney(totals.paid, currency)}</strong><small>З урахуванням запланованих: {formatMoney(totals.paid + totals.planned, currency)}</small></article>)}
        <article><span>Усього записів</span><strong>{records.length}</strong></article>
      </section>

      <section className="local-module__panel">
        <h2>Новий фінансовий запис</h2>
        <form className="local-module__form" onSubmit={addTransaction}>
          <label>Тип<select className="form-select" value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}><option value="income">Надходження</option><option value="expense">Витрата</option></select></label>
          <label>Дата<input className="form-control" type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} required /></label>
          <label>Категорія<input className="form-control" maxLength="80" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="Оплата клієнта, пальне…" /></label>
          <label>Опис<input className="form-control" maxLength="300" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} required /></label>
          <label>Сума<input className="form-control" type="number" min="0.01" max="1000000000" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} required /></label>
          <label>Валюта<select className="form-select" value={form.currency} onChange={event => setForm({ ...form, currency: event.target.value })}>{currencyOptions.map(currency => <option key={currency}>{currency}</option>)}</select></label>
          <label>Стан платежу<select className="form-select" value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}><option value="planned">Заплановано</option><option value="paid">Сплачено</option></select></label>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Збереження…" : "Додати запис"}</button>
        </form>
      </section>

      <section className="local-module__panel">
        <div className="local-module__toolbar"><h2>Рух коштів</h2><div><select className="form-select" value={filter} onChange={event => setFilter(event.target.value)} aria-label="Фільтр типу"><option value="all">Усі типи</option><option value="income">Надходження</option><option value="expense">Витрати</option></select><input className="form-control" value={search} onChange={event => setSearch(event.target.value)} placeholder="Пошук" aria-label="Пошук фінансових записів" /></div></div>
        <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Дата</th><th>Опис</th><th>Категорія</th><th>Тип</th><th>Стан</th><th className="text-end">Сума</th><th /></tr></thead>
          <tbody>{visibleRecords.map(record => <tr key={record.id}><td>{record.date}</td><td>{record.description}</td><td>{record.category || "—"}</td><td>{record.type === "income" ? "Надходження" : "Витрата"}</td><td><span className={`local-module__badge ${record.status === "paid" ? "is-success" : "is-warning"}`}>{record.status === "paid" ? "Сплачено" : "Заплановано"}</span></td><td className="text-end">{formatMoney(record.amount, record.currency)}</td><td><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => removeTransaction(record.id)}>Видалити</button></td></tr>)}
            {!loading && visibleRecords.length === 0 && <tr><td colSpan="7" className="local-module__empty">Записів поки немає.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  );
}

export default FinancePage;
