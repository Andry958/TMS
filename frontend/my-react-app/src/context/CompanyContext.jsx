import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authStore";

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSelectedCompany(null);
    }
  }, [user]);

  const companyId = user
    ? (selectedCompany?.userId === user.id ? selectedCompany.id : user.companyId ?? null)
    : null;

  const setCompanyId = (id) => {
    setSelectedCompany({ userId: user?.id ?? null, id });
  };

  const logout = () => {
    setSelectedCompany(null);
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
