import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useCompany } from "../context/CompanyContext";

// Компоненти
import ClientHeader from "../components/client/ClientHeader";
import ClientMainInfo from "../components/client/ClientMainInfo";
import ClientPeople from "../components/client/ClientPeople";
import ClientAddresses from "../components/client/ClientAddresses";
import NovaPoshtaForm from "../components/common/NovaPoshtaForm";
import NovaPoshtaDisplay from "../components/common/NovaPoshtaDisplay";
import ClientBankDetails from "../components/client/ClientBankDetails";

function ClientCard() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { apiData } = useApi();
  const { companyId } = useCompany();
  const API_URL = `${apiData}/client`;
  const PEOPLE_API = `${apiData}/managementPeaple`;

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNP, setIsEditingNP] = useState(false);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [parentCompany, setParentCompany] = useState(null);

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

    ukrPoshtaAddress_Country: "",
    ukrPoshtaAddress_City: "",
    ukrPoshtaAddress_Region: "",
    ukrPoshtaAddress_PostalCode: "",
    ukrPoshtaAddress_StreetAddress: "",
    ukrPoshtaAddress_BuildingNumber: "",
    ukrPoshtaAddress_ApartmentNumber: "",

    novaPoshtaRecipientType: "",
    nP_Phone: "",
    nP_LastName: "",
    nP_FirstName: "",
    nP_MiddleName: "",
    nP_EdrpouCode: "",
    nP_CompanyName: "",
    nP_OwnershipForm: "",
    nP_OrgPhone: "",
    nP_OrgLastName: "",
    nP_OrgFirstName: "",
    nP_OrgMiddleName: "",

    novaPoshtaDeliveryType: "",
    npD_City: "",
    npD_Branch: "",
    npD_Street: "",
    npD_Building: "",
    npD_Apartment: "",
    npD_AddressComment: "",
    npD_PostomatNumber: "",
    npD_DigitalAddressReference: "",

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
    fetchClientData();
    fetchParentCompany();
  }, [clientId, companyId]);

  const fetchParentCompany = async () => {
    if (!companyId) return;
    
    try {
      const response = await fetch(`${apiData}/company/${companyId}`);
      if (!response.ok) throw new Error("Failed to fetch parent company");
      const data = await response.json();
      console.log("Головна компанія завантажена:", data);
      console.log("API Ключ Нової Пошти:", data.apiKeys?.novaPoshta ? "✅ Є" : "❌ Немає");
      setParentCompany(data);
    } catch (error) {
      console.error("Error fetching parent company:", error);
    }
  };

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const url = companyId ? `${API_URL}/${clientId}?companyId=${companyId}` : `${API_URL}/${clientId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch client");
      const data = await response.json();
      
      setForm({
        name: data.name || "",
        companyType: data.companyType || "",
        codeCompany: data.codeCompany || "",
        ipn: data.ipn || "",
        taxSystem: data.taxSystem || "",
        additionalInfo: data.additionalInfo || "",
        logoPath: data.logoPath || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        website: data.website || "",
        
        legalAddress_Country: data.legalAddress_Country || "",
        legalAddress_City: data.legalAddress_City || "",
        legalAddress_Region: data.legalAddress_Region || "",
        legalAddress_PostalCode: data.legalAddress_PostalCode || "",
        legalAddress_StreetAddress: data.legalAddress_StreetAddress || "",
        legalAddress_BuildingNumber: data.legalAddress_BuildingNumber || "",
        legalAddress_ApartmentNumber: data.legalAddress_ApartmentNumber || "",
        
        ukrPoshtaAddress_Country: data.ukrPoshtaAddress_Country || "",
        ukrPoshtaAddress_City: data.ukrPoshtaAddress_City || "",
        ukrPoshtaAddress_Region: data.ukrPoshtaAddress_Region || "",
        ukrPoshtaAddress_PostalCode: data.ukrPoshtaAddress_PostalCode || "",
        ukrPoshtaAddress_StreetAddress: data.ukrPoshtaAddress_StreetAddress || "",
        ukrPoshtaAddress_BuildingNumber: data.ukrPoshtaAddress_BuildingNumber || "",
        ukrPoshtaAddress_ApartmentNumber: data.ukrPoshtaAddress_ApartmentNumber || "",
        
        // Nova Poshta Recipient - розпаковуємо з вкладеного об'єкта
        novaPoshtaRecipientType: data.novaPoshtaRecipient?.recipientType?.toString() || data.novaPoshtaRecipientType?.toString() || "",
        nP_Phone: data.novaPoshtaRecipient?.phone || data.nP_Phone || "",
        nP_LastName: data.novaPoshtaRecipient?.lastName || data.nP_LastName || "",
        nP_FirstName: data.novaPoshtaRecipient?.firstName || data.nP_FirstName || "",
        nP_MiddleName: data.novaPoshtaRecipient?.middleName || data.nP_MiddleName || "",
        nP_EdrpouCode: data.novaPoshtaRecipient?.edrpouCode || data.nP_EdrpouCode || "",
        nP_CompanyName: data.novaPoshtaRecipient?.companyName || data.nP_CompanyName || "",
        nP_OwnershipForm: data.novaPoshtaRecipient?.ownershipForm || data.nP_OwnershipForm || "",
        nP_OrgPhone: data.novaPoshtaRecipient?.organizationPhone || data.nP_OrgPhone || "",
        nP_OrgLastName: data.novaPoshtaRecipient?.organizationLastName || data.nP_OrgLastName || "",
        nP_OrgFirstName: data.novaPoshtaRecipient?.organizationFirstName || data.nP_OrgFirstName || "",
        nP_OrgMiddleName: data.novaPoshtaRecipient?.organizationMiddleName || data.nP_OrgMiddleName || "",
        
        // Nova Poshta Delivery - розпаковуємо з вкладеного об'єкта
        novaPoshtaDeliveryType: data.novaPoshtaDelivery?.deliveryType?.toString() || data.novaPoshtaDeliveryType?.toString() || "",
        npD_City: data.novaPoshtaDelivery?.city || data.npD_City || "",
        npD_Branch: data.novaPoshtaDelivery?.branch || data.npD_Branch || "",
        npD_Street: data.novaPoshtaDelivery?.street || data.npD_Street || "",
        npD_Building: data.novaPoshtaDelivery?.building || data.npD_Building || "",
        npD_Apartment: data.novaPoshtaDelivery?.apartment || data.npD_Apartment || "",
        npD_AddressComment: data.novaPoshtaDelivery?.addressComment || data.npD_AddressComment || "",
        npD_PostomatNumber: data.novaPoshtaDelivery?.postomatNumber || data.npD_PostomatNumber || "",
        npD_DigitalAddressReference: data.novaPoshtaDelivery?.digitalAddressReference || data.npD_DigitalAddressReference || "",
        
        directorFullName: data.directorFullName || "",
        accountantFullName: data.accountantFullName || "",
        bankDetails: data.bankDetails || [{
          typeAccount: 0,
          currency: 0,
          bankName: "",
          bankMfo: "",
          iban: "",
          swift: "",
          bankOfBeneficiary: "",
          correspondentBanks: []
        }],
        apiNovaPoshtaKey: data.apiNovaPoshtaKey || "",
        apiLardyTransKey: data.apiLardyTransKey || ""
      });

      // Використовуємо contactPersons з даних клієнта
      if (data.contactPersons) {
        setPeople(data.contactPersons);
      } else {
        setPeople([]);
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      alert("Помилка завантаження даних клієнта");
    } finally {
      setLoading(false);
    }
  };

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

  const addPerson = async (personData) => {
    try {
      const data = {
        ...personData,
        companyId: parseInt(clientId)
      };

      const response = await fetch(`${PEOPLE_API}/add?companyId=${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Failed to add person");
      
      const addedPerson = await response.json();
      setPeople(prev => [...prev, addedPerson]);
      alert("Працівника успішно додано!");
    } catch (err) {
      console.error("Error adding person:", err);
      alert("Помилка при додаванні працівника");
    }
  };

  const deletePerson = async (personId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цього працівника?")) return;

    try {
      const response = await fetch(`${PEOPLE_API}/${personId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete person");
      
      setPeople(prev => prev.filter(p => p.id !== personId));
      alert("Працівника успішно видалено!");
    } catch (err) {
      console.error("Error deleting person:", err);
      alert("Помилка при видаленні працівника");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.codeCompany) {
      alert("Заповніть обов'язкові поля: Назва компанії та ЄДРПОУ");
      return;
    }

    try {
      // Підготовка даних: конвертуємо порожні рядки в null для int? полів
      const preparedData = {
        ...form,
        novaPoshtaRecipientType: form.novaPoshtaRecipientType === "" ? null : parseInt(form.novaPoshtaRecipientType),
        novaPoshtaDeliveryType: form.novaPoshtaDeliveryType === "" ? null : parseInt(form.novaPoshtaDeliveryType),
        parentCompanyId: companyId
      };

      console.log("Відправка даних клієнта:", preparedData);

      const response = await fetch(`${API_URL}/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Помилка API:", response.status, errorText);
        throw new Error(`Failed to update client: ${response.status} ${errorText}`);
      }
      
      alert("Дані клієнта успішно оновлено!");
      setIsEditing(false);
      setIsEditingNP(false);
      fetchClientData();
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Помилка оновлення даних клієнта");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsEditingNP(false);
    fetchClientData();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Ви впевнені, що хочете видалити клієнта "${form.name}"?\nЦю дію неможливо відмінити!`)) {
      return;
    }

    try {
      const url = companyId ? `${API_URL}/${clientId}?companyId=${companyId}` : `${API_URL}/${clientId}`;
      const response = await fetch(url, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete client");

      alert("Клієнта успішно видалено!");
      navigate("/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Помилка при видаленні клієнта");
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

  return (
    <div className="container mt-4">
      <ClientHeader
        clientName={form.name}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />

      {/* Основна інформація та Керівництво */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <ClientMainInfo form={form} isEditing={isEditing} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <ClientPeople
            people={people}
            isEditing={isEditing}
            onAdd={addPerson}
            onDelete={deletePerson}
          />
        </div>
      </div>

      {/* Адреси */}
      <ClientAddresses form={form} isEditing={isEditing} onChange={handleChange} />

      {/* Нова Пошта */}
      {isEditing && isEditingNP ? (
        <>
          <div className="row g-4 mb-2">
            <div className="col-12 text-end">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsEditingNP(false)}
              >
                ✖️ Закрити редагування
              </button>
            </div>
          </div>
          <NovaPoshtaForm 
            form={form} 
            setForm={setForm} 
            isEditing={true}
            apiNovaPoshta={parentCompany?.apiKeys?.novaPoshta}
          />
        </>
      ) : (
        <>
          <NovaPoshtaDisplay form={form} />
          {isEditing && (
            <div className="row g-4 mb-4">
              <div className="col-12 text-center">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setIsEditingNP(true)}
                >
                  ✏️ Редагувати дані Нової Пошти
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Банківські реквізити */}
      <ClientBankDetails
        form={form}
        isEditing={isEditing}
        onBankChange={handleBankChange}
        onAddBank={addBankAccount}
        onRemoveBank={removeBankAccount}
        onAddCorrespondent={addCorrespondentBank}
        onRemoveCorrespondent={removeCorrespondentBank}
        onCorrespondentChange={handleCorrespondentBankChange}
      />
    </div>
  );
}

export default ClientCard;
