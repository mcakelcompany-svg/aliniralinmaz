/* =========================================================================
   aliniralinmaz.com  —  Skor Motoru (scoring.js)
   100 puanlık skor + karar eşikleri + risk motoru.
   Saf fonksiyonlar: input objesi alır, sonuç objesi döndürür.
   ========================================================================= */

/* Yardımcı: değeri [min,max] aralığına sıkıştır */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function r1(v) { return Math.round(v * 10) / 10; } // 1 ondalık

/* ---- 1) Fiyat Avantajı (20) ---- */
function puanFiyat(input) {
  const ort = Number(input.bolgeOrt) || 0;
  const m2f = Number(input.m2Fiyat) || 0;
  if (!ort || !m2f) {
    return { puan: 10, max: 20, not: "Bölge ortalaması girilmediği için nötr (10) kabul edildi." };
  }
  const oran = m2f / ort;
  let puan, not;
  if (oran <= 0.80)      { puan = 20; not = "Bölge ortalamasının %20+ altında — güçlü fiyat avantajı."; }
  else if (oran <= 0.90) { puan = 15; not = "Bölge ortalamasının ~%10 altında — iyi fiyat."; }
  else if (oran <= 1.10) { puan = 10; not = "Bölge ortalamasına yakın — makul fiyat."; }
  else if (oran < 1.20)  { puan = 5;  not = "Bölge ortalamasının üzerinde — fiyat dezavantajı."; }
  else                   { puan = 0;  not = "Bölge ortalamasının %20+ üzerinde — pahalı."; }
  return { puan, max: 20, not, oran };
}

/* ---- 2) İmar Gücü (20) ---- */
function puanImar(input) {
  if (input.riskler && input.riskler.sit) {
    return { puan: 0, max: 20, not: "Sit alanı — imar gücü yok kabul edildi." };
  }
  // Yatırım/tarımsal amaçta tarımsal arazide (tarla/zeytinlik) imar yokluğu DEZAVANTAJ SAYILMAZ;
  // değer fiyat avantajı, ulaşım, altyapı ve bölge potansiyelinden gelir.
  const agTuru = (input.tasinmazTuru === "tarla" || input.tasinmazTuru === "zeytinlik");
  const yatirimcil = (input.kullanimAmaci === "yatirim" || input.kullanimAmaci === "tarim");
  if (agTuru && yatirimcil) {
    return { puan: 13, max: 20, not: "Yatırım/tarımsal amaç: tarımsal arazide imar yokluğu olumsuz sayılmadı; değer konum, fiyat, ulaşım ve bölge potansiyelinden geliyor." };
  }
  const tur = TASINMAZ_TURLERI.find(t => t.id === input.tasinmazTuru);
  const puan = tur ? tur.imarPuan : 12;
  const not = tur ? `${tur.ad} imar türü.` : "İmar türü belirtilmedi.";
  return { puan, max: 20, not };
}

/* ---- 3) Ulaşım (15) ---- */
function puanUlasim(input) {
  let puan, not;
  switch (input.ulasim) {
    case "anayol": puan = 15; not = "Ana yola cepheli — üst düzey ulaşım."; break;
    case "yakin":  puan = 10; not = "Ana yola yakın — iyi ulaşım."; break;
    case "uzak":   puan = 5;  not = "Ana yola uzak — zayıf ulaşım."; break;
    default:       puan = 7;  not = "Ulaşım durumu belirtilmedi.";
  }
  return { puan, max: 15, not };
}

/* ---- 4) Altyapı (10) — her bileşen 2.5 ---- */
function puanAltyapi(input) {
  const a = input.altyapi || {};
  const var_ = ALTYAPI.filter(x => a[x.id]);
  const puan = var_.length * 2.5;
  const eksik = ALTYAPI.filter(x => !a[x.id]).map(x => x.ad);
  const not = var_.length === 4
    ? "Tüm altyapı mevcut."
    : (var_.length ? `Mevcut: ${var_.map(x => x.ad).join(", ")}.` : "Altyapı bilgisi yok / eksik.");
  return { puan, max: 10, not, eksik };
}

