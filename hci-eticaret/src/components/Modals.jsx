import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const ModalsContainer = () => {
    return (
        <>
            <CartMenu />
            <CheckoutModal />
            <ProductDetailModal />
        </>
    );
};

const CartMenu = () => {
    const { cart, removeFromCart, isCartOpen, setIsCartOpen, setIsCheckoutOpen, showToast, logAction } = useAppContext();
    const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);

    const handleCheckout = () => {
        logAction('Sepette Ödemeye Geç Butonuna Tıklandı');
        if (cart.length === 0) { showToast('Sepetiniz boş!'); return; }
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
    };

    return (
        <>
            {isCartOpen && <div id="cartOverlay" onClick={() => setIsCartOpen(false)}></div>}
            <div id="cartPanel" className={isCartOpen ? 'open' : ''}>
                <div className="cart-header">
                    <h3>🛒 Sepetim</h3>
                    <button className="cart-close" onClick={() => { setIsCartOpen(false); logAction('Sepet Kapatıldı'); }}>✕</button>
                </div>
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛒</div><p>Sepetiniz şu an boş.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-emoji">{item.emoji}</div>
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.name}</div>
                                    <div className="cart-item-price">₺{(item.price * item.qty).toLocaleString('tr-TR')} {item.qty > 1 ? `(${item.qty}x)` : ''}</div>
                                    {item.packageNote && <div className="cart-item-note">📦 {item.packageNote}</div>}
                                </div>
                                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>🗑️</button>
                            </div>
                        ))
                    )}
                </div>
                <div className="cart-footer">
                    <div className="cart-subtotal-row"><span>Ara Toplam</span><span>₺{(subtotal).toLocaleString('tr-TR')}</span></div>
                    <div className="cart-subtotal-row"><span>Kargo</span><span style={{ color: 'var(--green)' }}>Ücretsiz</span></div>
                    <div className="cart-subtotal-row total"><span>Toplam Tutar</span><span>₺{(subtotal).toLocaleString('tr-TR')}</span></div>
                    <button className="cart-checkout-btn" onClick={handleCheckout}>Güvenli Ödeme →</button>
                </div>
            </div>
        </>
    );
};

