import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import HomePage from "./pages/HomePage";
import CompanySettingsPage from "./pages/CompanySettingsPage";
import EditCompanyPage from "./pages/EditCompanyPage";
import TransportPage from "./pages/TransportPage";
import DriversPage from "./pages/DriversPage";
import LoadingCalendarPage from "./pages/LoadingCalendarPage";
import DocumentsCalendarPage from "./pages/DocumentsCalendarPage";
import MyCompanyPage from "./pages/MyCompanyPage";
import NovaPoshtaTrackingPage from "./pages/NovaPoshtaTrackingPage";
import TrackingDetailPage from "./pages/TrackingDetailPage";
import TrackingEditPage from "./pages/TrackingEditPage";
import { useCompany } from "./context/CompanyContext";
function App() {
  const [activeSection, setActiveSection] = useState("home");
  const { companyId, setCompanyId } = useCompany();
  

  const renderPage = () => {
    switch (activeSection) {
      case "settings": return <CompanySettingsPage setActiveSection={setActiveSection} />;
      case "transport": return <TransportPage />;
      case "drivers": return <DriversPage />;
      case "loading": return <LoadingCalendarPage />;
      case "documents": return <DocumentsCalendarPage />;
      case "mycompany": return <MyCompanyPage setActiveSection={setActiveSection} />;
      case "editcompany": return <EditCompanyPage setActiveSection={setActiveSection} />;
      case "tracking": return <NovaPoshtaTrackingPage companyId={companyId} />;
      default: return <HomePage setActiveSection={setActiveSection} />;
    }
  };

  return (
    <Routes>
      <Route
        path="/tracking/detail/:trackingId"
        element={<TrackingDetailPage />}
      />
      <Route
        path="/tracking/edit/:trackingId"
        element={<TrackingEditPage />}
      />
      <Route
        path="/*"
        element={
          <MainLayout
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          >
            {renderPage()}
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
