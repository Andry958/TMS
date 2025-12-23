import { useState, useEffect } from "react";
import { useCompany } from "../context/CompanyContext";

const API_URL = "https://localhost:7060/api/company";

const currencies = [
  { code: 0, name: "UAH - Українська гривня" },
  { code: 1, name: "USD - Долар США" },
  { code: 2, name: "EUR - Євро" },
  { code: 3, name: "PLN - Злотий" },
  { code: 4, name: "GBP - Фунт стерлінгів" }
];

const accountTypes = [
  { value: 0, name: "Гривневий" },
  { value: 1, name: "Валютний" }
];

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

function CompanySettingsPage({ setActiveSection }) {
  const { companyId, setCompanyId } = useCompany();

  const [form, setForm] = useState({
    name: "",
    companyType: "",
    codeCompany: "",
    ipn: "",
    taxSystem: "",
    additionalInfo: "",
    logoPath: "",

    phoneNumber: "",
    email: "",
    website: "",

    legalAddress_Country: "",
    legalAddress_City: "",
    legalAddress_Region: "",
    legalAddress_PostalCode: "",
    legalAddress_StreetAddress: "",
    legalAddress_BuildingNumber: "",
    legalAddress_ApartmentNumber: "",

    postalAddress_Country: "",
    postalAddress_City: "",
    postalAddress_Region: "",
    postalAddress_PostalCode: "",
    postalAddress_StreetAddress: "",
    postalAddress_BuildingNumber: "",
    postalAddress_ApartmentNumber: "",

    actualAddress_Country: "",
    actualAddress_City: "",
    actualAddress_Region: "",
    actualAddress_PostalCode: "",
    actualAddress_StreetAddress: "",
    actualAddress_BuildingNumber: "",
    actualAddress_ApartmentNumber: "",

    directorFullName: "",
    accountantFullName: "",

    bankDetails: [
      {
        typeAccount: 0,
        currency: 0,
        bankName: "",
        bankMfo: "",
        iban: "",
        swift: "",
        bankOfBeneficiary: "",
        correspondentBanks: []
      }
    ],

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

  const handleBankChange = (index, field, value) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      if (field === 'typeAccount') {
        const typeVal = value;
        if (typeVal === 0) {
          newBankDetails[index] = {
            ...newBankDetails[index],
            typeAccount: 0,
            currency: 0,
            iban: "",
            swift: "",
            bankOfBeneficiary: "",
            correspondentBanks: []
          };
        } else {
          newBankDetails[index] = { ...newBankDetails[index], typeAccount: typeVal };
        }
      } else {
        newBankDetails[index] = { ...newBankDetails[index], [field]: value };
      }
      return { ...prev, bankDetails: newBankDetails };
    });
  };

  const addCorrespondentBank = (bankIndex) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      const bank = { ...newBankDetails[bankIndex] };
      bank.correspondentBanks = [...(bank.correspondentBanks || []), { bankName: "", swift: "" }];
      newBankDetails[bankIndex] = bank;
      return { ...prev, bankDetails: newBankDetails };
    });
  };

  const removeCorrespondentBank = (bankIndex, cbIndex) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      const bank = { ...newBankDetails[bankIndex] };
      bank.correspondentBanks = (bank.correspondentBanks || []).filter((_, i) => i !== cbIndex);
      newBankDetails[bankIndex] = bank;
      return { ...prev, bankDetails: newBankDetails };
    });
  };

  const handleCorrespondentBankChange = (bankIndex, cbIndex, field, value) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      const bank = { ...newBankDetails[bankIndex] };
      const cbs = [...(bank.correspondentBanks || [])];
      cbs[cbIndex] = { ...cbs[cbIndex], [field]: value };
      bank.correspondentBanks = cbs;
      newBankDetails[bankIndex] = bank;
      return { ...prev, bankDetails: newBankDetails };
    });
  };

  const addBankAccount = () => {
    setForm(prev => ({
      ...prev,
      bankDetails: [
        ...prev.bankDetails,
        {
          typeAccount: 0,
          currency: 0,
          bankName: "",
          bankMfo: "",
          iban: "",
          swift: "",
          bankOfBeneficiary: "",
          correspondentBanks: []
        }
      ]
    }));
  };

  const removeBankAccount = (index) => {
    if (form.bankDetails.length === 1) {
      alert("Має залишитись хоча б один банківський рахунок");
      return;
    }
    setForm(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.codeCompany) {
      alert("Заповніть обов'язкові поля: Назва компанії та ЄДРПОУ");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setCompanyId(data.id);
      alert("Компанію успішно створено!");
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
          Заповніть інформацію про компанію. Ці дані будуть використовуватись у документах, рахунках та інтеграціях.
        </p>
      </div>

      {/* ===== РЯД 1 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Основна інформація">
            <p><strong>Назва компанії:</strong> <input className="form-control d-inline-block w-75" name="name" onChange={handleChange} /></p>
            <p><strong>Тип:</strong> <input className="form-control d-inline-block w-75" name="companyType" onChange={handleChange} /></p>
            <p><strong>ЄДРПОУ:</strong> <input className="form-control d-inline-block w-75" name="codeCompany" onChange={handleChange} /></p>
            <p><strong>ІПН:</strong> <input className="form-control d-inline-block w-75" name="ipn" onChange={handleChange} /></p>
            <p><strong>Податкова система:</strong> <input className="form-control d-inline-block w-75" name="taxSystem" onChange={handleChange} /></p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Керівництво">
            <p><strong>Директор:</strong> <input className="form-control d-inline-block w-75" name="directorFullName" onChange={handleChange} /></p>
            <p><strong>Бухгалтер:</strong> <input className="form-control d-inline-block w-75" name="accountantFullName" onChange={handleChange} /></p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 2 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Контактна інформація">
            <p><strong>Телефон:</strong> <input className="form-control d-inline-block w-75" name="phoneNumber" onChange={handleChange} /></p>
            <p><strong>Email:</strong> <input className="form-control d-inline-block w-75" type="email" name="email" onChange={handleChange} /></p>
            <p><strong>Сайт:</strong> <input className="form-control d-inline-block w-75" name="website" onChange={handleChange} /></p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Юридична адреса">
            <p><strong>Адреса:</strong> <input className="form-control d-inline-block" style={{width: '45%'}} name="legalAddress_StreetAddress" onChange={handleChange} placeholder="Вулиця" /> <input className="form-control d-inline-block" style={{width: '20%'}} name="legalAddress_BuildingNumber" onChange={handleChange} placeholder="Буд." />, кв. <input className="form-control d-inline-block" style={{width: '15%'}} name="legalAddress_ApartmentNumber" onChange={handleChange} placeholder="Кв." /></p>
            <p><strong>Місто/Регіон:</strong> <input className="form-control d-inline-block" style={{width: '35%'}} name="legalAddress_City" onChange={handleChange} placeholder="Місто" />, <input className="form-control d-inline-block" style={{width: '35%'}} name="legalAddress_Region" onChange={handleChange} placeholder="Регіон" /></p>
            <p><strong>Країна/Індекс:</strong> <input className="form-control d-inline-block" style={{width: '35%'}} name="legalAddress_Country" onChange={handleChange} placeholder="Країна" />, <input className="form-control d-inline-block" style={{width: '35%'}} name="legalAddress_PostalCode" onChange={handleChange} placeholder="Індекс" /></p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 3 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Поштова адреса">
            <p><strong>Адреса:</strong> <input className="form-control d-inline-block" style={{width: '55%'}} name="postalAddress_StreetAddress" onChange={handleChange} placeholder="Вулиця" /> <input className="form-control d-inline-block" style={{width: '25%'}} name="postalAddress_BuildingNumber" onChange={handleChange} placeholder="Буд." /></p>
            <p><strong>Квартира:</strong> <input className="form-control d-inline-block w-75" name="postalAddress_ApartmentNumber" onChange={handleChange} /></p>
            <p><strong>Місто/Регіон:</strong> <input className="form-control d-inline-block" style={{width: '35%'}} name="postalAddress_City" onChange={handleChange} placeholder="Місто" />, <input className="form-control d-inline-block" style={{width: '35%'}} name="postalAddress_Region" onChange={handleChange} placeholder="Регіон" /></p>
            <p><strong>Країна/Індекс:</strong> <input className="form-control d-inline-block" style={{width: '35%'}} name="postalAddress_Country" onChange={handleChange} placeholder="Країна" />, <input className="form-control d-inline-block" style={{width: '35%'}} name="postalAddress_PostalCode" onChange={handleChange} placeholder="Індекс" /></p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Фактична адреса">
            <p><strong>Адреса:</strong> <input className="form-control d-inline-block" style={{width: '55%'}} name="actualAddress_StreetAddress" onChange={handleChange} placeholder="Вулиця" /> <input className="form-control d-inline-block" style={{width: '25%'}} name="actualAddress_BuildingNumber" onChange={handleChange} placeholder="Буд." /></p>
            <p><strong>Квартира:</strong> <input className="form-control d-inline-block w-75" name="actualAddress_ApartmentNumber" onChange={handleChange} /></p>
            <p><strong>Місто/Регіон:</strong> <input className="form-control d-inline-block" style={{width: '35%'}} name="actualAddress_City" onChange={handleChange} placeholder="Місто" />, <input className="form-control d-inline-block" style={{width: '35%'}} name="actualAddress_Region" onChange={handleChange} placeholder="Регіон" /></p>
            <p><strong>Країна/Індекс:</strong> <input className="form-control d-inline-block" style={{width: '35%'}} name="actualAddress_Country" onChange={handleChange} placeholder="Країна" />, <input className="form-control d-inline-block" style={{width: '35%'}} name="actualAddress_PostalCode" onChange={handleChange} placeholder="Індекс" /></p>
          </Section>
        </div>
      </div>

      {/* ===== РЯД 4 - Банківські реквізити ===== */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Банківські реквізити</h5>
                <button className="btn btn-success btn-sm" onClick={addBankAccount}>
                  + Додати рахунок
                </button>
              </div>

              <div className="row g-3">
                {form.bankDetails.map((bank, index) => (
                  <div key={index} className="col-md-6">
                    <div className="card border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6>Рахунок #{index + 1} <span className="badge bg-primary ms-2">{accountTypes.find(t => t.value === bank.typeAccount)?.name}</span></h6>
                          {form.bankDetails.length > 1 && (
                            <button className="btn btn-danger btn-sm" onClick={() => removeBankAccount(index)}>🗑️</button>
                          )}
                        </div>
                        <hr />

                        <p className="mb-1"><strong>Тип рахунку:</strong> 
                          <select className="form-control d-inline-block w-50 ms-2" value={bank.typeAccount} onChange={(e) => handleBankChange(index, 'typeAccount', parseInt(e.target.value))}>
                            {accountTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.name}</option>
                            ))}
                          </select>
                        </p>

                        <p className="mb-1"><strong>Валюта:</strong> 
                          <select className="form-control d-inline-block w-50 ms-2" value={bank.currency} onChange={(e) => handleBankChange(index, 'currency', parseInt(e.target.value))} disabled={bank.typeAccount === 0}>
                            {bank.typeAccount === 0 ? (
                              <option value={0}>{currencies.find(c => c.code === 0).name}</option>
                            ) : (
                              currencies.map(curr => (
                                <option key={curr.code} value={curr.code}>{curr.name}</option>
                              ))
                            )}
                          </select>
                        </p>

                        <p className="mb-1"><strong>Банк:</strong> <input className="form-control d-inline-block w-75" value={bank.bankName || ""} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} /></p>

                        {bank.typeAccount === 0 ? (
                          <p className="mb-1"><strong>МФО:</strong> <input className="form-control d-inline-block w-75" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} /></p>
                        ) : (
                          <>
                            <p className="mb-1"><strong>МФО:</strong> <input className="form-control d-inline-block w-75" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} /></p>
                            <p className="mb-1"><strong>IBAN:</strong> <input className="form-control d-inline-block w-75" value={bank.iban || ""} onChange={(e) => handleBankChange(index, 'iban', e.target.value)} /></p>
                            {bank.swift !== undefined && (
                              <p className="mb-1"><strong>SWIFT:</strong> <input className="form-control d-inline-block w-75" value={bank.swift || ""} onChange={(e) => handleBankChange(index, 'swift', e.target.value)} /></p>
                            )}
                            {bank.bankOfBeneficiary !== undefined && (
                              <p className="mb-1"><strong>Банк отримувача:</strong> <input className="form-control d-inline-block w-75" value={bank.bankOfBeneficiary || ""} onChange={(e) => handleBankChange(index, 'bankOfBeneficiary', e.target.value)} /></p>
                            )}
                            {bank.correspondentBanks && bank.correspondentBanks.length > 0 && (
                              <div className="mt-2">
                                <strong>Банки-кореспонденти:</strong>
                                <ul className="mb-0 mt-1">
                                  {bank.correspondentBanks.map((cb, cbIndex) => (
                                    <li key={cbIndex} className="mb-2">
                                      <input className="form-control d-inline-block" style={{width: '40%'}} placeholder="Назва банку" value={cb.bankName || ""} onChange={(e) => handleCorrespondentBankChange(index, cbIndex, 'bankName', e.target.value)} />
                                      {' '}
                                      <input className="form-control d-inline-block" style={{width: '30%'}} placeholder="SWIFT" value={cb.swift || ""} onChange={(e) => handleCorrespondentBankChange(index, cbIndex, 'swift', e.target.value)} />
                                      {' '}
                                      <button className="btn btn-outline-danger btn-sm" onClick={() => removeCorrespondentBank(index, cbIndex)}>🗑</button>
                                    </li>
                                  ))}
                                </ul>
                                <button className="btn btn-sm btn-secondary mt-2" onClick={() => addCorrespondentBank(index)}>+ Додати банк-кореспондент</button>
                              </div>
                            )}
                            {(!bank.correspondentBanks || bank.correspondentBanks.length === 0) && (
                              <button className="btn btn-sm btn-secondary mt-2" onClick={() => addCorrespondentBank(index)}>+ Додати банк-кореспондент</button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== РЯД 5 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="API інтеграції">
            <p><strong>Nova Poshta:</strong> <input className="form-control d-inline-block w-75" name="apiNovaPoshtaKey" onChange={handleChange} /></p>
            <p><strong>LardyTrans:</strong> <input className="form-control d-inline-block w-75" name="apiLardyTransKey" onChange={handleChange} /></p>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Додаткова інформація">
            <textarea className="form-control" rows="5" name="additionalInfo" onChange={handleChange} placeholder="Коментар / примітки" />
          </Section>
        </div>
      </div>

      <button className="btn btn-success mb-5" onClick={handleSubmit}>
        💾 Зберегти компанію
      </button>
    </div>
  );
}

export default CompanySettingsPage;