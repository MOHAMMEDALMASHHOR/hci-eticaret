import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { CookieBanner, FlashBanner, Navbar, Hero, Footer, Toast } from './components/Layout';
import { Shop } from './components/Shop';
import { About } from './components/About';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { ModalsContainer } from './components/Modals';
import { ObserverPanel } from './components/ObserverPanel';
import { PopupAd } from './components/Popups';
import { Chatbot } from './components/Chatbot';
import { LiveNotifications } from './components/LiveNotifications';
import './index.css';

const MainContent = () => {
  const { activePage } = useAppContext();

  return (
    <>
      <CookieBanner />
      <FlashBanner />
      <Navbar />
      {activePage === 'Shop' && <Hero />}

      {activePage === 'Shop' && <Shop />}
      {activePage === 'About' && <About />}
      {activePage === 'Auth' && <Auth />}
      {activePage === 'Profile' && <Profile />}

      <ModalsContainer />
      <ObserverPanel />
      <PopupAd />
      <Toast />
      <Footer />
      <Chatbot />
      <LiveNotifications />
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
