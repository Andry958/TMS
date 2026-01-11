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

function ClientMainInfo({ form, isEditing, onChange }) {
  return (
    <Section title="Основна інформація">
      <div className="mb-2">
        <label className="form-label fw-bold">Назва компанії</label>
        {isEditing ? (
          <input className="form-control" name="name" value={form.name || ""} onChange={onChange} />
        ) : (
          <p>{form.name || '-'}</p>
        )}
      </div>
      <div className="mb-2">
        <label className="form-label fw-bold">Тип компанії</label>
        {isEditing ? (
          <select className="form-control" name="companyType" value={form.companyType || ""} onChange={onChange}>
            <option value="">Оберіть тип</option>
            <option value="Власник вантажу">Власник вантажу</option>
            <option value="Перевізник">Перевізник</option>
            <option value="Експедитор">Експедитор</option>
          </select>
        ) : (
          <p>{form.companyType || '-'}</p>
        )}
      </div>
      <div className="mb-2">
        <label className="form-label fw-bold">ЄДРПОУ</label>
        {isEditing ? (
          <input className="form-control" name="codeCompany" value={form.codeCompany || ""} onChange={onChange} />
        ) : (
          <p><code>{form.codeCompany || '-'}</code></p>
        )}
      </div>
      <div className="mb-2">
        <label className="form-label fw-bold">ІПН</label>
        {isEditing ? (
          <input className="form-control" name="ipn" value={form.ipn || ""} onChange={onChange} />
        ) : (
          <p>{form.ipn || '-'}</p>
        )}
      </div>
      <div className="mb-2">
        <label className="form-label fw-bold">Система оподаткування</label>
        {isEditing ? (
          <input className="form-control" name="taxSystem" value={form.taxSystem || ""} onChange={onChange} />
        ) : (
          <p>{form.taxSystem || '-'}</p>
        )}
      </div>
    </Section>
  );
}

export default ClientMainInfo;
