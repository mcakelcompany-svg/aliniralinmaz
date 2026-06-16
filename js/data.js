/* =========================================================================
   aliniralinmaz.com  —  Veri Katmanı (data.js)
   - Türkiye il listesi (81) + büyük şehirler için örnek ilçe listesi
   - Tahmini bölgesel m² fiyat referansı (TL/m²) — AÇIKÇA TAHMİNİDİR
   - İmar / kullanım amacı / sinyal sabitleri ve puan ağırlıkları
   Not: Statik site canlı veri çekemez. Buradaki fiyatlar yön göstericidir;
   tablo dışı bölgelerde kullanıcı "bölge ortalaması" alanını kendisi doldurur.
   ========================================================================= */

const TR_ILLER = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Amasya","Ankara","Antalya","Artvin",
  "Aydın","Balıkesir","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale",
  "Çankırı","Çorum","Denizli","Diyarbakır","Edirne","Elazığ","Erzincan","Erzurum",
  "Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkâri","Hatay","Isparta","Mersin",
  "İstanbul","İzmir","Kars","Kastamonu","Kayseri","Kırklareli","Kırşehir","Kocaeli",
  "Konya","Kütahya","Malatya","Manisa","Kahramanmaraş","Mardin","Muğla","Muş","Nevşehir",
  "Niğde","Ordu","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas","Tekirdağ","Tokat",
  "Trabzon","Tunceli","Şanlıurfa","Uşak","Van","Yozgat","Zonguldak","Aksaray","Bayburt",
  "Karaman","Kırıkkale","Batman","Şırnak","Bartın","Ardahan","Iğdır","Yalova","Karabük",
  "Kilis","Osmaniye","Düzce"
];

/* Büyük şehirler için örnek ilçe listeleri (öneri amaçlı; başka ilçe de yazılabilir) */
const TR_ILCELER = {
  "İstanbul": ["Beykoz","Kadıköy","Üsküdar","Şile","Çatalca","Silivri","Arnavutköy","Başakşehir","Beylikdüzü","Sancaktepe","Tuzla","Pendik","Sarıyer","Eyüpsultan","Maltepe","Kartal","Ataşehir","Ümraniye","Beşiktaş","Şişli","Bakırköy","Büyükçekmece","Esenyurt"],
  "Ankara": ["Çankaya","Keçiören","Etimesgut","Sincan","Gölbaşı","Polatlı","Yenimahalle","Mamak","Pursaklar","Kahramankazan","Altındağ","Beypazarı"],
  "İzmir": ["Konak","Bornova","Karşıyaka","Çeşme","Urla","Menemen","Bayraklı","Buca","Gaziemir","Seferihisar","Foça","Dikili","Çiğli","Narlıdere","Güzelbahçe"],
  "Bursa": ["Nilüfer","Osmangazi","Yıldırım","Gemlik","Mudanya","İnegöl","Gürsu","Kestel"],
  "Antalya": ["Muratpaşa","Konyaaltı","Kepez","Alanya","Manavgat","Serik","Kaş","Kemer","Side","Döşemealtı"],
  "Kocaeli": ["İzmit","Gebze","Çayırova","Darıca","Körfez","Gölcük","Başiskele","Kartepe","Derince"],
  "Muğla": ["Bodrum","Fethiye","Marmaris","Milas","Datça","Menteşe","Ortaca","Dalaman","Köyceğiz","Seydikemer"],
  "Tekirdağ": ["Çorlu","Çerkezköy","Süleymanpaşa","Kapaklı","Ergene","Saray","Marmaraereğlisi"],
  "Sakarya": ["Adapazarı","Serdivan","Erenler","Sapanca","Karasu","Akyazı","Hendek"],
  "Balıkesir": ["Edremit","Ayvalık","Bandırma","Altıeylül","Karesi","Burhaniye","Erdek","Gönen"],
  "Aydın": ["Efeler","Kuşadası","Didim","Söke","Nazilli","Çine","Germencik"],
  "Yalova": ["Merkez","Çınarcık","Termal","Çiftlikköy","Altınova","Armutlu"],
  "Adana": ["Seyhan","Çukurova","Yüreğir","Sarıçam","Ceyhan","Kozan"],
  "Mersin": ["Yenişehir","Mezitli","Toroslar","Akdeniz","Erdemli","Silifke","Tarsus","Anamur"],
  "Gaziantep": ["Şahinbey","Şehitkamil","Nizip","Oğuzeli","İslahiye"],
  "Konya": ["Selçuklu","Meram","Karatay","Ereğli","Akşehir","Beyşehir"],
  "Eskişehir": ["Odunpazarı","Tepebaşı","Sivrihisar","Çifteler"],
  "Samsun": ["İlkadım","Atakum","Canik","Bafra","Çarşamba","Tekkeköy"],
  "Trabzon": ["Ortahisar","Akçaabat","Yomra","Araklı","Of","Vakfıkebir","Arsin"],
  "Denizli": ["Pamukkale","Merkezefendi","Çivril","Tavas","Acıpayam","Sarayköy"],
  "Hatay": ["Antakya","İskenderun","Defne","Dörtyol","Samandağ","Kırıkhan","Arsuz"],
  "Manisa": ["Yunusemre","Şehzadeler","Akhisar","Salihli","Turgutlu","Soma"],
  "Kayseri": ["Melikgazi","Kocasinan","Talas","Develi","Yahyalı","İncesu"],
  "Çanakkale": ["Merkez","Ayvacık","Bozcaada","Gökçeada","Çan","Biga","Ezine"],
  "Bolu": ["Merkez","Gerede","Mengen","Mudurnu","Göynük"],
  "Edirne": ["Merkez","Keşan","Uzunköprü","İpsala","Enez"],
  "Düzce": ["Merkez","Akçakoca","Gölyaka","Kaynaşlı"]
};

