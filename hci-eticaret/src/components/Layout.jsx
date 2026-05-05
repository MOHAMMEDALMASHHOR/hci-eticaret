import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

export const CookieBanner = () => {
    const [open, setOpen] = useState(true);
    const { showToast, logAction } = useAppContext();

    if (!open) return null;

    const accept = () => { setOpen(false); showToast('Tüm çerezler kabul edildi.'); logAction('Çerezler Kabul Edildi', true); };
    const reject = () => { setOpen(false); showToast('Yalnızca zorunlu çerezler aktif.'); logAction('Çerezler Reddedildi'); };
    const settings = () => { showToast('Çerez Yönetim Sayfası yükleniyor... (Görev 4)'); logAction('Çerez Ayarlarına Tıklandı'); };

    return (
        <div id="cookieBanner">
            <p>
                TrendSepet olarak sizi daha iyi tanımak, kişiselleştirilmiş içerik sunmak ve
                reklam ortaklarımızla veri paylaşmak için çerezler kullanıyoruz.
                <a onClick={settings} style={{ marginLeft: '4px' }}>Gizlilik Politikası</a>'nı okuyun.
            </p>
            <div className="cb-btns">
                <button className="cb-accept" onClick={accept}>🍪 Tümünü Kabul Et</button>
                <button className="cb-settings" onClick={settings}>Ayarları Yönet</button>
            </div>
            <button className="cb-reject" onClick={reject}>reddet</button>
        </div>
    );
};

export const FlashBanner = () => {
    const [sec, setSec] = useState(14 * 60 + 33);

    useEffect(() => {
        const id = setInterval(() => { setSec(s => (s < 0 ? 15 * 60 : s - 1)); }, 1000);
        return () => clearInterval(id);
    }, []);

    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');

    return (
        <div id="flashBanner">
            ⚡ FLASH SALE — Tüm Spor Ürünlerinde %40'a Varan İndirim!
            <span className="timer">00:{m}:{s}</span>
            — Kaçırma!
        </div>
    );
};

