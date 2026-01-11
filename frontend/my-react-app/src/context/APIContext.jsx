import { createContext, useContext, useState } from "react";

const APIContext = createContext(null);

export function ApiProvider({ children }) {
  const [apiData, setApiData] = useState("http://92.52.132.62:7060/api");

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