const CheckoutModal = () => {
    const { cart, clearCart, isCheckoutOpen, setIsCheckoutOpen, logAction, user } = useAppContext();
    const [step, setStep] = useState(1);
    const [extras, setExtras] = useState({ warranty: true, fast: true, pack: true });

    // Credit Card explicit forms to increase user sunk cost fallacy
    const [ccName, setCcName] = useState(user ? user.name : '');
    const [ccNum, setCcNum] = useState('');
    const [ccExpiry, setCcExpiry] = useState('');
    const [ccCvv, setCcCvv] = useState('');

    useEffect(() => {
        if (isCheckoutOpen) {
            setStep(1);
            logAction('Ödeme İşlemi Başlatıldı (Adım 1: Adres)');
        }
    }, [isCheckoutOpen, logAction]);

    if (!isCheckoutOpen) return null;

    const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const extTotal = (extras.warranty ? 149 : 0) + (extras.fast ? 39 : 0) + (extras.pack ? 25 : 0);
    const serviceFee = 19.99;
    const insuranceFee = 12.50;
    const finalTotal = subtotal + extTotal + serviceFee + insuranceFee;

    const handleExtra = (key) => {
        logAction(`Ekstra Servis Değiştirildi: ${key}`);
        setExtras(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCreditCardSubmit = (e) => {
        e.preventDefault();
        const rawCC = ccNum.replace(/\s/g, '');
        if (rawCC.length < 16 || ccCvv.length < 3) {
            logAction('Kredi Kartı Ödemesi Form Hatası', true);
            alert("Lütfen geçerli bir kart bilgisi giriniz.");
            return;
        }
        completeOrder();
    };

    const completeOrder = () => {
        logAction(`Sipariş Tamamlandı - Toplam Ödenen: ${finalTotal.toFixed(2)} TL`);
        clearCart();
        setStep(4);
    };

    const stepsStr = [0, 1, 2].map(i => (
        <div key={i} className={`step-dot ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}`}></div>
    ));

    return (
        <div className="modal-bg" onClick={(e) => {
            if (e.target === e.currentTarget && step !== 4) { setIsCheckoutOpen(false); logAction('Ödeme Penceresi Dışarı Tıklanarak Kapatıldı', true); }
        }}>
            <div className="modal-box" style={{ maxWidth: '600px' }}>
                {step === 1 && (
                    <form className="checkout-step" onSubmit={(e) => { e.preventDefault(); setStep(2); logAction('Adım 2: Ek Hizmetlere Geçildi'); }}>
                        <div className="step-indicator">{stepsStr}</div>
                        <h3 style={{ fontFamily: 'Nunito', fontSize: '24px', marginBottom: '20px' }}>📦 Teslimat Bilgileriniz</h3>

                        <div className="form-group"><label>Ad Soyad</label><input type="text" defaultValue={user?.name || ''} placeholder="Gönderilecek Kişi Adı" /></div>
                        <div className="form-group"><label>Telefon Numarası</label><input type="tel" placeholder="05XX XXX XX XX" /></div>
                        <div className="form-group"><label>Açık Adresiniz</label><input type="text" placeholder="İl, İlçe, Mahalle, Sokak, Kapı No" /></div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="checkout-next-btn" style={{ flex: 2 }}>Devam Et →</button>
                            <button type="button" className="checkout-back-btn" style={{ flex: 1 }} onClick={() => setIsCheckoutOpen(false)}>İptal</button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <div className="checkout-step">
                        <div className="step-indicator">{stepsStr}</div>
                        <h3 style={{ fontFamily: 'Nunito', fontSize: '24px', marginBottom: '15px' }}>🎁 Size Özel Fırsatlar</h3>
                        <p style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '20px' }}>Alışverişinizi güvence altına alıp, yarına kapınıza getirmemiz için özel hizmetler sizin adınıza tanımlandı!</p>

                        <div className="extras-box">
                            <div className="extra-item" style={{ background: extras.warranty ? '#fff8e1' : '#fff' }}>
                                <label style={{ fontWeight: 'bold' }}><input type="checkbox" checked={extras.warranty} onChange={() => handleExtra('warranty')} /> 🛡️ 3 Yıl Genişletilmiş Ekstra Garanti Maksimizasyonu</label>
                                <span className="extra-price">+₺149</span>
                            </div>
                            <div className="extra-item" style={{ background: extras.fast ? '#fff8e1' : '#fff' }}>
                                <label style={{ fontWeight: 'bold' }}><input type="checkbox" checked={extras.fast} onChange={() => handleExtra('fast')} /> ⚡ SuperExpress Jet Teslimat (Yarın Elinizde)</label>
                                <span className="extra-price">+₺39</span>
                            </div>
                            <div className="extra-item" style={{ background: extras.pack ? '#fff8e1' : '#fff' }}>
                                <label style={{ fontWeight: 'bold' }}><input type="checkbox" checked={extras.pack} onChange={() => handleExtra('pack')} /> 📦 Lüks Jüt Kumaş Hediye Paketi</label>
                                <span className="extra-price">+₺25</span>
                            </div>
                        </div>

                        <div className="checkout-total-box">
                            <div className="checkout-total-row"><span>Sepetteki Ürünler</span><span>₺{subtotal.toLocaleString('tr-TR')}</span></div>
                            <div className="checkout-total-row added" style={{ color: 'var(--orange)' }}><span>Özel Hizmet Paketleri</span><span>+ ₺{extTotal}</span></div>
                            <div className="checkout-total-row grand"><span>Sepet Tutarı</span><span>₺{(subtotal + extTotal).toLocaleString('tr-TR')}</span></div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button className="checkout-next-btn" style={{ flex: 3, background: 'var(--dark)' }} onClick={() => { setStep(3); logAction('Adım 3: Kart Ödemesine Geçildi'); }}>Kart Bilgilerini Gir →</button>
                            <button className="checkout-back-btn" style={{ flex: 1 }} onClick={() => setStep(1)}>Geri Dön</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <form className="checkout-step" onSubmit={handleCreditCardSubmit}>
                        <div className="step-indicator">{stepsStr}</div>
                        <h3 style={{ fontFamily: 'Nunito', fontSize: '24px', marginBottom: '20px' }}>💳 Güvenli Ödeme</h3>

                        {/* The sunk cost inputs -> get user to type CC details first before they notice the fee */}
                        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Kart Üzerindeki İsim</label>
                                <input type="text" value={ccName} onChange={e => setCcName(e.target.value)} placeholder="ÖRNEK KİŞİ" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', textTransform: 'uppercase' }} />
                            </div>

                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Kart Numarası</label>
                                <input type="text" value={ccNum} onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    const formatted = val.match(/.{1,4}/g)?.join(' ') || '';
                                    setCcNum(formatted);
                                }} placeholder="XXXX XXXX XXXX XXXX" maxLength={19} pattern="[\d\s]{16,19}" title="16 Haneli Kart Numarası Girin" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Son Kullanma</label>
                                    <input type="text" value={ccExpiry} onChange={e => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                        setCcExpiry(val);
                                    }} placeholder="AA/YY" maxLength={5} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>CVV</label>
                                    <input type="password" value={ccCvv} onChange={e => setCcCvv(e.target.value)} placeholder="123" maxLength={3} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
                                </div>
                            </div>
                        </div>

                        {/* DARK PATTERN: Sneak fee warning placed RIGHT ABOVE the submit button exactly where they don't want to cancel */}
                        <div className="hidden-fee-box" style={{ background: '#ffebee', color: 'var(--red)', padding: '15px', borderRadius: '8px', borderLeft: '5px solid var(--red)', marginBottom: '20px', fontSize: '13px', lineHeight: '1.5' }}>
                            <strong>⚠️ SON DAKİKA ÖDEME UYARISI</strong><br />
                            TrendSepet altyapısının güvenliği ve taşımacılık prosedürleri sebebiyle faturanıza şu an
                            <strong> ₺{serviceFee.toFixed(2)} Sistem Operasyon Bedeli</strong> ve
                            <strong> ₺{insuranceFee.toFixed(2)} Zorunlu Kargo Sigortası Primi</strong> yansıtılmıştır. Siparişi tamamlayarak bu kesintiyi onaylamış sayılırsınız.
                        </div>

                        <div className="checkout-total-box" style={{ marginBottom: '20px' }}>
                            <div className="checkout-total-row"><span>Sepet + Ekstra Paketler</span><span>₺{(subtotal + extTotal).toLocaleString('tr-TR')}</span></div>
                            <div className="checkout-total-row added" style={{ color: 'var(--red)' }}><span>Zorunlu Kesintiler</span><span>+ ₺{(serviceFee + insuranceFee).toFixed(2)}</span></div>
                            <div className="checkout-total-row grand"><span>Kredi Kartından Çekilecek</span><span>₺{finalTotal.toFixed(2)}</span></div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="checkout-next-btn" style={{ flex: 3, background: 'var(--green)', boxShadow: '0 4px 15px rgba(40,167,69,0.4)', color: '#fff', padding: '16px', fontSize: '18px' }}>🔒 SİPARİŞİ ONAYLA</button>
                            <button type="button" className="checkout-back-btn" style={{ flex: 1 }} onClick={() => setStep(2)}>Vazgeç ve Geri</button>
                        </div>
                    </form>
                )}

                {step === 4 && (
                    <div className="success-box" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'bounce 1s ease' }}>✅</div>
                        <h2 style={{ fontFamily: 'Nunito', color: 'var(--green)', fontSize: '28px', marginBottom: '15px' }}>Ödemeniz Alındı!</h2>
                        <h3 style={{ fontSize: '18px', color: 'var(--dark)' }}>Sipariş Numaranız: <span style={{ fontWeight: '900', color: 'var(--orange)' }}>TR-{(Math.random() * 1000000).toFixed(0)}</span></h3>
                        <p style={{ marginTop: '20px', fontSize: '16px', color: 'var(--mid)', lineHeight: '1.6', background: '#eafaf1', padding: '15px', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                            Harika haber! Ürününüz hazırlanıp <strong>Kargo şirketine faturalandırıldı.</strong>
                            En kısa sürede tarafınıza teslim edilmek üzere yola çıkacaktır. Bizimle alışveriş yaptığınız için çok teşekkür ederiz!
                        </p>
                        <button className="checkout-next-btn" style={{ maxWidth: '250px', margin: '30px auto 0', padding: '15px' }} onClick={() => { setIsCheckoutOpen(false); window.scrollTo(0, 0); }}>👏 Alışverişe Geri Dön</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductDetailModal = () => {
    const { products, favorites, toggleFav, addToCart, detailProductId, setDetailProductId, logAction } = useAppContext();
    const [sec, setSec] = useState(120);

    useEffect(() => {
        let id;
        if (detailProductId) id = setInterval(() => setSec(s => (s < 0 ? 599 : s - 1)), 1000);
        return () => clearInterval(id);
    }, [detailProductId]);

    if (!detailProductId) return null;
    const p = products.find(x => x.id === detailProductId);
    if (!p) return null;

    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');

    return (
        <div className="modal-bg" onClick={(e) => {
            if (e.target === e.currentTarget) { setDetailProductId(null); logAction('Ürün Detayı Dışarı Tıklanarak Kapatıldı'); }
        }}>
            <div className="modal-box detail-box-wide">
                <div className="detail-header">
                    <span style={{ fontFamily: 'Nunito', fontWeight: 800 }}>Ürün İncelemesi</span>
                    <button onClick={() => { setDetailProductId(null); logAction('Ürün Detayı Kapatıldı'); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>
                <div className="detail-body">
                    <div>
                        <div className="detail-img">{p.emoji}</div>
                        <div className="detail-countdown">🔥 Fırsat Fiyatı <span className="dc-timer">{m}:{s}</span> sonra iptal olacak!</div>
                        {p.stock <= 5 && <div className="card-stock-warn" style={{ marginTop: 8 }}>⚠️ DİKKAT: Son {p.stock} adet stok kaldı! Kaçırmak üzeresin!</div>}
                        <div className="viewer-badge" style={{ marginTop: 8 }}>👁️ Şu an {p.viewers + 12} kişi inceledi</div>
                    </div>
                    <div className="detail-info">
                        <div className="detail-brand" style={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>{p.brand} • {p.category}</div>
                        <h2 style={{ fontFamily: 'Nunito', fontSize: '26px' }}>{p.name}</h2>
                        <div className="detail-rating">⭐⭐⭐⭐⭐<span style={{ color: '#888', marginLeft: 4 }}>{p.rating} Özel Puan Belgesi</span></div>
                        <div className="detail-discount" style={{ background: 'var(--red)', color: '#fff', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', fontSize: '13px', fontWeight: 'bold' }}>ŞOK %{p.fakeDiscount} İNDİRİM</div>

                        <div style={{ marginTop: '15px', padding: '15px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '10px' }}>
                            <div className="detail-old" style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '16px' }}>₺{p.oldPrice.toLocaleString('tr-TR')}</div>
                            <div className="detail-price" style={{ color: 'var(--orange)', fontSize: '32px', fontWeight: '900' }}>₺{p.price.toLocaleString('tr-TR')}</div>
                            {p.packageNote && <div className="detail-price-note" style={{ color: 'var(--dark)', fontWeight: '600' }}>📦 Uyarı: {p.packageNote}</div>}
                        </div>

                        <p className="detail-desc" style={{ lineHeight: '1.6', marginTop: '15px' }}>
                            Bu efsanevi <strong>{p.name}</strong> modeli, muhteşem yapısıyla her saniye değer kazanıyor. Hemen tükenmeden bu kusursuz deneyimi sipariş et.
                        </p>
                        <div className="detail-specs">
                            <span>🎨 Renk Opsiyonu: {p.color}</span>
                            <span>⚡ Teslimat: 24 Saatte Kargoda</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button className="detail-add-btn" style={{ flex: 2, padding: '16px', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { addToCart(p.id); setDetailProductId(null); }}>🛒 Sepete Ekle, Kaçırma!</button>
                            <button className="detail-fav-btn" style={{ flex: 1, padding: '16px', background: 'transparent', border: '2px solid var(--orange)', color: 'var(--orange)', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => toggleFav(p.id)}>
                                {favorites.has(p.id) ? '❤️ Çıkar' : '🤍 Koru'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
