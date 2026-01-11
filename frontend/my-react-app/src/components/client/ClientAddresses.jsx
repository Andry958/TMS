function Section({ title, children, style }) {
  return (
    <div className="card shadow-sm h-100" style={style}>
      <div className="card-body">
        <h5 className="mb-3">{children.title}</h5>
        {children.content}
      </div>
    </div>
  );
}

function LegalAddress({ form, isEditing, onChange }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-3">Юридична адреса</h5>
        {isEditing ? (
          <>
            <div className="mb-2">
              <label className="form-label">Вулиця</label>
              <input className="form-control" name="legalAddress_StreetAddress" value={form.legalAddress_StreetAddress || ""} onChange={onChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Будинок / Квартира</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Буд." name="legalAddress_BuildingNumber" value={form.legalAddress_BuildingNumber || ""} onChange={onChange} />
                <input className="form-control" placeholder="Кв." name="legalAddress_ApartmentNumber" value={form.legalAddress_ApartmentNumber || ""} onChange={onChange} />
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Місто / Регіон</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Місто" name="legalAddress_City" value={form.legalAddress_City || ""} onChange={onChange} />
                <input className="form-control" placeholder="Регіон" name="legalAddress_Region" value={form.legalAddress_Region || ""} onChange={onChange} />
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Країна / Індекс</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Країна" name="legalAddress_Country" value={form.legalAddress_Country || ""} onChange={onChange} />
                <input className="form-control" placeholder="Індекс" name="legalAddress_PostalCode" value={form.legalAddress_PostalCode || ""} onChange={onChange} />
              </div>
            </div>
          </>
        ) : (
          <p>
            {[
              form.legalAddress_StreetAddress,
              form.legalAddress_BuildingNumber && `буд. ${form.legalAddress_BuildingNumber}`,
              form.legalAddress_ApartmentNumber && `кв. ${form.legalAddress_ApartmentNumber}`,
              form.legalAddress_City,
              form.legalAddress_Region,
              form.legalAddress_PostalCode,
              form.legalAddress_Country
            ].filter(Boolean).join(', ') || '-'}
          </p>
        )}
      </div>
    </div>
  );
}

function PostalAddress({ form, isEditing, onChange }) {
  return (
    <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
      <div className="card-body">
        <h5 className="mb-3" style={{ color: '#e60000' }}>📮 Фактична (Поштова) адреса</h5>
        {isEditing ? (
          <>
            <div className="row g-2">
              <div className="col-8">
                <label className="form-label">Вулиця</label>
                <input className="form-control" name="ukrPoshtaAddress_StreetAddress" value={form.ukrPoshtaAddress_StreetAddress || ""} onChange={onChange} placeholder="Вулиця" />
              </div>
              <div className="col-2">
                <label className="form-label">Буд.</label>
                <input className="form-control" name="ukrPoshtaAddress_BuildingNumber" value={form.ukrPoshtaAddress_BuildingNumber || ""} onChange={onChange} placeholder="№" />
              </div>
              <div className="col-2">
                <label className="form-label">Кв.</label>
                <input className="form-control" name="ukrPoshtaAddress_ApartmentNumber" value={form.ukrPoshtaAddress_ApartmentNumber || ""} onChange={onChange} placeholder="№" />
              </div>
            </div>
            <div className="row g-2 mt-1">
              <div className="col-6">
                <label className="form-label">Місто</label>
                <input className="form-control" name="ukrPoshtaAddress_City" value={form.ukrPoshtaAddress_City || ""} onChange={onChange} placeholder="Місто" />
              </div>
              <div className="col-6">
                <label className="form-label">Регіон</label>
                <input className="form-control" name="ukrPoshtaAddress_Region" value={form.ukrPoshtaAddress_Region || ""} onChange={onChange} placeholder="Область" />
              </div>
            </div>
            <div className="row g-2 mt-1">
              <div className="col-6">
                <label className="form-label">Країна</label>
                <input className="form-control" name="ukrPoshtaAddress_Country" value={form.ukrPoshtaAddress_Country || ""} onChange={onChange} placeholder="Україна" />
              </div>
              <div className="col-6">
                <label className="form-label">Індекс</label>
                <input className="form-control" name="ukrPoshtaAddress_PostalCode" value={form.ukrPoshtaAddress_PostalCode || ""} onChange={onChange} placeholder="00000" />
              </div>
            </div>
          </>
        ) : (
          <p>
            {[
              form.ukrPoshtaAddress_StreetAddress,
              form.ukrPoshtaAddress_BuildingNumber && `буд. ${form.ukrPoshtaAddress_BuildingNumber}`,
              form.ukrPoshtaAddress_ApartmentNumber && `кв. ${form.ukrPoshtaAddress_ApartmentNumber}`,
              form.ukrPoshtaAddress_City,
              form.ukrPoshtaAddress_Region,
              form.ukrPoshtaAddress_PostalCode,
              form.ukrPoshtaAddress_Country
            ].filter(Boolean).join(', ') || '-'}
          </p>
        )}
      </div>
    </div>
  );
}

function AdditionalInfo({ form, isEditing, onChange }) {
  return (
    <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
      <div className="card-body">
        <h5 className="mb-3" style={{ color: '#e60000' }}>📝 Додаткова інформація</h5>
        {isEditing ? (
          <textarea className="form-control" rows="8" name="additionalInfo" value={form.additionalInfo || ""} onChange={onChange} placeholder="Коментар / примітки" />
        ) : (
          <p>{form.additionalInfo || '-'}</p>
        )}
      </div>
    </div>
  );
}

function ClientAddresses({ form, isEditing, onChange }) {
  return (
    <>
      {/* Контактна та Юридична адреса */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <ClientContacts form={form} isEditing={isEditing} onChange={onChange} />
        </div>
        <div className="col-md-6">
          <LegalAddress form={form} isEditing={isEditing} onChange={onChange} />
        </div>
      </div>

      {/* Укр. пошта та Додаткова інформація */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <PostalAddress form={form} isEditing={isEditing} onChange={onChange} />
        </div>
        <div className="col-md-6">
          <AdditionalInfo form={form} isEditing={isEditing} onChange={onChange} />
        </div>
      </div>
    </>
  );
}

function ClientContacts({ form, isEditing, onChange }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-3">Контактна інформація</h5>
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
      </div>
    </div>
  );
}

export default ClientAddresses;