/* Tahmini m² fiyat referansı (TL/m²). "İl|İlçe" anahtarı yoksa "İl" geneline,
   o da yoksa null döner -> kullanıcı manuel bölge ortalaması girer.
   Rakamlar TAHMİNİDİR; yön gösterme amaçlıdır, resmi değer değildir. */
const REF_FIYAT = {
  /* ---- İl geneli tahmini ortalamalar (81 il) ---- */
  "Adana": 12000, "Adıyaman": 4000, "Afyonkarahisar": 4500, "Ağrı": 2500, "Amasya": 4000,
  "Ankara": 18000, "Antalya": 22000, "Artvin": 5000, "Aydın": 14000, "Balıkesir": 12000,
  "Bilecik": 5000, "Bingöl": 2800, "Bitlis": 2500, "Bolu": 7000, "Burdur": 4000,
  "Bursa": 16000, "Çanakkale": 11000, "Çankırı": 3000, "Çorum": 4000, "Denizli": 11000,
  "Diyarbakır": 6000, "Edirne": 7000, "Elazığ": 4500, "Erzincan": 3500, "Erzurum": 4000,
  "Eskişehir": 14000, "Gaziantep": 11000, "Giresun": 6000, "Gümüşhane": 3000, "Hakkâri": 2500,
  "Hatay": 9000, "Isparta": 5000, "Mersin": 15000, "İstanbul": 42000, "İzmir": 26000,
  "Kars": 2800, "Kastamonu": 4000, "Kayseri": 9000, "Kırklareli": 7000, "Kırşehir": 3500,
  "Kocaeli": 17000, "Konya": 9000, "Kütahya": 4500, "Malatya": 5000, "Manisa": 9000,
  "Kahramanmaraş": 5000, "Mardin": 4500, "Muğla": 24000, "Muş": 2500, "Nevşehir": 5000,
  "Niğde": 4000, "Ordu": 8000, "Rize": 9000, "Sakarya": 11000, "Samsun": 12000,
  "Siirt": 3000, "Sinop": 6000, "Sivas": 4000, "Tekirdağ": 10000, "Tokat": 4000,
  "Trabzon": 16000, "Tunceli": 3000, "Şanlıurfa": 6000, "Uşak": 5000, "Van": 4000,
  "Yozgat": 3000, "Zonguldak": 7000, "Aksaray": 4000, "Bayburt": 2800, "Karaman": 4000,
  "Kırıkkale": 4000, "Batman": 4000, "Şırnak": 3000, "Bartın": 6000, "Ardahan": 2500,
  "Iğdır": 3000, "Yalova": 20000, "Karabük": 6000, "Kilis": 3500, "Osmaniye": 5000, "Düzce": 8000,

  /* ---- İlçe bazlı tahmini değerler ---- */
  // İstanbul
  "İstanbul|Beykoz": 55000, "İstanbul|Kadıköy": 110000, "İstanbul|Üsküdar": 95000,
  "İstanbul|Şile": 18000, "İstanbul|Çatalca": 9000, "İstanbul|Silivri": 14000,
  "İstanbul|Arnavutköy": 16000, "İstanbul|Başakşehir": 60000, "İstanbul|Beylikdüzü": 52000,
  "İstanbul|Sarıyer": 90000, "İstanbul|Tuzla": 38000, "İstanbul|Pendik": 45000,
  "İstanbul|Kartal": 55000, "İstanbul|Ataşehir": 80000, "İstanbul|Ümraniye": 65000,
  "İstanbul|Beşiktaş": 130000, "İstanbul|Şişli": 105000, "İstanbul|Bakırköy": 95000,
  "İstanbul|Büyükçekmece": 28000, "İstanbul|Esenyurt": 35000, "İstanbul|Maltepe": 60000,
  // Ankara
  "Ankara|Çankaya": 38000, "Ankara|Keçiören": 16000, "Ankara|Etimesgut": 20000,
  "Ankara|Gölbaşı": 14000, "Ankara|Polatlı": 6000, "Ankara|Yenimahalle": 22000,
  "Ankara|Altındağ": 12000, "Ankara|Mamak": 13000, "Ankara|Pursaklar": 12000,
  // İzmir
  "İzmir|Konak": 48000, "İzmir|Bornova": 35000, "İzmir|Karşıyaka": 45000,
  "İzmir|Çeşme": 70000, "İzmir|Urla": 38000, "İzmir|Seferihisar": 22000,
  "İzmir|Buca": 30000, "İzmir|Çiğli": 28000, "İzmir|Narlıdere": 42000, "İzmir|Foça": 30000,
  // Bursa
  "Bursa|Nilüfer": 30000, "Bursa|Osmangazi": 22000, "Bursa|Mudanya": 28000,
  "Bursa|Gemlik": 18000, "Bursa|Yıldırım": 16000, "Bursa|İnegöl": 10000,
  // Antalya
  "Antalya|Muratpaşa": 45000, "Antalya|Konyaaltı": 42000, "Antalya|Alanya": 30000,
  "Antalya|Kaş": 35000, "Antalya|Kemer": 40000, "Antalya|Kepez": 20000,
  "Antalya|Manavgat": 18000, "Antalya|Serik": 14000, "Antalya|Döşemealtı": 16000,
  // Kocaeli
  "Kocaeli|İzmit": 22000, "Kocaeli|Gebze": 28000, "Kocaeli|Gölcük": 18000,
  "Kocaeli|Başiskele": 17000, "Kocaeli|Kartepe": 16000, "Kocaeli|Darıca": 24000,
  // Muğla
  "Muğla|Bodrum": 60000, "Muğla|Fethiye": 38000, "Muğla|Marmaris": 42000,
  "Muğla|Datça": 35000, "Muğla|Milas": 18000, "Muğla|Menteşe": 22000, "Muğla|Dalaman": 20000,
  // Tekirdağ
  "Tekirdağ|Çorlu": 14000, "Tekirdağ|Çerkezköy": 13000, "Tekirdağ|Süleymanpaşa": 12000,
  "Tekirdağ|Kapaklı": 11000, "Tekirdağ|Marmaraereğlisi": 13000,
  // Sakarya
  "Sakarya|Serdivan": 16000, "Sakarya|Adapazarı": 13000, "Sakarya|Sapanca": 18000,
  "Sakarya|Karasu": 12000, "Sakarya|Erenler": 12000,
  // Balıkesir
  "Balıkesir|Edremit": 16000, "Balıkesir|Ayvalık": 22000, "Balıkesir|Bandırma": 12000,
  "Balıkesir|Altıeylül": 11000, "Balıkesir|Erdek": 15000, "Balıkesir|Burhaniye": 14000,
  // Aydın
  "Aydın|Kuşadası": 30000, "Aydın|Didim": 22000, "Aydın|Efeler": 15000,
  "Aydın|Söke": 12000, "Aydın|Nazilli": 9000,
  // Yalova
  "Yalova|Merkez": 22000, "Yalova|Çınarcık": 24000, "Yalova|Termal": 20000, "Yalova|Çiftlikköy": 18000,
  // Adana
  "Adana|Çukurova": 18000, "Adana|Seyhan": 14000, "Adana|Yüreğir": 9000,
  "Adana|Sarıçam": 10000, "Adana|Ceyhan": 7000,
  // Mersin
  "Mersin|Mezitli": 22000, "Mersin|Yenişehir": 20000, "Mersin|Erdemli": 16000,
  "Mersin|Silifke": 12000, "Mersin|Tarsus": 9000, "Mersin|Toroslar": 12000, "Mersin|Akdeniz": 13000,
  // Gaziantep
  "Gaziantep|Şehitkamil": 14000, "Gaziantep|Şahinbey": 12000, "Gaziantep|Nizip": 6000,
  // Konya
  "Konya|Selçuklu": 14000, "Konya|Meram": 10000, "Konya|Karatay": 8000, "Konya|Ereğli": 5000,
  // Eskişehir
  "Eskişehir|Tepebaşı": 16000, "Eskişehir|Odunpazarı": 14000,
  // Samsun
  "Samsun|Atakum": 18000, "Samsun|İlkadım": 13000, "Samsun|Bafra": 7000, "Samsun|Canik": 11000,
  // Trabzon
  "Trabzon|Ortahisar": 20000, "Trabzon|Akçaabat": 16000, "Trabzon|Yomra": 18000, "Trabzon|Arsin": 14000,
  // Denizli
  "Denizli|Pamukkale": 13000, "Denizli|Merkezefendi": 12000,
  // Hatay
  "Hatay|İskenderun": 12000, "Hatay|Antakya": 9000, "Hatay|Defne": 8000, "Hatay|Arsuz": 11000,
  // Manisa
  "Manisa|Yunusemre": 11000, "Manisa|Şehzadeler": 10000, "Manisa|Akhisar": 7000, "Manisa|Salihli": 7000,
  // Kayseri
  "Kayseri|Melikgazi": 12000, "Kayseri|Talas": 13000, "Kayseri|Kocasinan": 9000,
  // Çanakkale
  "Çanakkale|Merkez": 15000, "Çanakkale|Ayvacık": 14000, "Çanakkale|Bozcaada": 30000,
  "Çanakkale|Gökçeada": 18000, "Çanakkale|Çan": 7000,
  // Bolu
  "Bolu|Merkez": 9000, "Bolu|Gerede": 5000, "Bolu|Mudurnu": 6000,
  // Edirne
  "Edirne|Merkez": 9000, "Edirne|Keşan": 7000, "Edirne|Enez": 8000,
  // Düzce
  "Düzce|Merkez": 9000, "Düzce|Akçakoca": 12000, "Düzce|Gölyaka": 8000
};

