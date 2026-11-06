import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout({ children, activeSection, setActiveSection }) {
  const location = useLocation();
  const isFleetMap = location.pathname === "/fleet-map";

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className={`flex-grow-1${isFleetMap ? " main-layout__map" : ""}`}>
        {children}
      </main>

      {!isFleetMap && <Footer />}
    </div>
  );
}

export default MainLayout;