/* ---- 5) Bölgesel Potansiyel (15) — 7 sinyal arası dağılım ---- */
function puanBolgesel(input) {
  const s = input.sinyaller || {};
  const aktif = SINYALLER.filter(x => s[x.id]);
  const puan = clamp(aktif.length * (15 / 7), 0, 15);
  const not = aktif.length
    ? `Gelişim sinyalleri: ${aktif.map(x => x.ad).join(", ")}.`
    : "Belirgin bölgesel gelişim sinyali işaretlenmedi.";
  return { puan: r1(puan), max: 15, not, aktif: aktif.map(x => x.ad) };
}

/* ---- 6) Likidite (10) — ne kadar hızlı satılır ---- */
function puanLikidite(input, fiyatPuan) {
  let p = 0;
  // Yola cephe
  if (input.yolaCepheli) p += 2.5;
  // Ulaşım
  if (input.ulasim === "anayol") p += 2.5;
  else if (input.ulasim === "yakin") p += 1.5;
  // İmar tipi
  if (["ticari", "konut", "villa"].includes(input.tasinmazTuru)) p += 2.5;
  // Fiyat avantajı
  if (fiyatPuan >= 15) p += 2.5;
  else if (fiyatPuan >= 10) p += 1.5;
  // Düşürücü riskler
  const rk = input.riskler || {};
  if (rk.hisseli) p -= 3;
  if (rk.yolYok)  p -= 3;
  if (rk.sit)     p -= 3;
  p = clamp(p, 0, 10);
  let not = "Likidite ortalama.";
  if (p >= 8) not = "Yüksek likidite — hızlı satılabilir.";
  else if (p <= 3) not = "Düşük likidite — satışı zor olabilir.";
  return { puan: r1(p), max: 10, not };
}

/* ---- 7) Geliştirilebilirlik (10) — para üretme potansiyeli ---- */
function puanGelistirilebilirlik(input) {
  let p = 0;
  const emsal = Number(input.emsal) || 0;
  if (emsal >= 1.5) p += 3;
  else if (emsal >= 0.5) p += 2;
  else if (emsal > 0) p += 1;

  const cephe = Number(input.cephe) || 0;
  if (cephe >= 15) p += 2;
  else if (cephe >= 8) p += 1;

  if (input.koseParsel) p += 1.5;
  if (input.yolaCepheli) p += 1.5;

  if (["ticari", "konut", "villa"].includes(input.tasinmazTuru)) p += 2;

  // Sınırlayıcılar (yatırım/tarımsal amaçta gevşetilir — değer artışı/parselasyon potansiyeli)
  const rk = input.riskler || {};
  const yatirimcil = (input.kullanimAmaci === "yatirim" || input.kullanimAmaci === "tarim");
  if (input.tasinmazTuru === "tarla") p = Math.min(p, yatirimcil ? 7 : 4);
  if (input.tasinmazTuru === "zeytinlik") p = Math.min(p, yatirimcil ? 5 : 3); // zeytinlikte yapılaşma kısıtlı
  if (rk.sit) p = Math.min(p, 2);

  p = clamp(p, 0, 10);
  let not = "Orta düzey geliştirme potansiyeli.";
  if (p >= 8) not = "Yüksek geliştirme potansiyeli — proje üretmeye uygun.";
  else if (p <= 3) not = "Sınırlı geliştirme potansiyeli.";
  return { puan: r1(p), max: 10, not };
}

/* ---- Karar etiketi ---- */
function kararBul(toplam) {
  if (toplam >= 80) return { etiket: "ALINABİLİR", sinif: "alinabilir" };
  if (toplam >= 60) return { etiket: "KONTROLLÜ ALINABİLİR", sinif: "kontrollu" };
  if (toplam >= 45) return { etiket: "RİSKLİ", sinif: "riskli" };
  return { etiket: "UZAK DUR", sinif: "uzakdur" };
}

