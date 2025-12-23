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

  const currencyNames = {
    0: "UAH",
    1: "USD",
    2: "EUR",
    3: "PLN",
    4: "GBP"
  };

  const accountTypeNames = {
    0: "Гривневий",
    1: "Валютний"
  };

  // Fallbacks: support both nested shapes (management, contact, addresses)
  const director = company.management?.directorFullName || company.directorFullName || "";
  const accountant = company.management?.accountantFullName || company.accountantFullName || "";
  const phone = company.contact?.phoneNumber || company.phoneNumber || "";
  const email = company.contact?.email || company.email || "";
  const website = company.contact?.website || company.website || "";

  const legal = company.legalAddress || {
    country: company.legalAddress_Country || "",
    city: company.legalAddress_City || "",
    region: company.legalAddress_Region || "",
    postalCode: company.legalAddress_PostalCode || "",
    streetAddress: company.legalAddress_StreetAddress || "",
    buildingNumber: company.legalAddress_BuildingNumber || "",
    apartmentNumber: company.legalAddress_ApartmentNumber || ""
  };

  const postal = company.postalAddress || {
    country: company.postalAddress_Country || "",
    city: company.postalAddress_City || "",
    region: company.postalAddress_Region || "",
    postalCode: company.postalAddress_PostalCode || "",
    streetAddress: company.postalAddress_StreetAddress || "",
    buildingNumber: company.postalAddress_BuildingNumber || "",
    apartmentNumber: company.postalAddress_ApartmentNumber || ""
  };

  const actual = company.actualAddress || {
    country: company.actualAddress_Country || "",
    city: company.actualAddress_City || "",
    region: company.actualAddress_Region || "",
    postalCode: company.actualAddress_PostalCode || "",
    streetAddress: company.actualAddress_StreetAddress || "",
    buildingNumber: company.actualAddress_BuildingNumber || "",
    apartmentNumber: company.actualAddress_ApartmentNumber || ""
  };

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
            <p><strong>Директор:</strong> {director || "—"}</p>
            <p><strong>Бухгалтер:</strong> {accountant || "—"}</p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 2 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Контактна інформація">
            <p><strong>Телефон:</strong> {phone || "—"}</p>
            <p><strong>Email:</strong> {email || "—"}</p>
            <p><strong>Сайт:</strong> {website || "—"}</p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Юридична адреса">
            <p><strong>Адреса:</strong> {legal.streetAddress || "—"} {legal.buildingNumber || ""}, кв. {legal.apartmentNumber || "—"}</p>
            <p><strong>Місто/Регіон:</strong> {legal.city || "—"}, {legal.region || "—"}</p>
            <p><strong>Країна/Індекс:</strong> {legal.country || "—"}, {legal.postalCode || "—"}</p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 3 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Поштова адреса">
            <p><strong>Адреса:</strong> {postal.streetAddress || "—"} {postal.buildingNumber || ""}</p>
            <p><strong>Квартира:</strong> {postal.apartmentNumber || "—"}</p>
            <p><strong>Місто/Регіон:</strong> {postal.city || "—"}, {postal.region || "—"}</p>
            <p><strong>Країна/Індекс:</strong> {postal.country || "—"}, {postal.postalCode || "—"}</p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Фактична адреса">
            <p><strong>Адреса:</strong> {actual.streetAddress || "—"} {actual.buildingNumber || ""}</p>
            <p><strong>Квартира:</strong> {actual.apartmentNumber || "—"}</p>
            <p><strong>Місто/Регіон:</strong> {actual.city || "—"}, {actual.region || "—"}</p>
            <p><strong>Країна/Індекс:</strong> {actual.country || "—"}, {actual.postalCode || "—"}</p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 4 - Банківські реквізити (список) ===== */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Банківські реквізити</h5>
              {company.bankDetails && company.bankDetails.length > 0 ? (
                <div className="row g-3">
                  {company.bankDetails.map((bank, index) => (
                    <div key={index} className="col-md-6">
                      <div className="card border">
                        <div className="card-body">
                          <h6 className="card-title">
                            Рахунок #{index + 1} 
                            <span className="badge bg-primary ms-2">
                              {accountTypeNames[bank.typeAccount] || "—"}
                            </span>
                          </h6>
                          <hr />
                          <p className="mb-1"><strong>Валюта:</strong> {currencyNames[bank.currency] || "—"}</p>
                          <p className="mb-1"><strong>Банк:</strong> {bank.bankName || "—"}</p>

                          {bank.typeAccount === 0 ? (
                            // Гривневий: показуємо лише МФО
                            <p className="mb-1"><strong>МФО:</strong> {bank.bankMfo || "—"}</p>
                          ) : (
                            // Валютний: показуємо IBAN, SWIFT, Банк отримувача та банки-кореспонденти
                            <>
                              <p className="mb-1"><strong>IBAN:</strong> {bank.iban || "—"}</p>
                              {bank.swift && (
                                <p className="mb-1"><strong>SWIFT:</strong> {bank.swift}</p>
                              )}
                              {bank.bankOfBeneficiary && (
                                <p className="mb-1"><strong>Банк отримувача:</strong> {bank.bankOfBeneficiary}</p>
                              )}
                              {bank.correspondentBanks && bank.correspondentBanks.length > 0 && (
                                <div className="mt-2">
                                  <strong>Банки-кореспонденти:</strong>
                                  <ul className="mb-0 mt-1">
                                    {bank.correspondentBanks.map((cb, idx) => (
                                      <li key={idx}>
                                        {cb.bankName || "—"} ({cb.swift || "—"})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Банківські реквізити не додано</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== РЯД 5 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="API інтеграції">
            <p><strong>Nova Poshta:</strong> {company.apiKeys?.novaPoshta ? "Налаштовано ✓" : "Не налаштовано"}</p>
            <p><strong>LardyTrans:</strong> {company.apiKeys?.lardyTrans ? "Налаштовано ✓" : "Не налаштовано"}</p>
          </Section>
        </div>

        {company.additionalInfo && (
          <div className="col-md-6">
            <Section title="Додаткова інформація">
              <p>{company.additionalInfo}</p>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCompanyPage;