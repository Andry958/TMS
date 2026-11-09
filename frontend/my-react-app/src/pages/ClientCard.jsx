import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useCompany } from "../context/CompanyContext";
import { useToast } from "../context/useToast";
import ClientHeader from "../components/client/ClientHeader";
import ClientMainInfo from "../components/client/ClientMainInfo";
import ClientPeople from "../components/client/ClientPeople";
import ClientAddresses from "../components/client/ClientAddresses";
import ClientBankDetails from "../components/client/ClientBankDetails";
import NovaPoshtaDisplay from "../components/common/NovaPoshtaDisplay";
import NovaPoshtaForm from "../components/common/NovaPoshtaForm";
import { UAH_CURRENCY_CODE, createEmptyBankDetails, normalizeCurrencyCode } from "../constants/bankDetails";

function normalizeClient(client) {
  return {
    ...client,
    novaPoshtaRecipientType: client.novaPoshtaRecipientType == null ? "" : String(client.novaPoshtaRecipientType),
    novaPoshtaDeliveryType: client.novaPoshtaDeliveryType == null ? "" : String(client.novaPoshtaDeliveryType),
    bankDetails: client.bankDetails?.length
      ? client.bankDetails.map(bank => ({ ...bank, currency: normalizeCurrencyCode(bank.currency) }))
      : [createEmptyBankDetails()]
  };
}

