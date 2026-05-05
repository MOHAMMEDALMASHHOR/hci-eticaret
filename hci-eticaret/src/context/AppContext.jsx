import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import productsData from '../data/products.json';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

const API_URL = 'http://localhost:5000';

export const AppProvider = ({ children }) => {
    // --- Auth State ---
    const [token, setToken] = useState(() => localStorage.getItem('hci_token') || null);
    const [user, setUser] = useState(null);

    // --- LocalStorage State (Fallback & Guest Mode) ---
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('hci_cart')) || []);
    const [favorites, setFavorites] = useState(() => new Set(JSON.parse(localStorage.getItem('hci_favorites')) || []));

    const [actionLogs, setActionLogs] = useState(() => JSON.parse(localStorage.getItem('hci_action_logs')) || []);
    const [currentTask, setCurrentTask] = useState(() => JSON.parse(localStorage.getItem('hci_current_task')) || { id: 0, startTime: null, errors: 0 });
    const [taskReports, setTaskReports] = useState(() => JSON.parse(localStorage.getItem('hci_task_reports')) || {});

    // Update locastorage for guest mode
    useEffect(() => { localStorage.setItem('hci_cart', JSON.stringify(cart)); }, [cart]);
    useEffect(() => { localStorage.setItem('hci_favorites', JSON.stringify([...favorites])); }, [favorites]);
    useEffect(() => { localStorage.setItem('hci_action_logs', JSON.stringify(actionLogs)); }, [actionLogs]);
    useEffect(() => { localStorage.setItem('hci_current_task', JSON.stringify(currentTask)); }, [currentTask]);
    useEffect(() => { localStorage.setItem('hci_task_reports', JSON.stringify(taskReports)); }, [taskReports]);

    // --- API Sync Effect ---
    useEffect(() => {
        if (token) {
            localStorage.setItem('hci_token', token);
            fetch(`${API_URL}/me`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setUser(data.user);
                        if (data.cart.length > 0) setCart(data.cart);
                        if (data.favorites.length > 0) setFavorites(new Set(data.favorites));
                    } else {
                        setToken(null);
                        localStorage.removeItem('hci_token');
                    }
                }).catch(err => console.error(err));
        } else {
            localStorage.removeItem('hci_token');
            setUser(null);
        }
    }, [token]);

    // Sync Cart to API when modified (if logged in)
    const syncCartToBackend = (newCart) => {
        if (token) {
            fetch(`${API_URL}/cart`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ cartItems: newCart })
            });
        }
    };

    // Sync Favorites to API when modified (if logged in)
    const syncFavToBackend = (newFavs) => {
        if (token) {
            fetch(`${API_URL}/favorites`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ favoriteIds: [...newFavs] })
            });
        }
    };

    // --- Page Routes ---
    const [activePage, setActivePage] = useState("Shop"); // Shop, About, Auth, Profile

    const [products, setProducts] = useState(productsData);
    const [filteredProducts, setFilteredProducts] = useState(productsData);
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [toastMsg, setToastMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isUpsellOpen, setIsUpsellOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [detailProductId, setDetailProductId] = useState(null);

    const toastTimeout = useRef(null);

    // --- Action Logging System ---
    const logAction = (actionDesc, isError = false) => {
        const entry = { time: new Date().toLocaleTimeString('tr-TR'), desc: actionDesc, type: isError ? 'ERROR' : 'INFO' };
        setActionLogs(prev => [entry, ...prev].slice(0, 50));

        if (isError && currentTask.startTime) {
            setCurrentTask(prev => ({ ...prev, errors: prev.errors + 1 }));
        }

        // Backend Log Sync
        if (token) {
            fetch(`${API_URL}/logs`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: actionDesc, isError, taskId: currentTask.id || null })
            }).catch(err => { });
        }
    };

    const startTask = (taskId) => {
        setCurrentTask({ id: taskId, startTime: Date.now(), errors: 0 });
        logAction(`Görev ${taskId + 1} Başlatıldı`);
    };

    const completeTask = () => {
        if (!currentTask.startTime) return;
        const durationSec = Math.floor((Date.now() - currentTask.startTime) / 1000);
        const report = {
            duration: durationSec,
            errors: currentTask.errors,
            completed: true,
            timestamp: new Date().toLocaleString('tr-TR')
        };
        setTaskReports(prev => ({ ...prev, [currentTask.id]: report }));
        logAction(`Görev ${currentTask.id + 1} Tamamlandı (${durationSec} sn, ${currentTask.errors} hata)`);
        setCurrentTask(prev => ({ ...prev, startTime: null }));
    };

    const showToast = (msg) => {
        setToastMsg(msg);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToastMsg(''), 2500);
    };

    const addToCart = (id) => {
        const p = products.find(x => x.id === id);
        if (!p) return;
        const qtyToAdd = p.minBundle || 1;

        setCart(prev => {
            const existing = prev.find(x => x.id === id);
            const newCart = existing ? prev.map(x => x.id === id ? { ...x, qty: x.qty + qtyToAdd } : x) : [...prev, { ...p, qty: qtyToAdd }];
            syncCartToBackend(newCart);
            return newCart;
        });

        if (p.minBundle) {
            logAction(`Zorunlu Paket Eklendi: ${p.name} (${p.minBundle} adet)`);
            showToast(`⚠️ "${p.name}" tekli satılamadığından sepetinize otomatik olarak ${p.minBundle} adet (Koli) eklendi!`);
        } else {
            logAction(`Sepete Eklendi: ${p.name}`);
            showToast(`"${p.name}" sepete eklendi! 🛒`);
        }
    };

    const removeFromCart = (id) => {
        logAction(`Sepetten Çıkarıldı (ID: ${id})`);
        setCart(prev => {
            const n = prev.filter(x => x.id !== id);
            syncCartToBackend(n);
            return n;
        });
    };

    const clearCart = () => {
        logAction(`Sepet Temizlendi`);
        setCart([]);
        syncCartToBackend([]);
    };

    const toggleFav = (id) => {
        const newFavs = new Set(favorites);
        const p = products.find(x => x.id === id);
        if (newFavs.has(id)) {
            newFavs.delete(id);
            logAction(`Favorilerden Çıkarıldı: ${p?.name}`);
            showToast(`"${p?.name}" favorilerden çıkarıldı`);
        } else {
            newFavs.add(id);
            logAction(`Favorilere Eklendi: ${p?.name}`);
            showToast(`❤️ "${p?.name}" favorilere eklendi!`);
        }
        setFavorites(newFavs);
        syncFavToBackend(newFavs);
    };

    const filterCategory = (cat) => {
        let actualCat = cat;
        setActivePage("Shop");
        if (cat === 'Elektronik_TRICK') {
            actualCat = 'Spor';
            logAction(`Navigasyon Yanıltması: Elektronik tıklandı, Spor açıldı`, true);
            showToast('Elektronik kategorisi yükleniyor...');
        } else if (cat === 'Spor_TRICK2') {
            actualCat = 'Giyim';
            logAction(`Navigasyon Yanıltması: Spor tıklandı, Giyim açıldı`, true);
        } else {
            logAction(`Kategori Seçildi: ${actualCat}`);
        }
        setActiveCategory(actualCat);
        if (actualCat === 'Flash') {
            setFilteredProducts(products.filter(p => p.fakeDiscount >= 30));
        } else if (actualCat === 'Tümü') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === actualCat));
        }
        setSearchQuery('');
    };

    const searchProducts = (q) => {
        setSearchQuery(q);
        logAction(`Arama Yapıldı: ${q}`);
        const qlow = q.toLowerCase();
        setFilteredProducts(products.filter(p =>
            p.name.toLowerCase().includes(qlow) || p.brand.toLowerCase().includes(qlow) ||
            p.category.toLowerCase().includes(qlow) || p.color.toLowerCase().includes(qlow) ||
            (p.altName && p.altName.toLowerCase().includes(qlow))
        ));
        setActivePage("Shop");
    };

    const sortProducts = (mode) => {
        logAction(`Sıralama Değişti: ${mode}`);
        const list = [...filteredProducts];
        if (mode === 'priceasc') list.sort((a, b) => a.price - b.price);
        else if (mode === 'pricedesc') list.sort((a, b) => b.price - a.price);
        else if (mode === 'rating') list.sort((a, b) => b.reviews - a.reviews);
        else if (mode === 'newest') list.sort((a, b) => b.id - a.id);
        setFilteredProducts(list);
    };

    const applyPriceFilter = (maxVal) => {
        logAction(`Fiyat Filtresi Uygulandı: ${maxVal} TL`);
        setFilteredProducts(products.filter(p => p.price <= maxVal));
    };

    // Auth Methods
    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Giriş Başarısız');
        setToken(data.token);
        setUser(data.user);
        logAction('Kullanıcı Girişi Yapıldı');
        return true;
    };

    const register = async (name, email, password) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Kayıt Başarısız');
        setToken(data.token);
        setUser(data.user);
        logAction('Yeni Hesap Oluşturuldu');
        return true;
    };

    const logout = () => {
        logAction('Çıkış Yapıldı');
        setToken(null);
        setUser(null);
        setCart([]);
        setFavorites(new Set());
        setActivePage('Shop');
    };

    const val = {
        user, login, register, logout,
        cart, addToCart, removeFromCart, clearCart,
        favorites, toggleFav,
        products, filteredProducts,
        activeCategory, filterCategory,
        searchQuery, searchProducts, sortProducts, applyPriceFilter,
        toastMsg, showToast,
        isCartOpen, setIsCartOpen,
        isCheckoutOpen, setIsCheckoutOpen,
        isUpsellOpen, setIsUpsellOpen,
        isHelpOpen, setIsHelpOpen,
        detailProductId, setDetailProductId,
        activePage, setActivePage,
        actionLogs, logAction, currentTask, startTask, completeTask, taskReports
    };

    return <AppContext.Provider value={val}>{children}</AppContext.Provider>;
};
