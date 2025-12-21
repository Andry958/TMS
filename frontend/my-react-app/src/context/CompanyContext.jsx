import { createContext, useContext, useState } from "react";

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [companyId, setCompanyId] = useState(null);

  const logout = () => {
    setCompanyId(null);
  };

  return (
    <CompanyContext.Provider value={{ companyId, setCompanyId, logout }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