function ActualAddress({ form, isEditing, onChange }) {
  const fields = [
    ["StreetAddress", "Вулиця"],
    ["BuildingNumber", "Будинок"],
    ["ApartmentNumber", "Квартира / офіс"],
    ["City", "Місто"],
    ["Region", "Область"],
    ["PostalCode", "Індекс"],
    ["Country", "Країна"]
  ];

  const values = fields
    .map(([field]) => form[`actualAddress_${field}`])
    .filter(Boolean);

  return (
    <section className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="mb-3">Фактична адреса</h5>
        {isEditing ? (
          <div className="row g-3">
            {fields.map(([field, label]) => {
              const name = `actualAddress_${field}`;
              return (
                <div className="col-md-4" key={name}>
                  <label className="form-label" htmlFor={name}>{label}</label>
                  <input id={name} className="form-control" name={name} value={form[name] || ""} onChange={onChange} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mb-0">{values.join(", ") || "-"}</p>
        )}
      </div>
    </section>
  );
}

function ClientCard() {
  const { pushToast } = useToast();
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { apiData } = useApi();
  const { companyId } = useCompany();
  const [form, setForm] = useState(null);
  const [people, setPeople] = useState([]);
  const [apiNovaPoshtaKey, setApiNovaPoshtaKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClient = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiData}/client/${clientId}?companyId=${companyId}`);
      if (!response.ok) throw new Error("Не вдалося завантажити клієнта");
      const client = await response.json();
      setForm(normalizeClient(client));
      setPeople(client.contactPersons || []);
    } catch (error) {
      console.error("Помилка завантаження компанії-клієнта:", error);
      pushToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [apiData, clientId, companyId, pushToast]);

  useEffect(() => {
    if (!companyId) return;
    fetch(`${apiData}/company/${companyId}`)
      .then(response => {
        if (!response.ok) throw new Error("Не вдалося завантажити профіль головної компанії");
        return response.json();
      })
      .then(company => setApiNovaPoshtaKey(company.apiKeys?.novaPoshta || ""))
      .catch(error => {
        console.error("Помилка завантаження ключа Нової Пошти:", error);
        pushToast("Не вдалося завантажити ключ Нової Пошти головної компанії", "error");
      });
  }, [apiData, companyId, pushToast]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const saveClient = async () => {
    if (!form.name?.trim() || !form.codeCompany?.trim()) {
      pushToast("Заповніть назву компанії та ЄДРПОУ", "warning");
      return;
    }

    try {
      const response = await fetch(`${apiData}/client/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          novaPoshtaRecipientType: form.novaPoshtaRecipientType === "" ? null : Number(form.novaPoshtaRecipientType),
          novaPoshtaDeliveryType: form.novaPoshtaDeliveryType === "" ? null : Number(form.novaPoshtaDeliveryType)
        })
      });
      if (!response.ok) throw new Error("Не вдалося зберегти зміни");
      const updated = await response.json();
      setForm(normalizeClient(updated));
      setPeople(updated.contactPersons || []);
      setIsEditing(false);
      pushToast("Дані компанії-клієнта збережено", "success");
    } catch (error) {
      console.error("Помилка збереження компанії-клієнта:", error);
      pushToast(error.message, "error");
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    fetchClient();
  };

  const addPerson = async (contact) => {
    try {
      const response = await fetch(`${apiData}/client/${clientId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
      });
      if (!response.ok) throw new Error("Не вдалося додати контактну особу");
      const createdContact = await response.json();
      setPeople(current => [...current, createdContact]);
      pushToast("Контактну особу додано", "success");
    } catch (error) {
      console.error("Помилка додавання контактної особи:", error);
      pushToast(error.message, "error");
    }
  };

  const deletePerson = async (personId) => {
    try {
      const response = await fetch(`${apiData}/client/${clientId}/contacts/${personId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Не вдалося видалити контактну особу");
      setPeople(current => current.filter(person => person.id !== personId));
      pushToast("Контактну особу видалено", "success");
    } catch (error) {
      console.error("Помилка видалення контактної особи:", error);
      pushToast(error.message, "error");
    }
  };

  const handleBankChange = (index, field, value) => {
    setForm(current => ({
      ...current,
      bankDetails: current.bankDetails.map((bank, bankIndex) =>
        bankIndex === index
          ? field === "typeAccount" && Number(value) === 0
            ? { ...bank, typeAccount: 0, currency: UAH_CURRENCY_CODE, swift: "", bankOfBeneficiary: "", correspondentBanks: [] }
            : { ...bank, [field]: value }
          : bank)
    }));
  };

  const addBankAccount = () => setForm(current => ({
    ...current,
    bankDetails: [...current.bankDetails, createEmptyBankDetails()]
  }));

  const removeBankAccount = (index) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.length > 1
      ? current.bankDetails.filter((_, bankIndex) => bankIndex !== index)
      : current.bankDetails
  }));

  const addCorrespondent = (bankIndex) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.map((bank, index) => index === bankIndex
      ? { ...bank, correspondentBanks: [...(bank.correspondentBanks || []), { bankName: "", swift: "" }] }
      : bank)
  }));

  const removeCorrespondent = (bankIndex, correspondentIndex) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.map((bank, index) => index === bankIndex
      ? { ...bank, correspondentBanks: bank.correspondentBanks.filter((_, i) => i !== correspondentIndex) }
      : bank)
  }));

  const handleCorrespondentChange = (bankIndex, correspondentIndex, field, value) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.map((bank, index) => index === bankIndex
      ? {
          ...bank,
          correspondentBanks: bank.correspondentBanks.map((correspondent, i) =>
            i === correspondentIndex ? { ...correspondent, [field]: value } : correspondent)
        }
      : bank)
  }));

  const deleteClient = async () => {
    if (!window.confirm(`Видалити компанію-клієнта «${form.name}»?`)) return;

    try {
      const response = await fetch(`${apiData}/client/${clientId}?companyId=${companyId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Не вдалося видалити компанію-клієнта");
      pushToast("Компанію-клієнта видалено", "success");
      navigate("/clients");
    } catch (error) {
      console.error("Помилка видалення компанії-клієнта:", error);
      pushToast(error.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container mt-5">
        <p>Компанію-клієнта не знайдено.</p>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/clients")}>← До списку клієнтів</button>
      </div>
    );
  }

  return (
    <div className="container mt-4 page-shell">
      <ClientHeader
        clientName={form.name}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={saveClient}
        onCancel={cancelEditing}
        onDelete={deleteClient}
      />

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <ClientMainInfo form={form} isEditing={isEditing} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <ClientPeople people={people} isEditing={isEditing} onAdd={addPerson} onDelete={deletePerson} />
        </div>
      </div>

      <ClientAddresses form={form} isEditing={isEditing} onChange={handleChange} />
      <ActualAddress form={form} isEditing={isEditing} onChange={handleChange} />
      {isEditing
        ? <NovaPoshtaForm form={form} setForm={setForm} isEditing apiNovaPoshta={apiNovaPoshtaKey} />
        : <NovaPoshtaDisplay form={form} />}
      <ClientBankDetails
        form={form}
        isEditing={isEditing}
        onBankChange={handleBankChange}
        onAddBank={addBankAccount}
        onRemoveBank={removeBankAccount}
        onAddCorrespondent={addCorrespondent}
        onRemoveCorrespondent={removeCorrespondent}
        onCorrespondentChange={handleCorrespondentChange}
      />
    </div>
  );
}

export default ClientCard;
