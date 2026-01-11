import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { useApi } from "../context/ApiContext";
import NovaPoshtaDisplay from "../components/common/NovaPoshtaDisplay";


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
  const { apiData } = useApi();
  const [company, setCompany] = useState(null);
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [error, setError] = useState("");

  const API_URL = `${apiData}/company`;


  useEffect(() => {
    if (!companyId) return;

    fetch(`${API_URL}/${companyId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        console.log(res.json);
        return res.json();
      })
      .then(data => setCompany(data))
      .catch(err => {
        console.error("Помилка завантаження компанії:", err);
        setError("Не вдалося завантажити дані компанії. Перевірте підключення до сервера.");
      });
  }, [companyId, API_URL]);

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
        {error ? (
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Помилка!</h4>
            <p>{error}</p>
            <hr />
            <p className="mb-0">
              Перевірте, чи запущений сервер на <strong>{API_URL}</strong>
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Завантаження...</span>
            </div>
          </div>
        )}
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

  const positionNames = {
    0: "Директор",
    1: "Бухгалтер",
    2: "Менеджер",
    3: "Інше"
  };
  console.log(company);
  // Отримуємо дані з вкладених структур
  const phone = company.contact?.phoneNumber || "";
  const email = company.contact?.email || "";
  const website = company.contact?.website || "";

  const legal = company.legalAddress || {};
  const ukrPoshta = company.ukrPoshtaAddress || {};
  const actual = company.actualAddress || {};

  // Підготовка даних Нової Пошти у форматі форми для NovaPoshtaDisplay
  const novaPoshtaForm = {
    novaPoshtaRecipientType: company.novaPoshtaRecipient?.recipientType?.toString() || "",
    nP_Phone: company.novaPoshtaRecipient?.phone || "",
    nP_LastName: company.novaPoshtaRecipient?.lastName || "",
    nP_FirstName: company.novaPoshtaRecipient?.firstName || "",
    nP_MiddleName: company.novaPoshtaRecipient?.middleName || "",
    nP_EdrpouCode: company.novaPoshtaRecipient?.edrpouCode || "",
    nP_CompanyName: company.novaPoshtaRecipient?.companyName || "",
    nP_OwnershipForm: company.novaPoshtaRecipient?.ownershipForm || "",
    nP_OrgPhone: company.novaPoshtaRecipient?.organizationPhone || "",
    nP_OrgLastName: company.novaPoshtaRecipient?.organizationLastName || "",
    nP_OrgFirstName: company.novaPoshtaRecipient?.organizationFirstName || "",
    nP_OrgMiddleName: company.novaPoshtaRecipient?.organizationMiddleName || "",
    novaPoshtaDeliveryType: company.novaPoshtaDelivery?.deliveryType?.toString() || "",
    npD_City: company.novaPoshtaDelivery?.city || "",
    npD_Branch: company.novaPoshtaDelivery?.branch || "",
    npD_Street: company.novaPoshtaDelivery?.street || "",
    npD_Building: company.novaPoshtaDelivery?.building || "",
    npD_Apartment: company.novaPoshtaDelivery?.apartment || "",
    npD_AddressComment: company.novaPoshtaDelivery?.addressComment || "",
    npD_PostomatNumber: company.novaPoshtaDelivery?.postomatNumber || "",
    npD_DigitalAddressReference: company.novaPoshtaDelivery?.digitalAddressReference || ""
  };

  // Отримуємо список працівників
  const managementPeople = company.managementPeaple || [];

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
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>🏢 Основна інформація</h5>
              <p className="mb-2"><strong>Тип:</strong> {company.companyType || "—"}</p>
              <p className="mb-2"><strong>ЄДРПОУ:</strong> {company.codeCompany || "—"}</p>
              <p className="mb-2"><strong>ІПН:</strong> {company.ipn || "—"}</p>
              <p className="mb-0"><strong>Податкова система:</strong> {company.taxSystem || "—"}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>👥 Керівництво та персонал</h5>
              {managementPeople.length > 0 ? (
                <div>
                  {managementPeople.map((person, index) => (
                    <div key={index} className="mb-3 pb-2 border-bottom">
                      <p className="mb-1">
                        <span className="badge bg-primary me-2">{positionNames[person.position] || "Інше"}</span>
                        <strong>{person.fullName || "—"}</strong>
                      </p>
                      {person.phoneNumber && (
                        <p className="mb-1 text-muted small">📞 {person.phoneNumber}</p>
                      )}
                      {person.email && (
                        <p className="mb-0 text-muted small">✉️ {person.email}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Інформація про персонал відсутня</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== РЯД 2 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📞 Контактна інформація</h5>
              <p className="mb-2"><strong>Телефон:</strong> {phone || "—"}</p>
              <p className="mb-2"><strong>Email:</strong> {email || "—"}</p>
              <p className="mb-0"><strong>Сайт:</strong> {website || "—"}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📍 Юридична адреса</h5>
              <p className="mb-2"><strong>Адреса:</strong> {legal.streetAddress || "—"} {legal.buildingNumber || ""}, кв.(офіс) {legal.apartmentNumber || "—"}</p>
              <p className="mb-2"><strong>Населений пункт/Регіон:</strong> {legal.city || "—"}, {legal.region || "—"}</p>
              <p className="mb-0"><strong>Країна/Індекс:</strong> {legal.country || "—"}, {legal.postalCode || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== РЯД 3 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📮 Укр. пошта</h5>
              <p className="mb-2"><strong>Адреса:</strong> {ukrPoshta.streetAddress || "—"} {ukrPoshta.buildingNumber || ""}</p>
              <p className="mb-2"><strong>Кв.(офіс):</strong> {ukrPoshta.apartmentNumber || "—"}</p>
              <p className="mb-2"><strong>Населений пункт/Регіон:</strong> {ukrPoshta.city || "—"}, {ukrPoshta.region || "—"}</p>
              <p className="mb-0"><strong>Країна/Індекс:</strong> {ukrPoshta.country || "—"}, {ukrPoshta.postalCode || "—"}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📝 Додаткова інформація</h5>
              <p className="mb-0">{company.additionalInfo || "Немає додаткової інформації"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Нова Пошта ===== */}
      <NovaPoshtaDisplay form={novaPoshtaForm} />

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
                            // Гривневий: показуємо IBAN і МФО
                            <>
                              <p className="mb-1"><strong>IBAN:</strong> {bank.iban || "—"}</p>
                              <p className="mb-1"><strong>МФО:</strong> {bank.bankMfo || "—"}</p>
                            </>
                          ) : (
                            // Валютний: показуємо IBAN, SWIFT, Адреса банку та банки-кореспонденти
                            <>
                              <p className="mb-1"><strong>IBAN:</strong> {bank.iban || "—"}</p>
                              {bank.swift && (
                                <p className="mb-1"><strong>SWIFT:</strong> {bank.swift}</p>
                              )}
                              {bank.bankMfo && (
                                <p className="mb-1"><strong>Адреса банку:</strong> {bank.bankMfo}</p>
                              )}
                              {bank.correspondentBanks && bank.correspondentBanks.length > 0 && (
                                <div className="mt-2">
                                  <strong>Банки-кореспонденти:</strong>
                                  <ul className="mb-0 mt-1">
                                    {bank.correspondentBanks.map((cb, idx) => (
                                      <li key={idx}>
                                        {cb.bankName || "—"}, <strong>SWIFT: </strong>{cb.swift || "—"}
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
      <div className="col-md-12">
          <Section title="API інтеграції">
            <p><strong>Nova Poshta:</strong> {company.apiKeys?.novaPoshta ? "Налаштовано ✓" : "Не налаштовано"}</p>
            <p><strong>LardyTrans:</strong> {company.apiKeys?.lardyTrans ? "Налаштовано ✓" : "Не налаштовано"}</p>
          </Section>
        </div>
      
    </div>
  );
}

export default MyCompanyPage;