export const Navbar = () => {
    const { user, cart, favorites, filterCategory, searchProducts, searchQuery, setIsCartOpen, setActivePage, logAction, showToast, setIsHelpOpen } = useAppContext();

    // Local state to bind input to search button explicitly
    const [searchInput, setSearchInput] = useState(searchQuery || '');

    const handleCatChange = (e) => {
        if (e.target.value !== 'Tüm Kategoriler') filterCategory(e.target.value);
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchProducts(searchInput);
        }
    };

    const executeSearch = () => {
        searchProducts(searchInput);
    };

    const handleDeadLink = (name) => {
        logAction(`Ölü Link Tıklandı: ${name}`, true);
        showToast(`⛔ Menü 404: "${name}" sayfası şu an bakımdadır. Yönlendirilemiyor.`);
    };

    return (
        <header>
            <div className="header-top">
                <a onClick={() => handleDeadLink('Satıcı Ol')} style={{ cursor: 'pointer' }}>Satıcı Ol</a>
                <a onClick={() => handleDeadLink('Kurumsal')} style={{ cursor: 'pointer' }}>Kurumsal</a>
                <a onClick={() => { setIsHelpOpen(true); logAction('Yardım Navigasyonuna Tıklandı'); }} style={{ cursor: 'pointer' }}>Yardım</a>
                <a onClick={() => { setActivePage('About'); logAction('Hakkında Sayfasına Gidildi'); }} style={{ color: 'var(--orange)', fontWeight: 'bold', cursor: 'pointer' }}>Hakkımızda</a>

                {/* User / Guest Toggles */}
                {user ? (
                    <a onClick={() => { setActivePage('Profile'); logAction('Profile Tıklandı'); }} style={{ marginLeft: 10, cursor: 'pointer', fontWeight: 'bold' }}>{user.name} (Profil)</a>
                ) : (
                    <a onClick={() => { setActivePage('Auth'); logAction('Giriş Yap Navigasyonuna Tıklandı'); }} style={{ marginLeft: 10, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>Giriş Yap / Kayıt Ol</a>
                )}
            </div>
            <div className="header-main">
                <a className="logo" onClick={() => { filterCategory('Tümü'); setActivePage('Shop'); }}>Trend<span>Sepet</span></a>
                <div className="search-bar">
                    <select onChange={handleCatChange}>
                        <option>Tüm Kategoriler</option>
                        <option>Ayakkabı</option>
                        <option>Elektronik</option>
                        <option>Giyim</option>
                        <option>Spor</option>
                        <option>Ev & Yaşam</option>
                    </select>
                    <input type="text" placeholder="Ürün, marka veya kategori ara..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleSearchKeyPress} />
                    <button onClick={executeSearch} style={{ cursor: 'pointer' }}>🔍</button>
                </div>
                <div className="header-actions">
                    <button className="icon-btn" onClick={() => {
                        if (!user) { showToast("Favorileri görmek için giriş yapmalısınız."); setActivePage('Auth'); logAction('Favorilere Giriş Yapmadan Tıklandı', true); return; }
                        setActivePage('Profile');
                        window.scrollTo(0, 0); logAction('Favoriler Menüsü Açıldı');
                    }}>
                        <span className="ico">❤️</span><span>Favoriler</span>
                        {favorites.size > 0 && <span className="badge">{favorites.size}</span>}
                    </button>
                    <button className="icon-btn" onClick={() => { setIsCartOpen(true); logAction('Sepet Menüsü Açıldı'); }}>
                        <span className="ico">🛒</span><span>Sepet</span>
                        {cart.length > 0 && <span className="badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>}
                    </button>
                </div>
            </div>
            <nav>
                <ul>
                    <li><a onClick={() => { setActivePage('Shop'); filterCategory('Tümü'); }}>🏠 Anasayfa</a></li>
                    {/* DARK PATTERN */}
                    <li><a onClick={() => filterCategory('Elektronik_TRICK')}>📱 Elektronik</a></li>
                    <li><a onClick={() => filterCategory('Giyim')}>👗 Giyim</a></li>
                    <li><a onClick={() => filterCategory('Ayakkabı')}>👟 Ayakkabı</a></li>
                    <li><a onClick={() => filterCategory('Spor')}>⚽ Spor</a></li>
                    <li><a onClick={() => filterCategory('Ev')}>🏠 Ev & Yaşam</a></li>
                    <li><a style={{ background: 'rgba(255,255,0,0.2)' }} onClick={() => filterCategory('Flash')}>🔥 Fırsatlar</a></li>
                </ul>
            </nav>
        </header>
    );
};

export const Hero = () => {
    const { filterCategory, setActivePage } = useAppContext();
    return (
        <div className="hero">
            <div className="hero-text">
                <h1>Türkiye'nin En Büyük<br /><span>Alışveriş Merkezi</span></h1>
                <p>Milyonlarca ürün, hızlı teslimat, güvenli ödeme</p>
                <button className="hero-cta" onClick={() => { setActivePage('Shop'); filterCategory('Tümü'); }}>Alışverişe Başla →</button>
            </div>
        </div>
    );
};

export const Footer = () => {
    const { showToast, logAction, setIsHelpOpen } = useAppContext();

    const handleFooterLink = (sec) => {
        logAction(`Footer Ölü Linke Tıklandı (${sec})`, true);
        showToast(`404: Aradığınız sayfa silinmiş veya taşınmış. (${sec})`);
    };

    return (
        <footer>
            <div className="footer-grid">
                <div className="footer-col">
                    <h4>TrendSepet</h4>
                    <ul>
                        <li onClick={() => handleFooterLink('Hakkımızda')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Hakkımızda</li>
                        <li onClick={() => handleFooterLink('Kariyer')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Kariyer</li>
                        <li onClick={() => handleFooterLink('Basın')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Basın</li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Müşteri Hizmetleri</h4>
                    <ul>
                        <li onClick={() => { setIsHelpOpen(true); logAction('Footer Yardım Merkezine Tıklandı'); }} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Yardım Merkezi</li>
                        <li onClick={() => handleFooterLink('İade')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>İade & Değişim</li>
                        <li onClick={() => handleFooterLink('Kargo')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Kargo Takibi</li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Kurumsal</h4>
                    <ul>
                        <li onClick={() => handleFooterLink('Satıcı Ol')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Satıcı Ol</li>
                        <li onClick={() => handleFooterLink('Reklam')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Reklam Ver</li>
                        <li onClick={() => handleFooterLink('API')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>API Entegrasyonu</li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Ödeme Yöntemleri</h4>
                    <ul style={{ cursor: 'default' }}>
                        <li>💳 Kredi Kartı</li><li>🏦 Banka Havalesi</li><li>📱 Mobil Ödeme</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">© 2026 TrendSepet A.Ş. | HCI Proje Test Simülasyonu (Full-Stack Mode)</div>
        </footer>
    );
};

export const Toast = () => {
    const { toastMsg } = useAppContext();
    return (
        <div id="toast" className={toastMsg ? 'show' : ''}>{toastMsg}</div>
    );
};
