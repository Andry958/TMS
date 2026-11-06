import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/authStore";
import { useCompany } from "../context/CompanyContext";

function readCollection(key) {
  const value = window.localStorage.getItem(key);
  if (!value) return [];
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("Збережені локальні дані мають неправильний формат.");
  return parsed;
}

export function useLocalCollection(collectionName) {
  const { companyId } = useCompany();
  const { user } = useAuth();
  const storageKey = useMemo(
    () => `tms:${collectionName}:user:${user?.id ?? "anonymous"}:company:${companyId ?? "none"}`,
    [collectionName, companyId, user?.id],
  );
  const [collection, setCollection] = useState({ key: "", records: [], error: "" });
  const records = collection.key === storageKey ? collection.records : [];
  const error = collection.key === storageKey ? collection.error : "";

  useEffect(() => {
    try {
      setCollection({ key: storageKey, records: readCollection(storageKey), error: "" });
    } catch (loadError) {
      setCollection({
        key: storageKey,
        records: [],
        error: loadError.message || "Не вдалося прочитати локальні дані.",
      });
    }
  }, [storageKey]);

  const saveRecords = useCallback((nextRecords) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextRecords));
      setCollection({ key: storageKey, records: nextRecords, error: "" });
      return true;
    } catch (saveError) {
      setCollection(current => ({
        key: storageKey,
        records: current.key === storageKey ? current.records : [],
        error: saveError.message || "Не вдалося зберегти дані в браузері.",
      }));
      return false;
    }
  }, [storageKey]);

  return { records, error, saveRecords };
}
