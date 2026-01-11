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

function ClientContacts({ form, isEditing, onChange }) {
  return (
    <Section title="Контактна інформація">
      <div className="mb-2">
        <label className="form-label fw-bold">Телефон</label>
        {isEditing ? (
          <input className="form-control" name="phoneNumber" value={form.phoneNumber || ""} onChange={onChange} />
        ) : (
          <p>{form.phoneNumber || '-'}</p>
        )}
      </div>
      <div className="mb-2">
        <label className="form-label fw-bold">Email</label>
        {isEditing ? (
          <input className="form-control" type="email" name="email" value={form.email || ""} onChange={onChange} />
        ) : (
          <p>{form.email || '-'}</p>
        )}
      </div>
      <div className="mb-2">
        <label className="form-label fw-bold">Сайт</label>
        {isEditing ? (
          <input className="form-control" name="website" value={form.website || ""} onChange={onChange} />
        ) : (
          <p>{form.website ? <a href={form.website} target="_blank" rel="noopener noreferrer">{form.website}</a> : '-'}</p>
        )}
      </div>
    </Section>
  );
}

export default ClientContacts;
