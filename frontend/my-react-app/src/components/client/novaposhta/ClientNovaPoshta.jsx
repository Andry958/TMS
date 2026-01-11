import RecipientForm from "./RecipientForm";
import DeliveryForm from "./DeliveryForm";
import { useNovaPoshta } from "./useNovaPoshta";

function ClientNovaPoshta({ form, isEditing, onChange, apiData, parentCompany, setForm }) {
  const {
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
    loadWarehousesForCity,
    searchCompanyByEdrpou
  } = useNovaPoshta(apiData, parentCompany?.apiNovaPoshtaKey, isEditing);

  const handleEdrpouSearch = async (edrpou) => {
    const result = await searchCompanyByEdrpou(edrpou);
    if (result) {
      setForm(prev => ({
        ...prev,
        nP_CompanyName: result.companyName || prev.nP_CompanyName,
        nP_OwnershipForm: result.ownershipForm || prev.nP_OwnershipForm
      }));
      return result;
    }
    return null;
  };

  return (
    <div className="row g-4 mb-4">
      <div className="col-12">
        <div className="card shadow-sm" style={{ borderLeft: '4px solid #e60000' }}>
          <div className="card-body">
            <h5 className="mb-3" style={{ color: '#e60000' }}>🚚 Нова Пошта</h5>
            
            <div className="row g-4">
              <div className="col-md-6">
                <RecipientForm 
                  form={form}
                  isEditing={isEditing}
                  onChange={onChange}
                  onEdrpouSearch={handleEdrpouSearch}
                />
              </div>

              <div className="col-md-6">
                <DeliveryForm
                  form={form}
                  isEditing={isEditing}
                  onChange={onChange}
                  citySearch={citySearch}
                  setCitySearch={setCitySearch}
                  npCities={npCities}
                  setNpCities={setNpCities}
                  npWarehouses={npWarehouses}
                  npPostomats={npPostomats}
                  selectedCityRef={selectedCityRef}
                  setSelectedCityRef={setSelectedCityRef}
                  loadingCities={loadingCities}
                  loadingWarehouses={loadingWarehouses}
                  onLoadWarehouses={loadWarehousesForCity}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientNovaPoshta;
