import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const Shop = () => {
    const { activeCategory, sortProducts, searchQuery, filteredProducts } = useAppContext();

    return (
        <>
            <UrgencyBar />
            <div className="main-layout">
                <Sidebar />
                <div className="products-section">
                    <div className="section-title">
                        <h2>{searchQuery ? `"${searchQuery}"` : activeCategory} <span>{searchQuery ? 'Arama Sonuçları' : 'Ürünleri'}</span></h2>
                        <div className="sort-bar">
                            <select onChange={(e) => sortProducts(e.target.value)}>
                                <option value="default">Önerilen Sıralama</option>
                                <option value="priceasc">Fiyat: Düşükten Yükseğe</option>
                                <option value="pricedesc">Fiyat: Yüksekten Düşüğe</option>
                                <option value="rating">En Çok Değerlendirilen</option>
                                <option value="newest">En Yeniler</option>
                            </select>
                        </div>
                    </div>
                    <div className="products-grid">
                        {filteredProducts.length === 0 ? (
                            <p style={{ color: '#aaa', padding: '20px' }}>Ürün bulunamadı.</p>
                        ) : (
                            filteredProducts.map(p => <ProductCard key={p.id} product={p} />)
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const UrgencyBar = () => {
    const [viewerCount, setViewerCount] = useState(47);
    const cutoff = new Date(Date.now() + 90 * 60000);

    useEffect(() => {
        const id = setInterval(() => {
            setViewerCount(v => Math.max(20, Math.min(99, v + Math.floor(Math.random() * 5) - 2)));
        }, 4000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="urgency-bar">
            <div className="pulse"></div>
            <span>Şu an <span className="viewer-count">{viewerCount}</span> kişi bu sayfayı inceliyor</span>
            <span style={{ color: '#856404' }}>•</span>
            <span>Son 1 saatte <strong>312</strong> ürün satıldı</span>
            <span style={{ color: '#856404' }}>•</span>
            <span>⏰ Kargo kesim saati: <strong>{String(cutoff.getHours()).padStart(2, '0')}:{String(cutoff.getMinutes()).padStart(2, '0')}</strong></span>
        </div>
    );
};

const Sidebar = () => {
    const { filterCategory, applyPriceFilter, logAction } = useAppContext();
    const [priceVal, setPriceVal] = useState(5000);

    const handlePrice = (e) => {
        setPriceVal(e.target.value);
        applyPriceFilter(e.target.value);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-box">
                <h3>🗂️ Kategoriler</h3>
                <ul>
                    <li><a onClick={() => filterCategory('Tümü')}>Tüm Ürünler</a></li>
                    {/* DARK PATTERN: Shows apparel when sports is clicked from sidebar */}
                    <li><a onClick={() => filterCategory('Spor_TRICK2')}>⚽ Spor Ekipmanları</a></li>
                    <li><a onClick={() => filterCategory('Ayakkabı')}>👟 Ayakkabı</a></li>
                    <li><a onClick={() => filterCategory('Giyim')}>👗 Giyim</a></li>
                    <li><a onClick={() => filterCategory('Elektronik')}>📱 Elektronik</a></li>
                    <li><a onClick={() => filterCategory('Ev')}>🏠 Ev & Yaşam</a></li>
                </ul>
            </div>
            <div className="sidebar-box">
                <h3>💰 Fiyat Aralığı</h3>
                <input type="range" className="price-range" min="0" max="5000" value={priceVal} onChange={handlePrice} />
                <div className="price-labels"><span>₺0</span><span>₺{priceVal}</span></div>
            </div>
            <div className="sidebar-box">
                <h3>⭐ Değerlendirme</h3>
                <div className="filter-row">
                    <label><input type="checkbox" defaultChecked onChange={() => logAction('5 Yıldız Filtresi İşaretlendi/Kaldırıldı')} /> ⭐⭐⭐⭐⭐ (5)</label>
                    <label><input type="checkbox" defaultChecked onChange={() => logAction('4 Yıldız Filtresi İşaretlendi/Kaldırıldı')} /> ⭐⭐⭐⭐ ve üzeri</label>
                    <label><input type="checkbox" onChange={() => logAction('3 Yıldız Filtresi İşaretlendi/Kaldırıldı')} /> ⭐⭐⭐ ve üzeri</label>
                </div>
            </div>
        </aside>
    );
};

const ProductCard = ({ product: p }) => {
    const { favorites, toggleFav, addToCart, setDetailProductId, logAction } = useAppContext();
    const isFav = favorites.has(p.id);

    // DARK PATTERN: Variable Product Name
    const displayName = React.useMemo(() => Math.random() > 0.5 && p.altName ? p.altName : p.name, [p]);

    const handleDetail = () => {
        logAction(`Ürün Detayına Gidildi: ${p.name}`);
        setDetailProductId(p.id);
    };

    return (
        <div className="product-card">
            <div className="card-discount">-%{p.fakeDiscount}</div>
            <button className={`card-fav ${isFav ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}>
                {isFav ? '❤️' : '🤍'}
            </button>
            {p.image ? (
                <img src={p.image} className="card-img" onClick={handleDetail} alt={p.name} />
            ) : (
                <div className="card-img" onClick={handleDetail}>{p.emoji}</div>
            )}
            <div className="card-body" onClick={handleDetail}>
                <div className="card-brand">{p.brand}</div>
                <div className="card-name">{displayName}</div>

                {/* FAKE REVIEW PATTERN */}
                <div className="card-rating">⭐⭐⭐⭐⭐<span>({p.reviews} Değerlendirme) - Mükemmel Ürün</span></div>

                {/* BEST SELLER TAG */}
                {p.bestSeller && (
                    <div style={{ background: '#ffefc1', border: '1px solid #ffc107', padding: '2px 6px', borderRadius: '4px', fontSize: 10, fontWeight: 'bold', color: '#b28900', display: 'inline-block', marginBottom: 4 }}>
                        🥇 EN ÇOK SATAN
                    </div>
                )}

                <div className="card-price-block" style={{ marginTop: 4 }}>
                    <div className="card-old-price">₺{p.oldPrice.toLocaleString('tr-TR')}</div>
                    {p.packageNote ? (
                        <>
                            <div className="card-price" style={{ color: 'red' }}>₺{p.price.toLocaleString('tr-TR')}</div>
                            <div className="card-price-note">📦 {p.packageNote}</div>
                        </>
                    ) : (
                        <div className="card-price">₺{p.price.toLocaleString('tr-TR')}</div>
                    )}
                </div>
                {p.stock <= 5 && <div className="card-stock-warn">⚠️ Son {p.stock} ürün! Başkası Sepete Eklenmiş Olabilir!</div>}
                <div className="viewer-badge">👁️ {p.viewers} kişi inceliyor ve almayı düşünüyor</div>
            </div>
            <div className="card-actions">
                <button className="btn-cart" onClick={() => addToCart(p.id)}>🛒 Sepete Ekle</button>
                <button className="btn-detail" onClick={handleDetail}>🔍</button>
            </div>
        </div>
    );
};
