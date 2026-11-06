import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/authStore";
import { useCompany } from "../context/CompanyContext";
import "../styles/logistNavbar.css";

const menuItems = [
  { id: "requests", label: "Запити", icon: "requests", path: "/requests" },
  { id: "orders", label: "Замовлення", icon: "orders", path: "/orders" },
  { id: "finance", label: "Фінанси", icon: "finance", path: "/finance" },
  { id: "clients", label: "Клієнти", icon: "clients", path: "/clients" },
  { id: "drivers", label: "Водії", icon: "carriers", path: "/drivers" },
  { id: "transport", label: "Транспорт", icon: "transport", path: "/transport" },
  { id: "fleetMap", label: "Карта авто", icon: "map", path: "/fleet-map" },
  { id: "warehouse", label: "Склад", icon: "warehouse", path: "/warehouse" },
  { id: "reports", label: "Звіти", icon: "reports", path: "/reports" },
  { id: "documents", label: "Документи", icon: "documents", path: "/documents" },
  { id: "loading", label: "Календар", icon: "tasks", path: "/loading" },
  { id: "tracking", label: "Трекінг", icon: "tracking", path: "/tracking" },
  { id: "settings", label: "Налаштування", icon: "settings", path: "/settings" },
];

const extraItems = [
  { id: "home", label: "Головна", path: "/" },
  { id: "mycompany", label: "Профіль компанії", path: "/mycompany" },
  { id: "editcompany", label: "Редагувати компанію", path: "/editcompany" },
];

function MenuIcon({ name }) {
  const paths = {
    requests: <><path d="M4 5h16v12H8l-4 3z"/><path d="M8 9h8M8 13h5"/><path d="M16 3v4M12 3v2"/></>,
    orders: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="m15 3 2 2"/></>,
    finance: <><path d="M12 3v18M17 7.5c0-1.4-1.7-2.5-4.5-2.5S8 6.1 8 7.5 9.5 10 12.5 10s4.5 1.1 4.5 2.5-1.7 2.5-4.5 2.5S8 13.9 8 12.5"/><path d="M5 20h14"/></>,
    clients: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1z"/><path d="M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4.5V20h-3"/></>,
    carriers: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M14 15a4.5 4.5 0 0 1 7.5 3.4V20"/></>,
    transport: <><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M16 10v3h5"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/><circle cx="15" cy="10" r="1.5"/></>,
    warehouse: <><path d="m3 10 9-6 9 6v10H3z"/><path d="M8 20v-7h8v7M3 10h18"/></>,
    reports: <><path d="M4 20V5M4 20h17"/><path d="m7 16 4-5 3 2 5-7"/><path d="M16 6h3v3"/></>,
    documents: <><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v6h5M9 13h7M9 17h7"/></>,
    tasks: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14l2 2 5-4"/></>,
    tracking: <><path d="M3 17h2l2-7 4 10 3-7 2 4h5"/><circle cx="18" cy="6" r="2"/><path d="M4 5h7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2 1-1.5 2.6-1.5-.6a8 8 0 0 1-1.7 1l-.3 1.6h-3l-.3-1.6a8 8 0 0 1-1.7-1l-1.5.6-1.5-2.6 1.2-1a7 7 0 0 1 0-2l-1.2-1 1.5-2.6 1.5.6a8 8 0 0 1 1.7-1l.3-1.6h3l.3 1.6a8 8 0 0 1 1.7 1l1.5-.6 1.5 2.6-1.2 1a7 7 0 0 1 0 2z" transform="translate(-1 -1) scale(1.08)"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    bookmark: <><path d="M6 4h12v17l-6-4-6 4z"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    exit: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}

function Navbar({ activeSection, setActiveSection }) {
  const location = useLocation();
  const [extraOpen, setExtraOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { logout: logoutCompany } = useCompany();
  const currentSection = [...menuItems, ...extraItems].find(({ id, path }) =>
    id !== "home" && location.pathname.startsWith(path)
  )?.id ?? (location.pathname === "/" ? "home" : activeSection);

  const goTo = (section) => {
    setActiveSection(section);
    setExtraOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    setExtraOpen(false);
    setMobileOpen(false);
    setActiveSection("home");
    logoutCompany();
    await logout();
  };

  return (
    <header className="logist-header">
      <button className="logist-header__hamburger" type="button" aria-label="Відкрити додаткове меню" aria-expanded={extraOpen} onClick={() => setExtraOpen(!extraOpen)}>
        <MenuIcon name="menu" />
      </button>
      <button className="logist-brand" type="button" onClick={() => goTo("home")} aria-label="Logist — головна">
        <img className="logist-brand__logo" src="/logist-truck.png" alt="" />
        <span className="logist-brand__name">EMAL Ltd.</span>
      </button>

      <button className="logist-mobile-toggle" type="button" aria-label="Меню розділів" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
        <MenuIcon name="menu" />
      </button>

      <nav className={`logist-menu${mobileOpen ? " is-open" : ""}`} aria-label="Основне меню">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`logist-menu__item${currentSection === item.id ? " is-active" : ""}`}
            onClick={() => goTo(item.id)}
            aria-current={currentSection === item.id ? "page" : undefined}
          >
            <MenuIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="logist-tools" aria-label="Дії користувача">
        <button type="button" className="logist-tool logist-tool--language" title="Мова"><MenuIcon name="globe"/><span>UA</span></button>
        <button type="button" className="logist-tool" title={user?.email || "Профіль"} onClick={() => goTo("mycompany")}><MenuIcon name="profile"/></button>
        <button type="button" className="logist-tool logist-tool--optional" title="Редагувати компанію" onClick={() => goTo("editcompany")}><MenuIcon name="bookmark"/></button>
        <button type="button" className="logist-tool logist-tool--notification" title="Сповіщення"><MenuIcon name="bell"/><span>4</span></button>
        <button type="button" className="logist-tool logist-tool--notification" title="Вийти" onClick={handleLogout}><MenuIcon name="exit"/></button>
      </div>

      {extraOpen && (
        <div className="logist-extra-menu">
          {extraItems.map((item) => (
            <button key={item.id} type="button" onClick={() => goTo(item.id)}>{item.label}</button>
          ))}
        </div>
      )}
    </header>
  );
}

export default Navbar;