/* ---- Risk Motoru ---- */
function riskleriTopla(input, fiyat, altyapi) {
  const rk = input.riskler || {};
  const riskler = [];
  const ekle = (grup, metin) => riskler.push({ grup, metin });

  // Hukuki
  if (rk.hisseli) ekle("Hukuki", "Hisseli tapu — kullanım ve satışta ortak kısıtı riski.");
  if (rk.serh)    ekle("Hukuki", "Tapuda şerh — devir/kullanımda kısıtlama olabilir.");
  if (rk.ipotek)  ekle("Hukuki", "İpotek kaydı — borç ilişkisi araştırılmalı.");
  if (rk.dava)    ekle("Hukuki", "Dava kaydı — mülkiyet ihtilafı riski.");

  // İmar
  if (rk.sit)            ekle("İmar", "Sit alanı — yapılaşma ciddi şekilde kısıtlı.");
  if (rk.imarBeklenti)   ekle("İmar", "İmar beklentisi — henüz imarsız; gerçekleşmeme riski.");
  if (rk.planDegisiklik) ekle("İmar", "Plan değişikliği süreci — belirsizlik içerir.");
  if (!input.imarDurumu && !rk.sit && !rk.imarBeklenti)
    ekle("İmar", "İmar durumu net girilmedi — belediyeden teyit önerilir.");

  // Likidite
  if (input.ulasim === "uzak") ekle("Likidite", "Zayıf ulaşım — satış süresi uzayabilir.");
  if (rk.yolYok)               ekle("Likidite", "Yol bağlantısı yok — likidite ve değer düşer.");
  if (rk.hisseli)              ekle("Likidite", "Hisseli tapu likiditeyi düşürür.");

  // Finansal
  if (fiyat.puan === 0) ekle("Finansal", "Fiyat bölge ortalamasının belirgin üzerinde — şişirilmiş olabilir.");
  else if (fiyat.puan === 5) ekle("Finansal", "Fiyat bölge ortalamasının üzerinde — pazarlık önerilir.");

  // Altyapı
  if (altyapi.eksik && altyapi.eksik.length)
    ekle("Altyapı", `Eksik altyapı: ${altyapi.eksik.join(", ")}.`);

  // Doğal
  if (rk.deprem)  ekle("Doğal", "Yüksek deprem riski — zemin etüdü kritik.");
  if (rk.heyelan) ekle("Doğal", "Heyelan riski — jeolojik inceleme önerilir.");
  if (rk.taskin)  ekle("Doğal", "Taşkın/sel riski — dere yatağı ve kot kontrolü önerilir.");

  return riskler;
}

/* ---- Güçlü / zayıf yanlar (puan kırılımından türetilir) ---- */
function gucluZayif(kirilim) {
  const guclu = [], zayif = [];
  kirilim.forEach(k => {
    const oran = k.puan / k.max;
    if (oran >= 0.75) guclu.push(k.not);
    else if (oran <= 0.4) zayif.push(k.not);
  });
  return { guclu, zayif };
}

/* ============================ ANA FONKSİYON ============================ */
function hesaplaSkor(input) {
  const fiyat   = puanFiyat(input);
  const imar    = puanImar(input);
  const ulasim  = puanUlasim(input);
  const altyapi = puanAltyapi(input);
  const bolge   = puanBolgesel(input);
  const likid   = puanLikidite(input, fiyat.puan);
  const gelis   = puanGelistirilebilirlik(input);

  const kirilim = [
    { ad: "Fiyat Avantajı",      ...fiyat },
    { ad: "İmar Gücü",           ...imar },
    { ad: "Ulaşım",              ...ulasim },
    { ad: "Altyapı",             ...altyapi },
    { ad: "Bölgesel Potansiyel", ...bolge },
    { ad: "Likidite",            ...likid },
    { ad: "Geliştirilebilirlik", ...gelis }
  ];

  const toplam = Math.round(kirilim.reduce((s, k) => s + k.puan, 0));
  const karar = kararBul(toplam);
  const riskler = riskleriTopla(input, fiyat, altyapi);
  const { guclu, zayif } = gucluZayif(kirilim);

  return { toplam, karar, kirilim, riskler, gucluYanlar: guclu, zayifYanlar: zayif };
}