/* İl|İlçe ya da il geneli için tahmini referans fiyatı döndürür (yoksa null). */
function refFiyatBul(il, ilce) {
  if (!il) return null;
  const key = ilce ? `${il}|${ilce}` : null;
  if (key && REF_FIYAT[key] != null) return REF_FIYAT[key];
  if (REF_FIYAT[il] != null) return REF_FIYAT[il];
  return null;
}

/* Taşınmaz / imar türleri (İmar Gücü puanına temel) */
const TASINMAZ_TURLERI = [
  { id: "ticari",  ad: "Ticari",        imarPuan: 20 },
  { id: "konut",   ad: "Konut",         imarPuan: 18 },
  { id: "villa",   ad: "Villa Arsası",  imarPuan: 18 },
  { id: "turizm",  ad: "Turizm",        imarPuan: 16 },
  { id: "arsa",    ad: "Arsa (Genel)",  imarPuan: 15 },
  { id: "sanayi",  ad: "Sanayi",        imarPuan: 14 },
  { id: "tarla",   ad: "Tarla",         imarPuan: 5  }
];

/* Bölgesel gelişim sinyalleri (Bölgesel Potansiyel puanına temel) */
const SINYALLER = [
  { id: "nufus",       ad: "Nüfus artışı" },
  { id: "yatirim",     ad: "Yeni yatırımlar" },
  { id: "osb",         ad: "OSB (Organize Sanayi)" },
  { id: "metro",       ad: "Metro / raylı sistem" },
  { id: "havalimani",  ad: "Havalimanı" },
  { id: "universite",  ad: "Üniversite" },
  { id: "deniz",       ad: "Deniz / sahil" }
];

