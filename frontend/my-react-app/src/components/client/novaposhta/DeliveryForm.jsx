import { useEffect } from "react";
import CityAutocomplete from "./CityAutocomplete";

function DeliveryForm({ 
  form, 
  isEditing, 
  onChange, 
  citySearch,
  setCitySearch,
  npCities,
  setNpCities,
  npWarehouses,
  npPostomats,
  selectedCityRef,
  setSelectedCityRef,
  loadingCities,
  loadingWarehouses,
  onLoadWarehouses
}) {
  // Завантаження відділень при зміні міста або типу доставки
  useEffect(() => {
    if (isEditing && selectedCityRef && form?.novaPoshtaDeliveryType && 
        (form.novaPoshtaDeliveryType === "0" || form.novaPoshtaDeliveryType === "2")) {
      onLoadWarehouses(selectedCityRef, form.novaPoshtaDeliveryType);
    }
  }, [selectedCityRef, form?.novaPoshtaDeliveryType, isEditing]);

  const handleCitySelect = (city) => {
    const event = {
      target: {
        name: 'npD_City',
        value: city.Present
      }
    };
    onChange(event);
    setSelectedCityRef(city.DeliveryCity);
    setCitySearch("");
    setNpCities([]);
  };

  if (!isEditing) {
    // Режим перегляду
    return (
      <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
        <h6 className="mb-3" style={{ color: '#e60000' }}>📦 Доставка</h6>
        {form.novaPoshtaDeliveryType === "0" ? (
          <div>
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-danger me-2">🏪 Відділення</span>
            </div>
            <p className="mb-2"><strong>Місто:</strong> {form.npD_City || '-'}</p>
            <p className="mb-0"><strong>Відділення:</strong> {form.npD_Branch || '-'}</p>
          </div>
        ) : form.novaPoshtaDeliveryType === "1" ? (
          <div>
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-danger me-2">🏠 Адреса</span>
            </div>
            <p className="mb-2"><strong>Місто:</strong> {form.npD_City || '-'}</p>
            <p className="mb-2"><strong>Вулиця:</strong> {form.npD_Street || '-'}</p>
            <p className="mb-2"><strong>Будинок:</strong> {form.npD_Building || '-'}</p>
            <p className="mb-2"><strong>Квартира:</strong> {form.npD_Apartment || '-'}</p>
            <p className="mb-0"><strong>Коментар:</strong> {form.npD_AddressComment || '-'}</p>
          </div>
        ) : form.novaPoshtaDeliveryType === "2" ? (
          <div>
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-danger me-2">📫 Поштомат</span>
            </div>
            <p className="mb-2"><strong>Місто:</strong> {form.npD_City || '-'}</p>
            <p className="mb-0"><strong>Поштомат:</strong> {form.npD_PostomatNumber || '-'}</p>
          </div>
        ) : form.novaPoshtaDeliveryType === "3" ? (
          <div>
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-danger me-2">🔢 Цифрова адреса</span>
            </div>
            <p className="mb-0"><strong>Цифрова адреса (референс):</strong> {form.npD_DigitalAddressReference || '-'}</p>
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
      <h6 className="mb-3" style={{ color: '#e60000' }}>📦 Доставка</h6>
      <div className="mb-3">
        <label className="form-label">Тип доставки</label>
        <select className="form-control" name="novaPoshtaDeliveryType" value={form.novaPoshtaDeliveryType || ""} onChange={onChange}>
          <option value="">Не обрано</option>
          <option value="0">🏪 Відділення</option>
          <option value="1">🏠 Адреса</option>
          <option value="2">📫 Поштомат</option>
          <option value="3">🔢 Цифрова адреса</option>
        </select>
      </div>

      {form.novaPoshtaDeliveryType === "0" && (
        <div>
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-danger me-2">🏪 Відділення</span>
          </div>
          <CityAutocomplete
            citySearch={citySearch}
            onSearchChange={setCitySearch}
            cities={npCities}
            onSelectCity={handleCitySelect}
            selectedCity={form.npD_City || ""}
            loading={loadingCities}
          />
          <div className="mb-2">
            <label className="form-label">Відділення</label>
            <select 
              className="form-select" 
              name="npD_Branch" 
              value={form.npD_Branch || ""} 
              onChange={onChange}
              disabled={!selectedCityRef || npWarehouses.length === 0}
            >
              <option value="">Оберіть відділення</option>
              {npWarehouses.map((wh, idx) => (
                <option key={idx} value={wh.Description}>
                  {wh.Description}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {form.novaPoshtaDeliveryType === "1" && (
        <div>
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-danger me-2">🏠 Адреса</span>
          </div>
          <div className="mb-2">
            <label className="form-label">Місто</label>
            <input className="form-control" name="npD_City" value={form.npD_City || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Вулиця</label>
            <input className="form-control" name="npD_Street" value={form.npD_Street || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Будинок</label>
            <input className="form-control" name="npD_Building" value={form.npD_Building || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Квартира</label>
            <input className="form-control" name="npD_Apartment" value={form.npD_Apartment || ""} onChange={onChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Коментар до адреси</label>
            <input className="form-control" name="npD_AddressComment" value={form.npD_AddressComment || ""} onChange={onChange} />
          </div>
        </div>
      )}

      {form.novaPoshtaDeliveryType === "2" && (
        <div>
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-danger me-2">📫 Поштомат</span>
          </div>
          <CityAutocomplete
            citySearch={citySearch}
            onSearchChange={setCitySearch}
            cities={npCities}
            onSelectCity={handleCitySelect}
            selectedCity={form.npD_City || ""}
            loading={loadingCities}
          />
          <div className="mb-2">
            <label className="form-label">Поштомат</label>
            <select 
              className="form-select" 
              name="npD_PostomatNumber" 
              value={form.npD_PostomatNumber || ""} 
              onChange={onChange}
              disabled={!selectedCityRef || npPostomats.length === 0}
            >
              <option value="">Оберіть поштомат</option>
              {npPostomats.map((wh, idx) => (
                <option key={idx} value={wh.Description}>
                  {wh.Description}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {form.novaPoshtaDeliveryType === "3" && (
        <div>
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-danger me-2">🔢 Цифрова адреса</span>
          </div>
          <div className="mb-2">
            <label className="form-label">Референс цифрової адреси</label>
            <input className="form-control" name="npD_DigitalAddressReference" value={form.npD_DigitalAddressReference || ""} onChange={onChange} placeholder="Референс з API Нової Пошти" />
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryForm;
