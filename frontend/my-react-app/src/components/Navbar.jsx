import { useCompany } from "../context/CompanyContext";
import { useNavigate, useLocation } from "react-router-dom";

const Layout = ({ children, activeSection, setActiveSection }) => {
  const { companyId } = useCompany();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (section, path = null) => {
    if (path) {
      navigate(path);
    } else {
      navigate('/');
      setActiveSection(section);
    }
  };

  const isClientsPage = location.pathname.startsWith('/clients');

  return (
    <div style={{  backgroundColor: "#f8f9fa" }}>
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-primary" href="#" onClick={(e) => { e.preventDefault(); navigate('/'); setActiveSection("home"); }}>
            🚛 LogiSystem
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "mycompany" && !isClientsPage ? "active text-white" : ""}`} href="#" onClick={(e) => { e.preventDefault(); handleNavigation("mycompany"); }}>
                  Твоя компанія
                </a>
              </li>

              {!companyId && (
                <li className="nav-item">
                  <a className={`nav-link ${activeSection === "settings" && !isClientsPage ? "active text-white" : ""}`} href="#" onClick={(e) => { e.preventDefault(); handleNavigation("settings"); }}>
                    Налаштування компанії
                  </a>
                </li>
              )}

              <li className="nav-item">
                <a className={`nav-link ${isClientsPage ? "active text-white" : ""}`} href="#" onClick={(e) => { e.preventDefault(); handleNavigation("clients", "/clients"); }}>
                  👥 Клієнти
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link ${activeSection === "transport" && !isClientsPage ? "active text-white" : ""}`} href="#" onClick={(e) => { e.preventDefault(); handleNavigation("transport"); }}>
                  Мій транспорт
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "drivers" && !isClientsPage ? "active text-white" : ""}`} href="#" onClick={(e) => { e.preventDefault(); handleNavigation("drivers"); }}>
                  Мої водії
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "loading" && !isClientsPage ? "active text-white" : ""}`} href="#" onClick={(e) => { e.preventDefault(); handleNavigation("loading"); }}>
                  Календар завантажень
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "documents" && !isClientsPage ? "active text-white" : ""}`} href="#" onClick={(e) => { e.preventDefault(); handleNavigation("documents"); }}>
                  Календар дії документів
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === "tracking" && !isClientsPage ? "active text-white" : ""}`} href="#" onClick={(e) => { e.preventDefault(); handleNavigation("tracking"); }}>
                  🚚 Трекінг
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
