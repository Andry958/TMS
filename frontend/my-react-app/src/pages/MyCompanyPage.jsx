import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";

const API_URL = "https://localhost:7060/api/company";

function Section({ title, children }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-3">{title}</h5>
        {children}
      </div>
    </div>
  );
}

function MyCompanyPage({ setActiveSection }) {
  const { companyId, setCompanyId, logout } = useCompany();
  const [company, setCompany] = useState(null);
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!companyId) return;

    fetch(`${API_URL}/${companyId}`)
      .then(res => res.json())
      .then(data => setCompany(data))
      .catch(err => console.error(err));
  }, [companyId]);

  if (!companyId) {
    const handleLogin = async (e) => {
      e.preventDefault();

      if (!companyIdInput.trim()) {
        setError("Введіть ID компанії");
        return;
      }

      const res = await fetch(`${API_URL}/${companyIdInput}`);
      if (!res.ok) {
        setError("Компанія не знайдена");
        return;
      }

      setCompanyId(parseInt(companyIdInput));
      setError("");
    };

    return (
      <div className="container mt-5">
        <div className="card p-4 shadow-sm col-md-6 mx-auto">
          <h4 className="mb-3">Вхід до компанії</h4>
          <div>
            <input
              className="form-control mb-3"
              type="number"
              placeholder="ID компанії"
              value={companyIdInput}
              onChange={e => setCompanyIdInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin(e)}
            />
            {error && <div className="alert alert-danger">{error}</div>}
            <button className="btn btn-primary w-100" onClick={handleLogin}>
              Увійти
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
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
        <h2>{company.name}</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setActiveSection("editcompany")}
          >
            ✏️ Редагувати
          </button>
          <button className="btn btn-danger" onClick={logout}>
            🚪 Вийти
          </button>
        </div>
      </div>

      {/* ===== РЯД 1 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Основна інформація">
            <p><strong>Тип:</strong> {company.companyType || "—"}</p>
            <p><strong>ЄДРПОУ:</strong> {company.codeCompany || "—"}</p>
            <p><strong>ІПН:</strong> {company.ipn || "—"}</p>
            <p><strong>Податкова система:</strong> {company.taxSystem || "—"}</p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Керівництво">
            <p><strong>Директор:</strong> {company.directorFullName || "—"}</p>
            <p><strong>Бухгалтер:</strong> {company.accountantFullName || "—"}</p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 2 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Контактна інформація">
            <p><strong>Телефон:</strong> {company.phoneNumber || "—"}</p>
            <p><strong>Email:</strong> {company.email || "—"}</p>
            <p><strong>Сайт:</strong> {company.website || "—"}</p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Юридична адреса">
            <p><strong>Адреса:</strong> {company.legalAddress || "—"}</p>
            <p><strong>Місто/Регіон:</strong> {company.city || "—"}, {company.region || "—"}</p>
            <p><strong>Країна/Поштовий індекс:</strong> {company.country || "—"}, {company.postalCode || "—"}</p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 3 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Фактична / поштова адреса">
            <p><strong>Адреса:</strong> {company.streetAddress || "—"} {company.buildingNumber || ""}</p>
            <p><strong>Квартира:</strong> {company.apartmentNumber || "—"}</p>
            <p><strong>Поштова адреса:</strong> {company.postalAddress || "—"}</p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Банківські реквізити">
            <p><strong>Банк:</strong> {company.bankName?.join(", ") || "—"}</p>
            <p><strong>Рахунок:</strong> {company.bankAccountNumber || "—"}</p>
            <p><strong>МФО:</strong> {company.bankMfo || "—"}</p>
            <p><strong>Валюта:</strong> {company.currency || "—"}</p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 4 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="API інтеграції">
            <p><strong>Nova Poshta:</strong> {company.apiNovaPoshtaKey || "—"}</p>
            <p><strong>LardyTrans:</strong> {company.apiLardyTransKey || "—"}</p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Додаткова інформація">
            <p><strong>Інформація:</strong> {company.additionalInfo || "—"}</p>
          </Section>
        </div>
      </div>

    </div>
  );
}

export default MyCompanyPage;