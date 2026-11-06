import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import HomePage from "./pages/HomePage";
import CompanySettingsPage from "./pages/CompanySettingsPage";
import EditCompanyPage from "./pages/EditCompanyPage";
import TransportPage from "./pages/TransportPage";
const FleetMapPage = lazy(() => import("./pages/FleetMapPage"));
import DriversPage from "./pages/DriversPage";
import LoadingCalendarPage from "./pages/LoadingCalendarPage";
import DocumentsCalendarPage from "./pages/DocumentsCalendarPage";
import MyCompanyPage from "./pages/MyCompanyPage";
import NovaPoshtaTrackingPage from "./pages/NovaPoshtaTrackingPage";
import TrackingDetailPage from "./pages/TrackingDetailPage";
import TrackingEditPage from "./pages/TrackingEditPage";
import ClientsPage from "./pages/ClientsPage";
import ClientCard from "./pages/ClientCard";
import CreateClientForm from "./pages/CreateClientForm";
import RequestsPage from "./pages/RequestsPage";
import RequestDetailsPage from "./pages/RequestDetailsPage";
import OrdersPage from "./pages/OrdersPage";
import FinancePage from "./pages/FinancePage";
import WarehousePage from "./pages/WarehousePage";
import ReportsPage from "./pages/ReportsPage";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./context/authStore";
import { useCompany } from "./context/CompanyContext";

const sectionPaths = {
  home: "/",
  requests: "/requests",
  orders: "/orders",
  finance: "/finance",
  clients: "/clients",
  drivers: "/drivers",
  transport: "/transport",
  fleetMap: "/fleet-map",
  warehouse: "/warehouse",
  reports: "/reports",
  documents: "/documents",
  loading: "/loading",
  tracking: "/tracking",
  settings: "/settings",
  mycompany: "/mycompany",
  editcompany: "/editcompany",
};

function App() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { companyId } = useCompany();

  const setActiveSection = (section) => navigate(sectionPaths[section] || "/");

  if (isLoading) {
    return <div className="text-center p-5" role="status">Завантаження...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  const withLayout = (section, page) => (
    <MainLayout activeSection={section} setActiveSection={setActiveSection}>
      {page}
    </MainLayout>
  );

  return (
    <Routes>
      <Route path="/tracking/detail/:trackingId" element={<TrackingDetailPage />} />
      <Route path="/tracking/edit/:trackingId" element={<TrackingEditPage />} />
      <Route path="/clients/create" element={withLayout("clients", <CreateClientForm />)} />
      <Route path="/clients/:clientId" element={withLayout("clients", <ClientCard />)} />
      <Route path="/clients" element={withLayout("clients", <ClientsPage />)} />
      <Route path="/requests/:requestId" element={withLayout("requests", <RequestDetailsPage />)} />
      <Route path="/requests" element={withLayout("requests", <RequestsPage />)} />
      <Route path="/orders/:orderId?" element={withLayout("orders", <OrdersPage />)} />
      <Route path="/finance" element={withLayout("finance", <FinancePage />)} />
      <Route path="/drivers" element={withLayout("drivers", <DriversPage />)} />
      <Route path="/transport" element={withLayout("transport", <TransportPage />)} />
      <Route path="/fleet-map" element={withLayout("fleetMap", (
        <Suspense fallback={<div className="p-5 text-center" role="status">Завантаження карти…</div>}>
          <FleetMapPage />
        </Suspense>
      ))} />
      <Route path="/warehouse" element={withLayout("warehouse", <WarehousePage />)} />
      <Route path="/reports" element={withLayout("reports", <ReportsPage />)} />
      <Route path="/documents" element={withLayout("documents", <DocumentsCalendarPage />)} />
      <Route path="/loading" element={withLayout("loading", <LoadingCalendarPage />)} />
      <Route path="/tracking" element={withLayout("tracking", <NovaPoshtaTrackingPage companyId={companyId} />)} />
      <Route path="/settings" element={withLayout("settings", <CompanySettingsPage setActiveSection={setActiveSection} />)} />
      <Route path="/mycompany" element={withLayout("mycompany", <MyCompanyPage setActiveSection={setActiveSection} />)} />
      <Route path="/editcompany" element={withLayout("editcompany", <EditCompanyPage setActiveSection={setActiveSection} />)} />
      <Route path="/" element={withLayout("home", <HomePage setActiveSection={setActiveSection} />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
