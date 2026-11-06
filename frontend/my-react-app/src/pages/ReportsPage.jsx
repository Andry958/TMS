import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApiCollection } from "../hooks/useApiCollection";
import "../styles/local-modules.css";

function formatMoney(value, currency) {
  return new Intl.NumberFormat("uk-UA", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${/^[=+\-@\t\r]/.test(text) ? `'${text}` : text.replaceAll('"', '""')}"`;
}

function downloadCsv(fileName, rows) {
  const content = `\uFEFF${rows.map(row => row.map(csvCell).join(";")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const ordersApi = useApiCollection("/orders");
  const financeApi = useApiCollection("/finance");
  const warehouseApi = useApiCollection("/warehouse/products");
  const { records: orders, loading } = ordersApi;
  const { records: finance, loading: financeLoading } = financeApi;
  const { records: products, loading: productsLoading } = warehouseApi;
  const error = ordersApi.error || financeApi.error || warehouseApi.error;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filteredOrders = useMemo(() => orders.filter(order => {
    const date = String(order.orderDate || "").slice(0, 10);
    return (!from || date >= from) && (!to || date <= to);
  }), [from, orders, to]);
  const filteredFinance = useMemo(() => finance.filter(item => {
    const date = String(item.date || "").slice(0, 10);
    return (!from || date >= from) && (!to || date <= to);
  }), [finance, from, to]);
  const orderRateTotals = useMemo(() => filteredOrders.reduce((totals, order) => {
    const currency = order.currency || "UAH";
    totals[currency] = (totals[currency] || 0) + Number(order.initialRate || 0);
    return totals;
  }, {}), [filteredOrders]);
  const orderStatusCounts = useMemo(() => filteredOrders.reduce((counts, order) => {
    counts[order.status] = (counts[order.status] || 0) + 1;
    return counts;
  }, {}), [filteredOrders]);
  const financeTotals = useMemo(() => filteredFinance.reduce((totals, item) => {
    const currency = item.currency || "UAH";
    const bucket = totals[currency] || { income: 0, expense: 0 };
    bucket[item.type === "income" ? "income" : "expense"] += Number(item.amount || 0);
    totals[currency] = bucket;
    return totals;
  }, {}), [filteredFinance]);
  const lowStockCount = products.filter(product => Number(product.quantity) <= Number(product.minimumQuantity)).length;

  const exportOrders = () => downloadCsv("tms-orders-report.csv", [
    ["№ замовлення", "Дата", "Клієнт", "Маршрут", "Вантаж", "Статус", "Ставка", "Валюта"],
    ...filteredOrders.map(order => [
      order.clientOrderNumber || order.id,
      String(order.orderDate || "").slice(0, 10),
      order.clientName || "",
      `${order.loadingCity || ""} — ${order.deliveryCity || ""}`,
      order.cargoDescription || "",
      order.status || "",
      order.initialRate || 0,
      order.currency || "UAH",
    ]),
  ]);
  const exportFinance = () => downloadCsv("tms-finance-report.csv", [
    ["Дата", "Тип", "Опис", "Категорія", "Сума", "Валюта", "Статус"],
    ...filteredFinance.map(item => [item.date, item.type === "income" ? "Надходження" : "Витрата", item.description, item.category, item.amount, item.currency, item.status]),
  ]);

  return (
    <div className="local-module">
      <header className="local-module__heading"><div><span className="local-module__eyebrow">АНАЛІТИКА TMS</span><h1>Звіти</h1><p>Операційні підсумки на основі замовлень, фінансів і складу.</p></div></header>
      {error && <div className="local-module__error" role="alert">Частина даних недоступна: {error}</div>}
      <section className="local-module__panel">
        <div className="local-module__toolbar"><h2>Період звіту</h2><div><label>Від<input className="form-control" type="date" value={from} onChange={event => setFrom(event.target.value)} /></label><label>До<input className="form-control" type="date" value={to} onChange={event => setTo(event.target.value)} /></label></div></div>
        <section className="local-module__metrics">
          <article><span>Замовлень у періоді</span><strong>{loading ? "…" : filteredOrders.length}</strong></article>
          <article><span>Активні</span><strong>{filteredOrders.filter(order => !["Completed", "Cancelled"].includes(order.status)).length}</strong></article>
          <article><span>Загальна кількість товарних позицій</span><strong>{products.length}</strong></article>
          <article><span>Фінансових записів у періоді</span><strong>{financeLoading ? "…" : filteredFinance.length}</strong></article>
        </section>
        <h3 className="local-module__subheading">Суми замовлень за валютами</h3>
        <div className="local-module__currency-list">{Object.keys(orderRateTotals).length
          ? Object.entries(orderRateTotals).map(([currency, total]) => <span key={currency}>{new Intl.NumberFormat("uk-UA", { style: "currency", currency }).format(total)}</span>)
          : <span>Немає замовлень за обраний період.</span>}</div>
        <div className="local-module__export-actions"><button className="btn btn-primary" type="button" onClick={exportOrders}>Експорт замовлень у CSV</button><button className="btn btn-outline-primary" type="button" onClick={exportFinance}>Експорт фінансів у CSV</button></div>
      </section>
      <section className="local-module__panel"><h2>Звіти та показники</h2><div className="local-module__report-grid">
        <Link className="local-module__report-card" to="/orders">
          <strong>Замовлення</strong>
          <span>{loading ? "Завантаження…" : `${filteredOrders.length} за вибраний період`}</span>
          <small>{loading ? "Підсумки завантажуються…" : `У роботі: ${(orderStatusCounts.New || 0) + (orderStatusCounts.InProgress || 0)} · Завершені: ${orderStatusCounts.Completed || 0} · Скасовані: ${orderStatusCounts.Cancelled || 0}`}</small>
          {Object.entries(orderRateTotals).map(([currency, total]) => <small key={currency}>Сума ставок: {formatMoney(total, currency)}</small>)}
        </Link>
        <Link className="local-module__report-card" to="/finance">
          <strong>Фінанси</strong>
          <span>{financeLoading ? "Завантаження…" : `${filteredFinance.length} записів за вибраний період`}</span>
          {financeLoading ? <small>Підсумки завантажуються…</small> : Object.keys(financeTotals).length
            ? <>
              {Object.entries(financeTotals).map(([currency, totals]) => <small key={currency}>Надходження: {formatMoney(totals.income, currency)} · Витрати: {formatMoney(totals.expense, currency)} · Баланс: {formatMoney(totals.income - totals.expense, currency)}</small>)}
              <small>Враховані також заплановані платежі.</small>
            </>
            : <small>Немає фінансових записів за вибраний період.</small>}
        </Link>
        <Link className="local-module__report-card" to="/warehouse">
          <strong>Склад</strong>
          <span>{productsLoading ? "Завантаження…" : `${products.length} товарних позицій`}</span>
          <small>{productsLoading ? "Перевірка залишків…" : `Потрібне поповнення: ${lowStockCount}`}</small>
        </Link>
      </div></section>
    </div>
  );
}

export default ReportsPage;
