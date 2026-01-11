function CityAutocomplete({ 
  citySearch, 
  onSearchChange, 
  cities, 
  onSelectCity, 
  selectedCity, 
  loading 
}) {
  return (
    <div className="mb-2">
      <label className="form-label">
        Місто <span className="badge bg-info ms-2">🔍 Пошук</span>
      </label>
      <input 
        className="form-control mb-2" 
        placeholder="Почніть вводити назву міста..."
        value={citySearch}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {loading && <div className="text-muted small">Завантаження...</div>}
      {cities.length > 0 && (
        <div className="list-group mb-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
          {cities.map((city, idx) => (
            <button
              key={idx}
              type="button"
              className="list-group-item list-group-item-action"
              onClick={() => onSelectCity(city)}
            >
              {city.Present}
            </button>
          ))}
        </div>
      )}
      <input 
        className="form-control" 
        value={selectedCity}
        readOnly 
        placeholder="Обране місто"
      />
    </div>
  );
}

export default CityAutocomplete;
