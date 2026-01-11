import { useEffect } from "react";

function RecipientForm({ form, isEditing, onChange, onEdrpouSearch }) {
  // Автопошук при зміні ЄДРПОУ
  useEffect(() => {
    if (isEditing && form.nP_EdrpouCode && form.nP_EdrpouCode.length === 8) {
      const timeout = setTimeout(async () => {
        const result = await onEdrpouSearch(form.nP_EdrpouCode);
        if (result) {
          alert("✅ Компанію знайдено в Новій Пошті");
        }
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [form.nP_EdrpouCode, isEditing]);

  if (!isEditing) {
    // Режим перегляду
    return (
      <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
        <h6 className="mb-3" style={{ color: '#e60000' }}>👤 Отримувач</h6>
        {form.novaPoshtaRecipientType === "0" ? (
          <div>
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-danger me-2">🧑 Приватна особа</span>
            </div>
            <p className="mb-2"><strong>ПІБ:</strong> {form.nP_LastName} {form.nP_FirstName} {form.nP_MiddleName}</p>
            <p className="mb-0"><strong>Телефон:</strong> {form.nP_Phone || '-'}</p>
          </div>
        ) : form.novaPoshtaRecipientType === "1" ? (
          <div>
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-danger me-2">🏢 Організація</span>
            </div>
            <p className="mb-2"><strong>Компанія:</strong> {form.nP_OwnershipForm} "{form.nP_CompanyName}"</p>
            <p className="mb-2"><strong>ЄДРПОУ:</strong> {form.nP_EdrpouCode || '-'}</p>
            <p className="mb-2"><strong>Контактна особа:</strong> {form.nP_OrgLastName} {form.nP_OrgFirstName} {form.nP_OrgMiddleName}</p>
            <p className="mb-0"><strong>Телефон:</strong> {form.nP_OrgPhone || '-'}</p>
          </div>
        ) : (
          <p className="text-muted mb-0">Дані не вказані</p>
        )}
      </div>
    );
  }

  // Режим редагування
  return (
    <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
      <h6 className="mb-3" style={{ color: '#e60000' }}>👤 Отримувач</h6>
      <div className="mb-3">
        <label className="form-label">Тип отримувача</label>
        <select className="form-control" name="novaPoshtaRecipientType" value={form.novaPoshtaRecipientType || ""} onChange={onChange}>
          <option value="">Не обрано</option>
          <option value="0">🧑 Приватна особа</option>
          <option value="1">🏢 Організація</option>
        </select>
      </div>

      {form.novaPoshtaRecipientType === "0" && (
        <div>
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-danger me-2">🧑 Приватна особа</span>
          </div>
          <div className="mb-2">
            <label className="form-label">Телефон</label>
            <input className="form-control" name="nP_Phone" value={form.nP_Phone || ""} onChange={onChange} placeholder="+380..." />
          </div>
          <div className="mb-2">
            <label className="form-label">Прізвище</label>
            <input className="form-control" name="nP_LastName" value={form.nP_LastName || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Ім'я</label>
            <input className="form-control" name="nP_FirstName" value={form.nP_FirstName || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">По батькові</label>
            <input className="form-control" name="nP_MiddleName" value={form.nP_MiddleName || ""} onChange={onChange} />
          </div>
        </div>
      )}

      {form.novaPoshtaRecipientType === "1" && (
        <div>
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-danger me-2">🏢 Організація</span>
          </div>
          <div className="mb-2">
            <label className="form-label">ЄДРПОУ <span className="badge bg-info ms-2">🔍 Автопошук</span></label>
            <input 
              className="form-control" 
              name="nP_EdrpouCode" 
              value={form.nP_EdrpouCode || ""} 
              onChange={onChange}
              placeholder="Введіть ЄДРПОУ для автопошуку"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Назва компанії</label>
            <input className="form-control" name="nP_CompanyName" value={form.nP_CompanyName || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Форма власності</label>
            <input className="form-control" name="nP_OwnershipForm" value={form.nP_OwnershipForm || ""} onChange={onChange} placeholder="ТОВ, ПП..." />
          </div>
          <div className="mb-2">
            <label className="form-label">Телефон</label>
            <input className="form-control" name="nP_OrgPhone" value={form.nP_OrgPhone || ""} onChange={onChange} placeholder="+380..." />
          </div>
          <div className="mb-2">
            <label className="form-label">Прізвище контактної особи</label>
            <input className="form-control" name="nP_OrgLastName" value={form.nP_OrgLastName || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Ім'я</label>
            <input className="form-control" name="nP_OrgFirstName" value={form.nP_OrgFirstName || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">По батькові</label>
            <input className="form-control" name="nP_OrgMiddleName" value={form.nP_OrgMiddleName || ""} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipientForm;
