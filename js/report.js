/* =========================================================================
   aliniralinmaz.com  —  Rapor Üreteci (report.js)
   Skor/risk verisinden: doğal dil karar paragrafı, bölge analizi metni,
   geliştirme senaryosu ve hukuki uyarı üretir.
   ========================================================================= */

/* Kullanım amacına göre yorum tonu */
function amacYorumu(amacId, sonuc, input) {
  const skor = sonuc.toplam;
  switch (amacId) {
    case "oturum":
      return skor >= 60
        ? "Oturum amacı için altyapı ve ulaşım kriterleri öne çıkıyor; yaşanabilirlik açısından makul bir tercih."
        : "Oturum amacı için altyapı/ulaşım eksikleri konfora yansıyabilir; dikkatli değerlendirilmeli.";
    case "yatirim":
      return skor >= 60
        ? "Yatırım amacı için bölgesel gelişim ve fiyat avantajı değeri destekliyor; orta-uzun vadede değerlenme beklenebilir."
        : "Yatırım amacı için likidite ve gelişim sinyalleri zayıf; geri dönüş süresi uzayabilir.";
    case "muteahhit":
      return sonuc.kirilim.find(k => k.ad === "Geliştirilebilirlik").puan >= 7
        ? "Müteahhitlik için emsal, cephe ve imar gücü proje üretmeye uygun görünüyor."
        : "Müteahhitlik için geliştirme parametreleri (emsal/cephe/imar) sınırlı; fizibilite kritik.";
    case "parselasyon":
      return "Parselasyon amacı için yüzölçümü, yola cephe ve imar planı şartlarının ifraz koşullarına uygunluğu mutlaka teyit edilmelidir.";
    case "kiralama":
      return skor >= 60
        ? "Kiralama amacı için ulaşım ve bölge talebi getiri potansiyelini destekliyor."
        : "Kiralama amacı için talep ve ulaşım zayıf olabilir; getiri beklentisi temkinli tutulmalı.";
    case "tarim":
      return "Tarımsal kullanım için su erişimi, toprak vasfı ve yola ulaşım önceliklidir; imar potansiyeli ikincil değerlendirilmelidir.";
    default:
      return "Kullanım amacına göre öncelikli kriterler ayrıca değerlendirilmelidir.";
  }
}

/* Nihai karar paragrafı (Zeck AI-ALMA Kararı metni) */
function kararParagrafi(input, sonuc) {
  const ad = input.tasinmazTuru
    ? (TASINMAZ_TURLERI.find(t => t.id === input.tasinmazTuru) || {}).ad
    : "Taşınmaz";
  const yer = [input.mahalle, input.ilce, input.il].filter(Boolean).join(", ");
  const amac = KULLANIM_AMACLARI.find(a => a.id === input.kullanimAmaci);

  let p = `${yer || "Belirtilen konum"} bölgesindeki ${ad || "taşınmaz"}, `;
  p += `100 üzerinden ${sonuc.toplam} puan ile "${sonuc.karar.etiket}" değerlendirmesini almıştır. `;

  if (sonuc.gucluYanlar.length) {
    p += `Öne çıkan güçlü yanlar: ${sonuc.gucluYanlar.slice(0, 3).join(" ")} `;
  }
  if (sonuc.zayifYanlar.length) {
    p += `Dikkat edilmesi gereken zayıf noktalar: ${sonuc.zayifYanlar.slice(0, 3).join(" ")} `;
  }
  if (amac) {
    p += amacYorumu(amac.id, sonuc, input) + " ";
  }

  // Karar tonuna göre kapanış
  switch (sonuc.karar.sinif) {
    case "alinabilir":
      p += "Genel tablo olumlu; uygun şartlarda değerlendirilebilir."; break;
    case "kontrollu":
      p += "Fırsat barındırıyor ancak belirtilen riskler giderilmeden ilerlenmemeli — tapu, imar ve zemin teyidi şart."; break;
    case "riskli":
      p += "Riskler getiriyi gölgeliyor; ancak doğru fiyat ve risk yönetimiyle fırsata çevrilebilir."; break;
    default:
      p += "Mevcut haliyle riskler yüksek; ek inceleme ve uzman görüşü olmadan uzak durulması önerilir.";
  }
  return p;
}

/* Bölge analizi metni (3. sayfa) */
function bolgeAnalizi(input, sonuc) {
  const aktif = (sonuc.kirilim.find(k => k.ad === "Bölgesel Potansiyel") || {}).aktif || [];
  const satirlar = [];
  const yer = [input.ilce, input.il].filter(Boolean).join(" / ") || "Bölge";

  if (aktif.length) {
    satirlar.push(`${yer} bölgesinde tespit edilen gelişim sinyalleri: ${aktif.join(", ")}.`);
    if (aktif.some(a => /Metro|Havalimanı|OSB/i.test(a)))
      satirlar.push("Büyük altyapı/istihdam yatırımları (metro, havalimanı, OSB) bölgenin değerlenme aksını güçlendiriyor.");
    if (aktif.some(a => /Üniversite/i.test(a)))
      satirlar.push("Üniversite varlığı kiralık talebi ve nüfus hareketliliğini destekliyor.");
    if (aktif.some(a => /Deniz|sahil/i.test(a)))
      satirlar.push("Deniz/sahil yakınlığı turizm ve ikincil konut talebini artırıyor.");
    if (aktif.some(a => /Nüfus/i.test(a)))
      satirlar.push("Nüfus artışı, orta vadede konut ve ticari alan talebini yukarı taşıyabilir.");
  } else {
    satirlar.push(`${yer} için belirgin bir gelişim sinyali işaretlenmedi; bölge dinamikleri yerinde araştırılmalı.`);
  }
  satirlar.push("Not: Bölgesel veriler kamuya açık göstergeler ve kullanıcı beyanı üzerinden tahmini olarak yorumlanmıştır.");
  return satirlar;
}

/* Geliştirme senaryosu — "bu arsadan en fazla para nasıl kazanılır?" */
function gelistirmeSenaryosu(input, sonuc) {
  const g = (sonuc.kirilim.find(k => k.ad === "Geliştirilebilirlik") || {}).puan || 0;
  const oneriler = [];
  if (["konut", "arsa", "villa"].includes(input.tasinmazTuru) && g >= 6) {
    oneriler.push("Kat karşılığı veya doğrudan inşaat ile konut/villa projesi geliştirilebilir.");
  }
  if (input.tasinmazTuru === "ticari") {
    oneriler.push("Ticari imar; dükkân/ofis veya gelir amaçlı kira modeliyle değerlendirilebilir.");
  }
  if (input.tasinmazTuru === "tarla") {
    oneriler.push("İmar beklentisi olgunlaşana dek tarımsal gelir; uygun koşulda ifraz/parselasyon değerlendirilebilir.");
  }
  if (Number(input.m2) >= 2000) {
    oneriler.push("Geniş yüzölçümü parselasyon/etaplı geliştirme için avantaj sağlar.");
  }
  if (!oneriler.length) {
    oneriler.push("Mevcut parametrelerle en uygun strateji, fiyat avantajını koruyup değerlenme beklemek olabilir.");
  }
  oneriler.push("Detaylı fizibilite, vaziyet planı ve proje taslağı için Zeck House Uzmanı paketi önerilir.");
  return oneriler;
}

/* Tam rapor objesi */
function raporUret(input, sonuc) {
  return {
    kararParagrafi: kararParagrafi(input, sonuc),
    bolge: bolgeAnalizi(input, sonuc),
    senaryo: gelistirmeSenaryosu(input, sonuc),
    hukuki: HUKUKI_UYARI
  };
}
