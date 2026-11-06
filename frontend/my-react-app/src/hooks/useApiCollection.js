import { useCallback, useEffect, useState } from "react";
import { useApi } from "../context/ApiContext";

async function parseResponse(response) {
  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || body?.title || `Запит не виконано (${response.status}).`);
  return body;
}

export function useApiCollection(path) {
  const { apiData } = useApi();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async (signal) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiData}${path}`, { credentials: "include", signal });
      const rows = await parseResponse(response);
      if (!Array.isArray(rows)) throw new Error("Сервер повернув дані неправильного формату.");
      setRecords(rows);
      setError("");
      return rows;
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setError(loadError.message || "Не вдалося завантажити дані.");
      }
      throw loadError;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [apiData, path]);

  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal).catch(loadError => {
      if (loadError.name !== "AbortError") console.error("Не вдалося завантажити дані колекції.", loadError);
    });
    return () => controller.abort();
  }, [refresh]);

  const request = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(`${apiData}${url}`, {
        credentials: "include",
        ...options,
      });
      const body = await parseResponse(response);
      await refresh();
      setError("");
      return body;
    } catch (requestError) {
      setError(requestError.message || "Не вдалося зберегти дані.");
      throw requestError;
    }
  }, [apiData, refresh]);

  return { records, loading, error, setError, refresh, request, apiData };
}
