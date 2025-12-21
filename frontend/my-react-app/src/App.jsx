import { useState } from "react";
import MainLayout from "./layouts/MainLayout";

import HomePage from "./pages/HomePage";
import CompanySettingsPage from "./pages/CompanySettingsPage";
import EditCompanyPage from "./pages/EditCompanyPage";
import TransportPage from "./pages/TransportPage";
import DriversPage from "./pages/DriversPage";
import LoadingCalendarPage from "./pages/LoadingCalendarPage";
import DocumentsCalendarPage from "./pages/DocumentsCalendarPage";
import MyCompanyPage from "./pages/MyCompanyPage";

function App() {
  const [activeSection, setActiveSection] = useState("home");

  const renderPage = () => {
    switch (activeSection) {
      case "settings": return <CompanySettingsPage setActiveSection={setActiveSection} />;
      case "transport": return <TransportPage />;
      case "drivers": return <DriversPage />;
      case "loading": return <LoadingCalendarPage />;
      case "documents": return <DocumentsCalendarPage />;
      case "mycompany": return <MyCompanyPage setActiveSection={setActiveSection} />;
      case "editcompany": return <EditCompanyPage setActiveSection={setActiveSection} />;
      default: return <HomePage setActiveSection={setActiveSection} />;
    }
  };

  return (
    <MainLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    >
      {renderPage()}
    </MainLayout>
  );
}

export default App;
