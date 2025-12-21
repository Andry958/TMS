import { useState, useEffect } from "react";
import { useCompany } from "../context/CompanyContext";

const API_URL = "https://localhost:7060/api/company";

/* ================= ВАЛЮТИ ================= */
const currencies = [
  { code: "AUD", name: "Австралійський долар" },
  { code: "UAH", name: "Українська гривня" },
  { code: "AZN", name: "Азербайджанський манат" },
  { code: "DZD", name: "Алжирський динар" },
  { code: "THB", name: "Бат" },
  { code: "BGN", name: "Болгарський лев" },
  { code: "KRW", name: "Вона" },
  { code: "HKD", name: "Гонконгівський долар" },
  { code: "DKK", name: "Данська крона" },
  { code: "AED", name: "Дирхам ОАЕ" },
  { code: "USD", name: "Долар США" },
  { code: "VND", name: "Донг" },
  { code: "EUR", name: "Євро" },
  { code: "EGP", name: "Єгипетський фунт" },
  { code: "JPY", name: "Єна" },
  { code: "PLN", name: "Злотий" },
  { code: "INR", name: "Індійська рупія" },
  { code: "CAD", name: "Канадський долар" },
  { code: "GEL", name: "Ларі" },
  { code: "LBP", name: "Ліванський фунт" },
  { code: "MYR", name: "Малайзійський ринггіт" },
  { code: "MXN", name: "Мексиканське песо" },
  { code: "MDL", name: "Молдовський лей" },
  { code: "ILS", name: "Новий ізраїльський шекель" },
  { code: "NZD", name: "Новозеландський долар" },
  { code: "NOK", name: "Норвезька крона" },
  { code: "ZAR", name: "Ренд" },
  { code: "RON", name: "Румунський лей" },
  { code: "IDR", name: "Рупія" },
  { code: "SAR", name: "Саудівський ріял" },
  { code: "RSD", name: "Сербський динар" },
  { code: "SGD", name: "Сінгапурський долар" },
  { code: "BDT", name: "Така" },
  { code: "KZT", name: "Теньге" },
  { code: "TND", name: "Туніський динар" },
  { code: "TRY", name: "Турецька ліра" },
  { code: "HUF", name: "Форинт" },
  { code: "GBP", name: "Фунт стерлінгів" },
  { code: "CZK", name: "Чеська крона" },
  { code: "SEK", name: "Шведська крона" },
  { code: "CHF", name: "Швейцарський франк" },
  { code: "CNY", name: "Юань Женьміньбі" },
  { code: "XDR", name: "СПЗ (спеціальні права запозичення)" }
];

/* ================= UI КОМПОНЕНТИ ================= */
function Section({ title, children }) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="mb-3">{title}</h5>
        <div className="row g-3">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", value, onChange }) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <input
        className="form-control"
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange }) {
  return (
    <div className="col-12">
      <label className="form-label">{label}</label>
      <textarea
        className="form-control"
        rows="3"
        name={name}
        value={value || ""}
        onChange={onChange}
      />
    </div>
  );
}

