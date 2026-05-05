const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

// Base categories and their possible items
const categories = {
  'Elektronik': [
    { name: 'Ultra HD Smart TV', emoji: '📺', basePrice: 15000, brand: 'VisionTech' },
    { name: 'Noise-Cancelling Kulaklık', emoji: '🎧', basePrice: 2500, brand: 'SonicBoom' },
    { name: 'Oyun Bilgisayarı', emoji: '💻', basePrice: 35000, brand: 'GamerX' },
    { name: 'Akıllı Saat Pro', emoji: '⌚', basePrice: 4000, brand: 'TimeSync' },
    { name: 'Amiral Gemisi Akıllı Telefon', emoji: '📱', basePrice: 45000, brand: 'Pear' },
    { name: 'Tablet 10 inç', emoji: '📱', basePrice: 8000, brand: 'Pear' },
    { name: 'Bluetooth Hoparlör', emoji: '🔊', basePrice: 1500, brand: 'BassBox' },
    { name: 'Fotoğraf Makinesi', emoji: '📷', basePrice: 22000, brand: 'CapturePro' },
    { name: 'Oyun Konsolu', emoji: '🎮', basePrice: 18000, brand: 'PlayZone' },
    { name: 'Masaüstü Monitör', emoji: '🖥️', basePrice: 6000, brand: 'ScreenMax' }
  ],
  'Giyim': [
    { name: 'Kışlık Kaz tüyü Mont', emoji: '🧥', basePrice: 3000, brand: 'Nordic' },
    { name: 'Basic Tişört Seti (3\'lü)', emoji: '👕', basePrice: 500, brand: 'Everyday' },
    { name: 'Premium Kot Pantolon', emoji: '👖', basePrice: 1200, brand: 'DenimCo' },
    { name: 'Gece Elbisesi', emoji: '👗', basePrice: 2500, brand: 'Elegance' },
    { name: 'Yazlık Şort', emoji: '🩳', basePrice: 400, brand: 'SunWear' },
    { name: 'Yün Kazak', emoji: '🧶', basePrice: 800, brand: 'WarmHugs' },
    { name: 'Spor Takım Elbise', emoji: '👔', basePrice: 4500, brand: 'BossStyle' }
  ],
  'Ayakkabı': [
    { name: 'Koşu Ayakkabısı', emoji: '👟', basePrice: 2200, brand: 'Speedster' },
    { name: 'Deri Klasik Ayakkabı', emoji: '👞', basePrice: 3500, brand: 'Gentleman' },
    { name: 'Günlük Sneaker', emoji: '👟', basePrice: 1800, brand: 'StreetWalk' },
    { name: 'Kışlık Bot', emoji: '🥾', basePrice: 4000, brand: 'MountainTrek' },
    { name: 'Yüksek Topuklu', emoji: '👠', basePrice: 2000, brand: 'Glamour' },
    { name: 'Plaj Terliği', emoji: '🩴', basePrice: 300, brand: 'SummerVibes' }
  ],
  'Spor': [
    { name: 'Dambıl Seti 20kg', emoji: '🏋️', basePrice: 1500, brand: 'IronFit' },
    { name: 'Yoga Matı', emoji: '🧘‍♀️', basePrice: 300, brand: 'ZenMode' },
    { name: 'Futbol Topu (Pro)', emoji: '⚽', basePrice: 800, brand: 'KickStrike' },
    { name: 'Kondisyon Bisikleti', emoji: '🚴', basePrice: 6000, brand: 'HomeGym' },
    { name: 'Tenis Raketi', emoji: '🎾', basePrice: 2500, brand: 'CourtMaster' },
    { name: 'Kamp Çadırı', emoji: '⛺', basePrice: 3500, brand: 'OutdoorLife' },
    { name: 'Basketbol Topu', emoji: '🏀', basePrice: 900, brand: 'DunkKing' }
  ],
  'Ev': [
    { name: 'Kahve Makinesi', emoji: '☕', basePrice: 4500, brand: 'BrewMaster' },
    { name: 'Robot Süpürge', emoji: '🤖', basePrice: 12000, brand: 'CleanBot' },
    { name: 'Yatak Örtüsü Takımı', emoji: '🛏️', basePrice: 1200, brand: 'SleepWell' },
    { name: 'Masa Lambası', emoji: '💡', basePrice: 350, brand: 'BrightLight' },
    { name: 'Modern Kanepe', emoji: '🛋️', basePrice: 18000, brand: 'LoungeArt' },
    { name: 'Banyo Havlu Seti', emoji: '🛁', basePrice: 600, brand: 'SoftTouch' },
    { name: 'Dekoratif Duvar Saati', emoji: '🕰️', basePrice: 450, brand: 'TimeDecor' }
  ]
};

