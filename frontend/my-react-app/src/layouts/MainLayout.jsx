import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout({ children, activeSection, setActiveSection }) {
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="flex-grow-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