function CurrencySelect({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = currencies.find(c => c.code === value);

  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="col-md-6 position-relative">
      <label className="form-label">Валюта</label>

      <div
        className="form-control d-flex align-items-center justify-content-between"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(prev => !prev)}
      >
        <span>
          {selected ? `${selected.code} — ${selected.name}` : "Оберіть валюту"}
        </span>
        <span>▾</span>
      </div>

      {open && (
        <div
          className="border rounded mt-1 bg-white shadow-sm position-absolute w-100"
          style={{ zIndex: 1000, maxHeight: "250px", overflowY: "auto" }}
        >
          <input
            type="text"
            className="form-control border-0 border-bottom"
            placeholder="Пошук (USD, Євро...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />

          {filtered.length === 0 && (
            <div className="px-3 py-2 text-muted">
              Нічого не знайдено
            </div>
          )}

          {filtered.map(c => (
            <div
              key={c.code}
              className="px-3 py-2 currency-item"
              style={{ cursor: "pointer" }}
              onClick={() => {
                onChange(c.code);
                setOpen(false);
                setSearch("");
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f1f3f5"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {c.code} — {c.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= СТОРІНКА ================= */
function EditCompanyPage({ setActiveSection }) {
  const { companyId } = useCompany();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setActiveSection("mycompany");
      return;
    }

    fetch(`${API_URL}/${companyId}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("Помилка завантаження даних");
        setActiveSection("mycompany");
      });
  }, [companyId, setActiveSection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error();

      alert("Дані успішно оновлено!");
      setActiveSection("mycompany");
    } catch {
      alert("Помилка оновлення даних");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Завантаження...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Редагування компанії</h2>
          <p className="text-muted">
            Оновіть інформацію про компанію. Зміни будуть застосовані до всіх документів.
          </p>
        </div>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => setActiveSection("mycompany")}
        >
          ← Назад
        </button>
      </div>

      <Section title="Основна інформація">
        <Input 
          label="Назва компанії" 
          name="name" 
          value={form.name}
          onChange={handleChange} 
        />
        <Input 
          label="Тип компанії (ТОВ, ПП)" 
          name="companyType" 
          value={form.companyType}
          onChange={handleChange} 
        />
        <Input 
          label="ЄДРПОУ" 
          name="codeCompany" 
          value={form.codeCompany}
          onChange={handleChange} 
        />
        <Input 
          label="ІПН" 
          name="ipn" 
          value={form.ipn}
          onChange={handleChange} 
        />
        <Input 
          label="Система оподаткування" 
          name="taxSystem" 
          value={form.taxSystem}
          onChange={handleChange} 
        />
        <CurrencySelect
          value={form.currency}
          onChange={(val) => setForm(prev => ({ ...prev, currency: val }))}
        />
      </Section>

      <Section title="Керівництво">
        <Input 
          label="Директор" 
          name="directorFullName" 
          value={form.directorFullName}
          onChange={handleChange} 
        />
        <Input 
          label="Бухгалтер" 
          name="accountantFullName" 
          value={form.accountantFullName}
          onChange={handleChange} 
        />
      </Section>

      <Section title="Контакти">
        <Input 
          label="Телефон" 
          name="phoneNumber" 
          value={form.phoneNumber}
          onChange={handleChange} 
        />
        <Input 
          label="Email" 
          name="email" 
          type="email" 
          value={form.email}
          onChange={handleChange} 
        />
        <Input 
          label="Вебсайт" 
          name="website" 
          value={form.website}
          onChange={handleChange} 
        />
      </Section>

      <Section title="Адреси">
        <Input 
          label="Країна" 
          name="country" 
          value={form.country}
          onChange={handleChange} 
        />
        <Input 
          label="Регіон" 
          name="region" 
          value={form.region}
          onChange={handleChange} 
        />
        <Input 
          label="Місто" 
          name="city" 
          value={form.city}
          onChange={handleChange} 
        />
        <Input 
          label="Поштовий індекс" 
          name="postalCode" 
          value={form.postalCode}
          onChange={handleChange} 
        />
        <Input 
          label="Юридична адреса" 
          name="legalAddress" 
          value={form.legalAddress}
          onChange={handleChange} 
        />
        <Input 
          label="Вулиця" 
          name="streetAddress" 
          value={form.streetAddress}
          onChange={handleChange} 
        />
        <Input 
          label="Будинок" 
          name="buildingNumber" 
          value={form.buildingNumber}
          onChange={handleChange} 
        />
        <Input 
          label="Квартира" 
          name="apartmentNumber" 
          value={form.apartmentNumber}
          onChange={handleChange} 
        />
        <Input 
          label="Поштова адреса" 
          name="postalAddress" 
          value={form.postalAddress}
          onChange={handleChange} 
        />
      </Section>

      <Section title="Банківські реквізити">
        <Input 
          label="IBAN" 
          name="bankAccountNumber" 
          value={form.bankAccountNumber}
          onChange={handleChange} 
        />
        <Input 
          label="МФО" 
          name="bankMfo" 
          value={form.bankMfo}
          onChange={handleChange} 
        />
      </Section>

      <Section title="Додаткова інформація">
        <TextArea 
          label="Коментар / примітки" 
          name="additionalInfo" 
          value={form.additionalInfo}
          onChange={handleChange} 
        />
      </Section>

      <Section title="API інтеграції">
        <Input 
          label="Nova Poshta API" 
          name="apiNovaPoshtaKey" 
          value={form.apiNovaPoshtaKey}
          onChange={handleChange} 
        />
        <Input 
          label="LardyTrans API" 
          name="apiLardyTransKey" 
          value={form.apiLardyTransKey}
          onChange={handleChange} 
        />
      </Section>

      <div className="d-flex gap-2 mt-4 mb-5">
        <button className="btn btn-success" onClick={handleSubmit}>
          💾 Зберегти зміни
        </button>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => setActiveSection("mycompany")}
        >
          Скасувати
        </button>
      </div>
    </div>
  );
}

export default EditCompanyPage;