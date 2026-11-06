import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { useToast } from "../context/useToast";

const API_URL = "https://localhost:7197/api/company"; // змінити порт

function CompanyInfoPage() {
  const { pushToast } = useToast();
  const { companyId } = useCompany();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;

    fetch(`${API_URL}/${companyId}`)
      .then(res => {
        if (!res.ok) throw new Error("Помилка завантаження компанії");
        return res.json();
      })
      .then(data => setCompany(data))
      .catch(err => pushToast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [companyId, pushToast]);

  if (!companyId) {
    return <div className="container mt-5">Спершу створіть або оберіть компанію</div>;
  }

  if (loading) {
    return <div className="container mt-5">Завантаження...</div>;
  }

  if (!company) {
    return <div className="container mt-5">Компанію не знайдено</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Твоя компанія: {company.name}</h2>
      <div className="card shadow-sm mt-3">
        <div className="card-body">
          <p><strong>ЄДРПОУ:</strong> {company.codeCompany}</p>
          <p><strong>ІПН:</strong> {company.ipn}</p>
          <p><strong>Країна:</strong> {company.country}</p>
          <p><strong>Місто:</strong> {company.city}</p>
          <p><strong>Регіон:</strong> {company.region}</p>
          <p><strong>Юридична адреса:</strong> {company.legalAddress}</p>
          <p><strong>Телефон:</strong> {company.phoneNumber}</p>
          <p><strong>Електронна пошта:</strong> {company.email}</p>
          <p><strong>Директор:</strong> {company.directorFullName}</p>
          <p><strong>Головний бухгалтер:</strong> {company.accountantFullName}</p>
          <p><strong>Тип компанії:</strong> {company.companyType}</p>
          <p><strong>Система оподаткування:</strong> {company.taxSystem}</p>
          <p><strong>Валюта:</strong> {company.currency}</p>
          <p><strong>API Nova Poshta Key:</strong> {company.apiNovaPoshtaKey}</p>
          <p><strong>API Lardy Trans Key:</strong> {company.apiLardyTransKey}</p>
          {company.logoPath && <img src={company.logoPath} alt="Логотип" className="mt-3" style={{ maxWidth: '200px' }} />}
        </div>
      </div>
    </div>
  );
}

export default CompanyInfoPage;
