import { useState, useEffect } from "react";

export function useNovaPoshta(apiData, apiKey, isEditing) {
  const [citySearch, setCitySearch] = useState("");
  const [npCities, setNpCities] = useState([]);
  const [npWarehouses, setNpWarehouses] = useState([]);
  const [npPostomats, setNpPostomats] = useState([]);
  const [selectedCityRef, setSelectedCityRef] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Пошук міст
  useEffect(() => {
    if (!isEditing || !apiKey || !citySearch || citySearch.length < 2) {
      setNpCities([]);
      setLoadingCities(false);
      return;
    }

    console.log("Пошук міста:", citySearch);
    setLoadingCities(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiData}/novaposhta/address/search-settlements?apiKey=${encodeURIComponent(apiKey)}&cityName=${encodeURIComponent(citySearch)}&limit=20`
        );
        const json = await res.json();
        console.log("Результат пошуку міст:", json);
        
        if (json?.data?.[0]?.Addresses) {
          setNpCities(json.data[0].Addresses);
        }
      } catch (error) {
        console.error("Помилка пошуку міст:", error);
      } finally {
        setLoadingCities(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [citySearch, apiKey, apiData, isEditing]);

  // Завантаження відділень/поштоматів
  const loadWarehousesForCity = async (cityRef, deliveryType) => {
    if (!apiKey || !cityRef) return;

    console.log("Завантаження відділень для міста:", cityRef, "Тип:", deliveryType);
    setLoadingWarehouses(true);
    try {
      let endpoint = "";
      if (deliveryType === "0") {
        endpoint = `${apiData}/novaposhta/address/warehouses?apiKey=${encodeURIComponent(apiKey)}&cityRef=${encodeURIComponent(cityRef)}`;
      } else if (deliveryType === "2") {
        endpoint = `${apiData}/novaposhta/address/postomats?apiKey=${encodeURIComponent(apiKey)}&cityRef=${encodeURIComponent(cityRef)}`;
      }

      if (endpoint) {
        const res = await fetch(endpoint);
        const json = await res.json();
        console.log("Результат завантаження відділень:", json);
        
        if (json?.data) {
          if (deliveryType === "2") {
            setNpPostomats(json.data);
            setNpWarehouses([]);
          } else {
            setNpWarehouses(json.data);
            setNpPostomats([]);
          }
        }
      }
    } catch (error) {
      console.error("Помилка завантаження відділень:", error);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Автопошук компанії по ЄДРПОУ
  const searchCompanyByEdrpou = async (edrpou) => {
    if (!apiKey || !edrpou || edrpou.length !== 8) return null;

    try {
      const res = await fetch(
        `${apiData}/novaposhta/counterparty/by-edrpou?apiKey=${encodeURIComponent(apiKey)}&edrpou=${encodeURIComponent(edrpou)}`
      );
      const json = await res.json();

      if (json?.success && json?.companyName) {
        return {
          companyName: json.companyName,
          ownershipForm: json.ownershipForm
        };
      }
    } catch (error) {
      console.error("Помилка пошуку компанії:", error);
    }
    return null;
  };

  return {
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
  };
}
