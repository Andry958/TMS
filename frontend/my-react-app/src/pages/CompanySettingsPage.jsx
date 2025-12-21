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

function Input({ label, name, type = "text", onChange }) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <input
        className="form-control"
        name={name}
        type={type}
        onChange={onChange}
      />
    </div>
  );
}

function TextArea({ label, name, onChange }) {
  return (
    <div className="col-12">
      <label className="form-label">{label}</label>
      <textarea
        className="form-control"
        rows="3"
        name={name}
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

      {/* Комбобокс */}
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

      {/* Dropdown */}
      {open && (
        <div
          className="border rounded mt-1 bg-white shadow-sm position-absolute w-100"
          style={{ zIndex: 1000, maxHeight: "250px", overflowY: "auto" }}
        >
          {/* Пошук всередині */}
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
function CompanySettingsPage({ setActiveSection }) {
  const { companyId, setCompanyId } = useCompany();

  const [form, setForm] = useState({
    name: "",
    companyType: "",
    codeCompany: "",
    ipn: "",
    taxSystem: "",
    currency: "UAH",
    directorFullName: "",
    accountantFullName: "",
    phoneNumber: "",
    email: "",
    website: "",
    country: "",
    region: "",
    city: "",
    postalCode: "",
    legalAddress: "",
    streetAddress: "",
    buildingNumber: "",
    apartmentNumber: "",
    postalAddress: "",
    bankName: [],
    bankAccountNumber: "",
    bankMfo: "",
    additionalInfo: "",
    logoPath: "",
    apiNovaPoshtaKey: "",
    apiLardyTransKey: ""
  });

  useEffect(() => {
    if (companyId) setActiveSection("mycompany");
  }, [companyId, setActiveSection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setCompanyId(data.id);
      setActiveSection("mycompany");
    } catch {
      alert("Помилка створення компанії");
    }
  };

  return (
    <div className="container mt-5">

      <div className="mb-4">
        <h2>Створення компанії</h2>
        <p className="text-muted">
          Заповніть інформацію про компанію.  
          Ці дані будуть використовуватись у документах, рахунках та інтеграціях.
        </p>
      </div>

      <Section title="Основна інформація">
        <Input label="Назва компанії" name="name" onChange={handleChange} />
        <Input label="Тип компанії (ТОВ, ПП)" name="companyType" onChange={handleChange} />
        <Input label="ЄДРПОУ" name="codeCompany" onChange={handleChange} />
        <Input label="ІПН" name="ipn" onChange={handleChange} />
        <Input label="Система оподаткування" name="taxSystem" onChange={handleChange} />
        <CurrencySelect
          value={form.currency}
          onChange={(val) => setForm(prev => ({ ...prev, currency: val }))}
        />
      </Section>

      <Section title="Керівництво">
        <Input label="Директор" name="directorFullName" onChange={handleChange} />
        <Input label="Бухгалтер" name="accountantFullName" onChange={handleChange} />
      </Section>

      <Section title="Контакти">
        <Input label="Телефон" name="phoneNumber" onChange={handleChange} />
        <Input label="Email" name="email" type="email" onChange={handleChange} />
        <Input label="Вебсайт" name="website" onChange={handleChange} />
      </Section>

      <Section title="Адреси">
        <Input label="Країна" name="country" onChange={handleChange} />
        <Input label="Регіон" name="region" onChange={handleChange} />
        <Input label="Місто" name="city" onChange={handleChange} />
        <Input label="Поштовий індекс" name="postalCode" onChange={handleChange} />
        <Input label="Юридична адреса" name="legalAddress" onChange={handleChange} />
        <Input label="Вулиця" name="streetAddress" onChange={handleChange} />
        <Input label="Будинок" name="buildingNumber" onChange={handleChange} />
        <Input label="Квартира" name="apartmentNumber" onChange={handleChange} />
        <Input label="Поштова адреса" name="postalAddress" onChange={handleChange} />
      </Section>

      <Section title="Банківські реквізити">
        <Input label="IBAN" name="bankAccountNumber" onChange={handleChange} />
        <Input label="МФО" name="bankMfo" onChange={handleChange} />
      </Section>

      <Section title="Додаткова інформація">
        <TextArea label="Коментар / примітки" name="additionalInfo" onChange={handleChange} />
      </Section>

      <Section title="API інтеграції">
        <Input label="Nova Poshta API" name="apiNovaPoshtaKey" onChange={handleChange} />
        <Input label="LardyTrans API" name="apiLardyTransKey" onChange={handleChange} />
      </Section>

      <button className="btn btn-success mt-4" onClick={handleSubmit}>
        Зберегти компанію
      </button>
    </div>
  );
}

export default CompanySettingsPage;
