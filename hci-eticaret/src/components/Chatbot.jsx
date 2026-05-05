import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppContext } from '../context/AppContext';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Merhaba! Ben TrendSepet Yapay Zeka Asistanınız. Size ürün tavsiyesi verebilir, trendleri söyleyebilir veya yardım merkezimiz hakkında bilgi verebilirim. Nasıl yardımcı olabilirim?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { logAction } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setInput('');
    setIsLoading(true);
    logAction('AI Chatbot Kullanıldı: ' + userText);

    // Try to use real Gemini API if available
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Sen TrendSepet adlı bir e-ticaret sitesinin arkadaş canlısı, zeki ve yardımsever Türkçe yapay zeka asistanısın. 
        Kullanıcı sana şunu soruyor: "${userText}".
        Kısa, net, bilgilendirici ve ikna edici bir dille cevap ver. Kullanıcıyı alışverişe teşvik et. Asla uzun paragraflar yazma.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        setMessages(prev => [...prev, { text, sender: 'bot' }]);
      } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { text: 'Üzgünüm, şu an bağlantımda bir sorun var. Lütfen daha sonra tekrar deneyin.', sender: 'bot' }]);
      }
    } else {
      // Fake Fallback AI Simulation
      setTimeout(() => {
        let reply = "Harika bir soru! Size en çok satan ürünlerimizi önerebilirim. Şu an 'Elektronik' kategorisinde %50'ye varan efsane indirimlerimiz var!";
        if(userText.toLowerCase().includes('kargo')) reply = "Kargolarımız sipariş onayından hemen sonra 24 saat içerisinde yola çıkmaktadır. 📦";
        else if(userText.toLowerCase().includes('iade')) reply = "İade işlemlerimiz çok kolay! Ürünü teslim aldıktan sonra 14 gün içerisinde koşulsuz iade edebilirsiniz. 🔄";
        else if(userText.toLowerCase().includes('telefon') || userText.toLowerCase().includes('iphone')) reply = "Telefon kategorisinde şu an inanılmaz fırsatlar var! Özellikle en yeni modellerde stoklarımız hızla tükeniyor, hemen incelemelisiniz! 📱⚡";
        else if(userText.toLowerCase().includes('merhaba') || userText.toLowerCase().includes('selam')) reply = "Merhaba! Alışveriş rehberiniz olarak buradayım. Hangi kategoride ürün bakıyordunuz? 😊";
        
        setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
      }, 1000);
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {isOpen && (
        <div style={{ width: '350px', height: '450px', background: '#fff', borderRadius: '16px', boxShadow: '0 15px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '15px', border: '1px solid #eee', animation: 'slideUp 0.3s ease' }}>
          
          <div style={{ background: 'var(--dark)', color: '#fff', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '24px' }}>🤖</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>TrendSepet AI</div>
                <div style={{ fontSize: '11px', color: '#4CAF50', fontWeight: 'bold' }}>● Çevrimiçi Asistan</div>
              </div>
            </div>
            <button onClick={() => {setIsOpen(false); logAction('AI Chatbot Kapatıldı');}} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>

          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <div style={{ background: '#fff3cd', color: '#856404', fontSize: '11px', padding: '6px 12px', textAlign: 'center', borderBottom: '1px solid #ffeeba' }}>
              ⚠️ Gerçek AI bağlantısı için <b>.env</b> dosyasına <b>VITE_GEMINI_API_KEY</b> ekleyin. (Şu an Simülasyon Modu)
            </div>
          )}

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  background: m.sender === 'user' ? 'var(--orange)' : '#fff',
                  color: m.sender === 'user' ? '#fff' : 'var(--dark)',
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  border: m.sender === 'bot' ? '1px solid #eee' : 'none'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '12px 16px', borderRadius: '16px 16px 16px 0', border: '1px solid #eee', fontSize: '14px', color: '#888' }}>
                Yazıyor...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', padding: '12px', background: '#fff', borderTop: '1px solid #eee' }}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Asistana bir şey sorun..." 
              style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '24px', outline: 'none', fontSize: '14px' }} 
            />
            <button type="submit" style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', marginLeft: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>

        </div>
      )}

      <button 
        onClick={() => {setIsOpen(!isOpen); if(!isOpen) logAction('AI Chatbot Açıldı');}} 
        style={{ 
          background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: '50%', width: '65px', height: '65px', 
          cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s'
        }}>
        {isOpen ? <span style={{fontSize:'24px'}}>✕</span> : <span style={{fontSize:'32px'}}>🤖</span>}
      </button>

    </div>
  );
};
