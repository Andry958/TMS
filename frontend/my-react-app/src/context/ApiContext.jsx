import { createContext, useContext, useState } from "react";

const APIContext = createContext(null);

export function ApiProvider({ children }) {
  const [apiData, setApiData] = useState(`${window.location.origin}/api`);

  const logout = () => {
    setApiData(null);
  };

  return (
    <APIContext.Provider value={{ apiData, setApiData, logout }}>
      {children}
    </APIContext.Provider>
  );
}

export function useApi() {
  return useContext(APIContext);
}
