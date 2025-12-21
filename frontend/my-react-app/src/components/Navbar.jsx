import { useCompany } from "../context/CompanyContext";

const Layout = ({ children, activeSection, setActiveSection }) => {
  const { companyId } = useCompany();

  return (
    <div style={{  backgroundColor: "#f8f9fa" }}>
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-primary" href="#" onClick={() => setActiveSection("home")}>
            🚛 LogiSystem
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "mycompany" ? "active text-white" : ""}`} href="#" onClick={() => setActiveSection("mycompany")}>
                  Твоя компанія
                </a>
              </li>

              {!companyId && (
                <li className="nav-item">
                  <a className={`nav-link ${activeSection === "settings" ? "active text-white" : ""}`} href="#" onClick={() => setActiveSection("settings")}>
                    Налаштування компанії
                  </a>
                </li>
              )}

              <li className="nav-item">
                <a className={`nav-link ${activeSection === "transport" ? "active text-white" : ""}`} href="#" onClick={() => setActiveSection("transport")}>
                  Мій транспорт
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "drivers" ? "active text-white" : ""}`} href="#" onClick={() => setActiveSection("drivers")}>
                  Мої водії
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "loading" ? "active text-white" : ""}`} href="#" onClick={() => setActiveSection("loading")}>
                  Календар завантажень
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "documents" ? "active text-white" : ""}`} href="#" onClick={() => setActiveSection("documents")}>
                  Календар дії документів
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
