import { useMemo, useState } from "react";
import { useApiCollection } from "../hooks/useApiCollection";
import "../styles/local-modules.css";

const blankProduct = { name: "", sku: "", category: "", unit: "шт.", quantity: "0", minQuantity: "0" };
const units = ["шт.", "кг", "т", "л", "м", "м²", "пал."];

function WarehousePage() {
  const productsApi = useApiCollection("/warehouse/products");
  const movementsApi = useApiCollection("/warehouse/movements");
  const { records: products, error: productError, request } = productsApi;
  const { records: movements, error: movementError, refresh: refreshMovements } = movementsApi;
  const [form, setForm] = useState(blankProduct);
  const [movement, setMovement] = useState({ productId: "", type: "in", quantity: "", comment: "" });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const error = productError || movementError;

  const filteredProducts = useMemo(() => products.filter(product =>
    `${product.name} ${product.sku} ${product.category}`.toLocaleLowerCase("uk").includes(search.toLocaleLowerCase("uk"))),
  [products, search]);
  const lowStockCount = products.filter(product => Number(product.quantity) <= Number(product.minimumQuantity)).length;
  const totalUnits = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);

  const submitProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await request(`/warehouse/products${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          sku: form.sku.trim() || null,
          category: form.category.trim() || null,
          unit: form.unit,
          quantity: Number(form.quantity),
          minimumQuantity: Number(form.minQuantity),
        }),
      });
      setForm(blankProduct);
      setEditingId(null);
    } catch (saveError) {
      console.error("Не вдалося зберегти складську позицію.", saveError);
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, sku: product.sku || "", category: product.category || "", unit: product.unit, quantity: String(product.quantity), minQuantity: String(product.minimumQuantity) });
  };

  const addMovement = async (event) => {
    event.preventDefault();
    const productId = Number(movement.productId);
    setSaving(true);
    try {
      await request(`/warehouse/products/${productId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: movement.type, quantity: Number(movement.quantity), comment: movement.comment.trim() || null }),
      });
      await refreshMovements();
      setMovement({ productId: "", type: "in", quantity: "", comment: "" });
    } catch (saveError) {
      console.error("Не вдалося провести складську операцію.", saveError);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Видалити позицію «${product.name}»?`)) return;
    try {
      await request(`/warehouse/products/${product.id}`, { method: "DELETE" });
    } catch (deleteError) {
      console.error("Не вдалося видалити складську позицію.", deleteError);
    }
  };

  return (
    <div className="local-module">
      <header className="local-module__heading"><div><span className="local-module__eyebrow">ТОВАРНИЙ ОБЛІК</span><h1>Склад</h1><p>Власні товари, залишки, надходження та видача.</p></div></header>
      {error && <div className="local-module__error" role="alert">{error}</div>}
      <section className="local-module__metrics"><article><span>Номенклатура</span><strong>{products.length}</strong></article><article><span>Загальна кількість</span><strong>{totalUnits.toLocaleString("uk-UA")}</strong></article><article><span>Потрібне поповнення</span><strong>{lowStockCount}</strong></article></section>

      <section className="local-module__panel">
        <h2>{editingId ? "Редагування товару" : "Додати товар"}</h2>
        <form className="local-module__form" onSubmit={submitProduct}>
          <label>Назва товару<input className="form-control" maxLength="200" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Артикул / SKU<input className="form-control" maxLength="80" value={form.sku} onChange={event => setForm({ ...form, sku: event.target.value })} /></label>
          <label>Категорія<input className="form-control" maxLength="100" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} /></label>
          <label>Одиниця<select className="form-select" value={form.unit} onChange={event => setForm({ ...form, unit: event.target.value })}>{units.map(unit => <option key={unit}>{unit}</option>)}</select></label>
          <label>Поточний залишок<input className="form-control" type="number" min="0" step="0.001" value={form.quantity} onChange={event => setForm({ ...form, quantity: event.target.value })} required /></label>
          <label>Мінімальний залишок<input className="form-control" type="number" min="0" step="0.001" value={form.minQuantity} onChange={event => setForm({ ...form, minQuantity: event.target.value })} required /></label>
          <div className="local-module__form-actions"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Збереження…" : editingId ? "Зберегти зміни" : "Додати позицію"}</button>{editingId && <button className="btn btn-outline-secondary" type="button" onClick={() => { setEditingId(null); setForm(blankProduct); }}>Скасувати</button>}</div>
        </form>
      </section>

      <section className="local-module__panel">
        <h2>Операція зі складом</h2>
        {!products.length ? <p className="local-module__empty">Спочатку додайте товарну позицію.</p> : <form className="local-module__form" onSubmit={addMovement}>
          <label>Товар<select className="form-select" value={movement.productId} onChange={event => setMovement({ ...movement, productId: event.target.value })} required><option value="">Оберіть товар</option>{products.map(product => <option key={product.id} value={product.id}>{product.name} · залишок {product.quantity} {product.unit}</option>)}</select></label>
          <label>Операція<select className="form-select" value={movement.type} onChange={event => setMovement({ ...movement, type: event.target.value })}><option value="in">Надходження</option><option value="out">Видача</option></select></label>
          <label>Кількість<input className="form-control" type="number" min="0.001" step="0.001" value={movement.quantity} onChange={event => setMovement({ ...movement, quantity: event.target.value })} required /></label>
          <label>Примітка<input className="form-control" maxLength="500" value={movement.comment} onChange={event => setMovement({ ...movement, comment: event.target.value })} /></label>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Збереження…" : "Провести операцію"}</button>
        </form>}
      </section>

      <section className="local-module__panel">
        <div className="local-module__toolbar"><h2>Номенклатура</h2><input className="form-control" value={search} onChange={event => setSearch(event.target.value)} placeholder="Назва, SKU або категорія" aria-label="Пошук товару" /></div>
        <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Товар</th><th>Артикул</th><th>Категорія</th><th>Залишок</th><th>Мінімум</th><th>Стан</th><th /></tr></thead><tbody>
          {filteredProducts.map(product => <tr key={product.id}><td>{product.name}</td><td>{product.sku || "—"}</td><td>{product.category || "—"}</td><td>{product.quantity} {product.unit}</td><td>{product.minimumQuantity} {product.unit}</td><td><span className={`local-module__badge ${Number(product.quantity) <= Number(product.minimumQuantity) ? "is-warning" : "is-success"}`}>{Number(product.quantity) <= Number(product.minimumQuantity) ? "Поповнити" : "У наявності"}</span></td><td className="local-module__row-actions"><button className="btn btn-sm btn-outline-primary" type="button" onClick={() => editProduct(product)}>Змінити</button><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => deleteProduct(product)}>Видалити</button></td></tr>)}
          {!filteredProducts.length && <tr><td colSpan="7" className="local-module__empty">Товарів не знайдено.</td></tr>}
        </tbody></table></div>
      </section>

      <section className="local-module__panel"><h2>Останні операції</h2><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Дата</th><th>Товар</th><th>Операція</th><th>Кількість</th><th>Примітка</th></tr></thead><tbody>
        {movements.slice(0, 20).map(item => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString("uk-UA")}</td><td>{item.productName}</td><td>{item.type === "in" ? "Надходження" : "Видача"}</td><td>{item.quantity} {item.unit}</td><td>{item.comment || "—"}</td></tr>)}
        {!movements.length && <tr><td colSpan="5" className="local-module__empty">Операцій ще немає.</td></tr>}
      </tbody></table></div></section>
    </div>
  );
}

export default WarehousePage;