const adjectives = ['Pro', 'Ultra', 'Premium', 'Max', 'Plus', 'Essential', 'Elite', 'V2', 'Smart', 'Eco', 'Deluxe', 'Sınırlı Üretim'];
const colors = ['Siyah', 'Beyaz', 'Uzay Grisi', 'Gümüş', 'Kırmızı', 'Mavi', 'Yeşil', 'Altın', 'Bordo', 'Lacivert'];

const generateProducts = () => {
  const products = [];
  let idCounter = 100; // ID 100'den başlar

  for (let i = 0; i < 150; i++) {
    const categoryNames = Object.keys(categories);
    const randomCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const baseItems = categories[randomCategory];
    const item = baseItems[Math.floor(Math.random() * baseItems.length)];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // %50 ihtimalle ek sıfat kullan (Örn: Ultra HD Smart TV vs Ultra HD Smart TV Premium)
    const fullName = Math.random() > 0.5 ? `${item.name} ${adj}` : item.name;
    
    // Fiyatlarda %20 aşağı veya %30 yukarı rastgele oynama yap
    const priceVariance = (Math.random() * 0.5) - 0.2;
    const finalPrice = Math.round((item.basePrice * (1 + priceVariance)) / 10) * 10; // Round to nearest 10
    
    // Dark Pattern: Sahte şişirilmiş indirim oranları (Şok indirim!)
    const fakeDiscount = Math.floor(Math.random() * 65) + 10; // %10 ile %75 arası indirim
    const oldPrice = Math.round(finalPrice / (1 - (fakeDiscount / 100)));
    
    products.push({
      id: idCounter++,
      name: fullName,
      nameVariant2: `${fullName} - Özel Tasarım (${color})`, // Değişken Ürün İsimleri manipülasyonu için
      price: finalPrice,
      oldPrice: oldPrice,
      fakeDiscount: fakeDiscount,
      category: randomCategory,
      emoji: item.emoji,
      rating: (Math.random() * 0.8 + 4.2).toFixed(1), // 4.2 ile 5.0 arası her şey harika görünüyor
      stock: Math.floor(Math.random() * 12) + 1, // Kıtlık prensibi (FOMO) - Maks 12 stok
      viewers: Math.floor(Math.random() * 120) + 10, // Sahte Sosyal Kanıt
      brand: item.brand,
      color: color,
      bestSeller: Math.random() > 0.8,
      packageNote: Math.random() > 0.85 ? "⚠️ Ağır Yük: Kargo sepet aşamasında ayrıca hesaplanır" : ""
    });
  }
  return products;
};

// Update db.json
try {
  if (!fs.existsSync(dbPath)) {
     console.error('db.json bulunamadı. Lütfen hci-backend klasöründe olduğundan emin olun.');
     process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Ürünleri yeni üretilen liste ile değiştiriyoruz
  data.products = generateProducts();
  
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log(`✅ Başarıyla ${data.products.length} adet yeni ürün yaratıldı ve db.json dosyasına kaydedildi!`);
} catch(err) {
  console.error('db.json güncellenirken hata oluştu:', err);
}
