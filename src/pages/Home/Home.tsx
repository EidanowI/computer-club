import NavBar from "../../components/NavBar";
import MainSection from "../../components/MainSection";
import InfoSection from "../../components/InfoSection";
import PriceSection from "../../components/PriceSection";
import ContactsSection from "../../components/ContactsSection";

const navSections = [
  { id: 'home', label: 'О клубе', iconPath: "" },
  { id: 'info', label: 'О клубе', iconPath: "././public/img/nav-icons/info-icon.png" },
  { id: 'price', label: 'Стоимость', iconPath: "././public/img/nav-icons/price-icon.png" },
  { id: 'arenas', label: 'Арены', iconPath: "././public/img/nav-icons/arenas-icon.png" },
  { id: 'devices', label: 'Оборудование', iconPath: "././public/img/nav-icons/device-icon.png" },
  { id: 'compets', label: 'Турниры', iconPath: "././public/img/nav-icons/compets-icon.png" },
  { id: 'contscts', label: 'Контакты', iconPath: "././public/img/nav-icons/contacts.png" },
];

export default function Home() {
  return (
    <div className="app">
      <NavBar sections={navSections} />
      <main className="main-content">
      <section id="home" className="content-section_home">
        <MainSection/>
      </section>

      <section id="info" className="content-section-info">
        <InfoSection/>
      </section>

      <section id="price" className="content-section">
        <PriceSection/>
      </section>

      <section id="arenas" className="content-section">
        <PriceSection/>
      </section>

      <section id="devices" className="content-section">
        <PriceSection/>
      </section>

      <section id="compets" className="content-section">
        <PriceSection/>
      </section>

      <section id="contscts" className="content-section-contacts">
        <ContactsSection/>
      </section>
      </main>
    </div>
  );
}

