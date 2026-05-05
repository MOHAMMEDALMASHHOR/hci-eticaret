import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const cities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya"];
const firstNames = ["Ahmet", "Ayşe", "Mehmet", "Fatma", "Can", "Zeynep", "Burak", "Elif"];

export const LiveNotifications = () => {
  const { products, activePage } = useAppContext();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Only show social proof notifications if user is actually shopping/browsing
    if (activePage !== 'Shop' && activePage !== 'About') return;

    const triggerRandomNotification = () => {
      if (products.length === 0) return;
      
      const type = Math.random() > 0.5 ? 'purchase' : 'view';
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      if (type === 'purchase') {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const name = firstNames[Math.floor(Math.random() * firstNames.length)];
        setNotification({
          id: Date.now(),
          icon: '🛍️',
          title: 'Yeni Bir Sipariş!',
          message: `${name} (${city}), az önce ${randomProduct.name} satın aldı.`,
          time: 'Az önce',
          color: 'var(--green)'
        });
      } else {
        const viewers = Math.floor(Math.random() * 40) + 5;
        setNotification({
          id: Date.now(),
          icon: '👁️',
          title: 'Popüler Ürün!',
          message: `Şu an ${viewers} kişi ${randomProduct.name} ürününü inceliyor.`,
          time: 'Canlı',
          color: 'var(--orange)'
        });
      }

      // Hide notification after 4.5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 4500);
    };

    // Trigger every 8 to 15 seconds randomly
    const minDelay = 8000;
    const maxDelay = 15000;
    
    const runLoop = () => {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      setTimeout(() => {
        triggerRandomNotification();
        runLoop(); // Schedule next
      }, delay);
    };

    runLoop();

    return () => setNotification(null); // Cleanup
  }, [products, activePage]);

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 9998,
      background: '#fff',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px',
      maxWidth: '320px',
      borderLeft: `5px solid ${notification.color}`,
      animation: 'slideRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <div style={{ fontSize: '24px', marginTop: '2px' }}>{notification.icon}</div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px', color: notification.color }}>{notification.title}</span>
          <span style={{ fontSize: '11px', color: '#999' }}>{notification.time}</span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--dark)', lineHeight: '1.4' }}>
          {notification.message}
        </p>
      </div>
    </div>
  );
};