/* Altyapı bileşenleri (Altyapı puanı: her biri 2.5) */
const ALTYAPI = [
  { id: "elektrik",     ad: "Elektrik" },
  { id: "su",           ad: "Su" },
  { id: "kanalizasyon", ad: "Kanalizasyon" },
  { id: "dogalgaz",     ad: "Doğalgaz" }
];

/* Kullanım amaçları (yorum tonunu belirler) */
const KULLANIM_AMACLARI = [
  { id: "oturum",      ad: "Oturum" },
  { id: "yatirim",     ad: "Yatırım" },
  { id: "muteahhit",   ad: "Müteahhitlik" },
  { id: "parselasyon", ad: "Parselasyon" },
  { id: "kiralama",    ad: "Kiralama" },
  { id: "tarim",       ad: "Tarımsal kullanım" }
];

/* Risk işaretleri (kullanıcı beyanı) */
const RISK_FLAGS = [
  { id: "hisseli",       ad: "Hisseli tapu",            grup: "Hukuki" },
  { id: "serh",          ad: "Şerh var",                grup: "Hukuki" },
  { id: "ipotek",        ad: "İpotek var",              grup: "Hukuki" },
  { id: "dava",          ad: "Dava kaydı var",          grup: "Hukuki" },
  { id: "imarBeklenti",  ad: "İmar beklentisi (henüz imarsız)", grup: "İmar" },
  { id: "planDegisiklik",ad: "Plan değişikliği süreci", grup: "İmar" },
  { id: "sit",           ad: "Sit alanı",               grup: "İmar" },
  { id: "yolYok",        ad: "Yol bağlantısı yok",      grup: "Altyapı" },
  { id: "deprem",        ad: "Yüksek deprem riski",     grup: "Doğal" },
  { id: "heyelan",       ad: "Heyelan riski",           grup: "Doğal" },
  { id: "taskin",        ad: "Taşkın / sel riski",      grup: "Doğal" }
];

/* Hukuki uyarı (her raporun sonunda zorunlu) */
const HUKUKI_UYARI = [
  "Bu rapor yatırım tavsiyesi değildir.",
  "Bu rapor resmi ekspertiz değildir.",
  "Bu rapor hukuki görüş değildir.",
  "Kamuya açık veriler ve kullanıcı tarafından sağlanan bilgiler üzerinden oluşturulmuştur.",
  "Nihai yatırım kararı kullanıcı sorumluluğundadır."
];
