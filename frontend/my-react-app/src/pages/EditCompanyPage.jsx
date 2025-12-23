import { useState, useEffect } from "react";
import { useCompany } from "../context/CompanyContext";
import CompanyForm from "../components/CompanyForm";

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
        setForm({
          name: data.name,
          companyType: data.companyType,
          codeCompany: data.codeCompany,
          ipn: data.ipn,
          taxSystem: data.taxSystem,
          additionalInfo: data.additionalInfo,
          logoPath: data.logoPath,

          phoneNumber: data.contact?.phoneNumber,
          email: data.contact?.email,
          website: data.contact?.website,

          legalAddress_Country: data.legalAddress?.country,
          legalAddress_City: data.legalAddress?.city,
          legalAddress_Region: data.legalAddress?.region,
          legalAddress_PostalCode: data.legalAddress?.postalCode,
          legalAddress_StreetAddress: data.legalAddress?.streetAddress,
          legalAddress_BuildingNumber: data.legalAddress?.buildingNumber,
          legalAddress_ApartmentNumber: data.legalAddress?.apartmentNumber,

          postalAddress_Country: data.postalAddress?.country,
          postalAddress_City: data.postalAddress?.city,
          postalAddress_Region: data.postalAddress?.region,
          postalAddress_PostalCode: data.postalAddress?.postalCode,
          postalAddress_StreetAddress: data.postalAddress?.streetAddress,
          postalAddress_BuildingNumber: data.postalAddress?.buildingNumber,
          postalAddress_ApartmentNumber: data.postalAddress?.apartmentNumber,

          actualAddress_Country: data.actualAddress?.country,
          actualAddress_City: data.actualAddress?.city,
          actualAddress_Region: data.actualAddress?.region,
          actualAddress_PostalCode: data.actualAddress?.postalCode,
          actualAddress_StreetAddress: data.actualAddress?.streetAddress,
          actualAddress_BuildingNumber: data.actualAddress?.buildingNumber,
          actualAddress_ApartmentNumber: data.actualAddress?.apartmentNumber,

          directorFullName: data.management?.directorFullName,
          accountantFullName: data.management?.accountantFullName,

          bankDetails: (data.bankDetails || []).map(bd => ({
            typeAccount: bd.typeAccount,
            currency: bd.currency,
            bankName: bd.bankName,
            bankMfo: bd.bankMfo,
            iban: bd.iban,
            swift: bd.swift,
            bankOfBeneficiary: bd.bankOfBeneficiary,
            correspondentBanks: bd.correspondentBanks || []
          })),

          apiNovaPoshtaKey: data.apiKeys?.novaPoshta,
          apiLardyTransKey: data.apiKeys?.lardyTrans
        });
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
    setForm(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.filter((_, i) => i !== index)
    }));
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

      <CompanyForm
        form={form}
        handleChange={handleChange}
        handleBankChange={handleBankChange}
        addBankAccount={addBankAccount}
        removeBankAccount={removeBankAccount}
        addCorrespondentBank={addCorrespondentBank}
        removeCorrespondentBank={removeCorrespondentBank}
        handleCorrespondentBankChange={handleCorrespondentBankChange}
        currencies={currencies}
        accountTypes={accountTypes}
      />

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