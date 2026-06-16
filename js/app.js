/* =========================================================================
   aliniralinmaz.com  —  Uygulama Kontrolcüsü (app.js)
   Ekran yönlendirme, form okuma, skor/rapor çağrısı, WhatsApp, harita.
   ========================================================================= */

/* Premium taleplerin gideceği WhatsApp numarası (ülke kodu ile). */
const WHATSAPP_NO = "905321314424";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

let state = { tasinmazTuru: null, kullanimAmaci: null };
let LOC = null;                 // { il: { f:<mahalle-dosya>, i:[ilçeler] } }
const mahalleCache = {};        // il -> { ilce: [mahalle...] }

/* Tam il/ilçe/mahalle verisini yükle ve kademeli seçimleri kur */
async function initLocations() {
  const ilSel = $("#il");
  try {
    const res = await fetch("data/il-ilce.json");
    LOC = await res.json();
  } catch (e) { LOC = null; }   // dosya yoksa data.js'teki kısa listeye düş
  const iller = (LOC ? Object.keys(LOC) : TR_ILLER.slice()).sort((a, b) => a.localeCompare(b, "tr"));
  ilSel.innerHTML = '<option value="">İl seçin</option>' + iller.map(i => `<option>${i}</option>`).join("");
  ilSel.addEventListener("change", onIlChange);
  $("#ilce").addEventListener("change", onIlceChange);
}

function onIlChange() {
  const il = $("#il").value;
  const ilceler = (LOC && LOC[il]) ? LOC[il].i : (TR_ILCELER[il] || []);
  $("#ilce").innerHTML = '<option value="">İlçe seçin</option>' + ilceler.map(i => `<option>${i}</option>`).join("");
  $("#mahalle").value = "";
  $("#mahalleList").innerHTML = "";
  refreshBolgeOrt();
}

async function onIlceChange() {
  refreshBolgeOrt();
  const il = $("#il").value, ilce = $("#ilce").value;
  const dl = $("#mahalleList");
  dl.innerHTML = ""; $("#mahalle").value = "";
  if (!LOC || !LOC[il] || !ilce) return;
  let data = mahalleCache[il];
  if (!data) {
    try {
      const res = await fetch("data/mahalle/" + LOC[il].f + ".json");
      data = await res.json();
      mahalleCache[il] = data;
    } catch (e) { return; }
  }
  const mahalleler = data[ilce] || [];
  dl.innerHTML = mahalleler.map(m => `<option value="${m.replace(/"/g, "&quot;")}">`).join("");
}

/* ----------------- Ekran yönetimi ----------------- */
const WIZARD = ["step-temel", "step-gelismis", "step-amac", "sonuc"];

function goTo(id) {
  $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  const wp = $("#wizardProgress");
  const inWizard = WIZARD.includes(id) || id === "analiz";
  wp.hidden = !inWizard;
  if (inWizard) markProgress(id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function markProgress(id) {
  const idx = WIZARD.indexOf(id === "analiz" ? "sonuc" : id);
  $$(".wp-step").forEach((el, i) => {
    el.classList.toggle("done", i < idx);
    el.classList.toggle("current", i === idx);
  });
}

/* ----------------- Dinamik form alanlarını kur ----------------- */
function initForm() {
  // İl / İlçe / Mahalle kademeli veriyi yükle (tam liste — il-ilce.json + mahalle/<il>.json)
  initLocations();

  // Taşınmaz türü chipleri
  $("#turGroup").innerHTML = TASINMAZ_TURLERI
    .map(t => `<button type="button" class="chip" data-tur="${t.id}">${t.ad}</button>`).join("");
  $$("#turGroup .chip").forEach(c => c.addEventListener("click", () => {
    state.tasinmazTuru = c.dataset.tur;
    $$("#turGroup .chip").forEach(x => x.classList.toggle("sel", x === c));
    refreshBolgeOrt();
  }));

  // Kullanım amacı chipleri
  $("#amacGroup").innerHTML = KULLANIM_AMACLARI
    .map(a => `<button type="button" class="chip" data-amac="${a.id}">${a.ad}</button>`).join("");
  $$("#amacGroup .chip").forEach(c => c.addEventListener("click", () => {
    state.kullanimAmaci = c.dataset.amac;
    $$("#amacGroup .chip").forEach(x => x.classList.toggle("sel", x === c));
  }));

  // Altyapı / sinyal / risk checkbox grupları
  $("#altyapiGroup").innerHTML = ALTYAPI
    .map(a => `<label class="check"><input type="checkbox" data-alt="${a.id}" /> ${a.ad}</label>`).join("");
  $("#sinyalGroup").innerHTML = SINYALLER
    .map(s => `<label class="check"><input type="checkbox" data-sin="${s.id}" /> ${s.ad}</label>`).join("");
  $("#riskGroup").innerHTML = RISK_FLAGS
    .map(r => `<label class="check"><input type="checkbox" data-risk="${r.id}" /> ${r.ad}</label>`).join("");

  // m² fiyatı otomatik hesap
  $("#satisFiyati").addEventListener("input", hesaplaM2Fiyat);
  $("#m2").addEventListener("input", hesaplaM2Fiyat);
}

function hesaplaM2Fiyat() {
  const f = Number($("#satisFiyati").value) || 0;
  const m2 = Number($("#m2").value) || 0;
  $("#m2Fiyat").value = (f > 0 && m2 > 0) ? Math.round(f / m2).toLocaleString("tr-TR") + " TL/m²" : "";
}

function refreshBolgeOrt() {
  const ref = refFiyatBul($("#il").value, $("#ilce").value);
  const inp = $("#bolgeOrt");
  if (ref != null && !inp.dataset.touched) {
    inp.value = ref;
    $("#bolgeOrtHelp").textContent = "Tahmini referans değer otomatik geldi — gerekirse düzenleyebilirsin.";
  } else if (ref == null && !inp.dataset.touched) {
    $("#bolgeOrtHelp").textContent = "Bu bölge için tahmini veri yok; bölge ortalamasını sen girersen fiyat avantajı daha doğru hesaplanır.";
  }
}

/* ----------------- Formdan input objesi oku ----------------- */
function readInput() {
  const num = id => Number($("#" + id).value) || 0;
  const m2 = num("m2");
  const satis = num("satisFiyati");
  return {
    il: $("#il").value, ilce: $("#ilce").value, mahalle: $("#mahalle").value,
    ada: $("#ada").value, parsel: $("#parsel").value, ilanLink: $("#ilanLink").value,
    m2,
    tasinmazTuru: state.tasinmazTuru,
    imarDurumu: $("#imarDurumu").value,
    emsal: num("emsal"), hmax: $("#hmax").value, cephe: num("cephe"),
    koseParsel: $("#koseParsel").checked, yolaCepheli: $("#yolaCepheli").checked,
    ulasim: $("#ulasim").value,
    altyapi: Object.fromEntries($$("#altyapiGroup input").map(i => [i.dataset.alt, i.checked])),
    sinyaller: Object.fromEntries($$("#sinyalGroup input").map(i => [i.dataset.sin, i.checked])),
    riskler: Object.fromEntries($$("#riskGroup input").map(i => [i.dataset.risk, i.checked])),
    satisFiyati: satis,
    m2Fiyat: (satis > 0 && m2 > 0) ? satis / m2 : 0,
    bolgeOrt: num("bolgeOrt"),
    kullanimAmaci: state.kullanimAmaci
  };
}

/* ----------------- Doğrulama (adım geçişi) ----------------- */
function validate(stepId) {
  if (stepId === "step-gelismis") {
    if (!$("#il").value) { alert("Lütfen il seçin."); return false; }
    if (!state.tasinmazTuru) { alert("Lütfen taşınmaz türünü seçin."); return false; }
    if (!(Number($("#m2").value) > 0)) { alert("Lütfen geçerli bir yüzölçümü (m²) girin."); return false; }
  }
  return true;
}

/* ----------------- Analiz akışı ----------------- */
const ANALIZ_MSG = [
  "Bölge verileri değerlendiriliyor…",
  "İmar ve ulaşım kriterleri puanlanıyor…",
  "Fiyat avantajı bölge ortalamasıyla karşılaştırılıyor…",
  "Risk motoru çalıştırılıyor…",
  "Nihai karar oluşturuluyor…"
];

function runAnaliz() {
  if (!state.kullanimAmaci) { alert("Lütfen kullanım amacını seçin."); return; }
  goTo("analiz");
  let i = 0;
  const bar = $("#progBar");
  const msg = $("#analyzingMsg");
  bar.style.width = "0%";
  const tick = setInterval(() => {
    i++;
    msg.textContent = ANALIZ_MSG[Math.min(i, ANALIZ_MSG.length - 1)];
    bar.style.width = Math.min(i * 22, 100) + "%";
    if (i >= ANALIZ_MSG.length) {
      clearInterval(tick);
      setTimeout(showSonuc, 450);
    }
  }, 520);
}

/* ----------------- Sonuç paneli render ----------------- */
function showSonuc() {
  const input = readInput();
  const sonuc = hesaplaSkor(input);
  const rapor = raporUret(input, sonuc);
  renderReport(input, sonuc, rapor);
  setupMap(input);
  goTo("sonuc");
}

function gaugeSVG(skor, sinif) {
  const pct = skor / 100;
  const R = 80, C = 2 * Math.PI * R;
  const dash = (C * pct).toFixed(1);
  return `
  <svg class="gauge gauge-${sinif}" viewBox="0 0 200 200" width="180" height="180">
    <circle cx="100" cy="100" r="${R}" class="g-track"/>
    <circle cx="100" cy="100" r="${R}" class="g-fill"
      stroke-dasharray="${dash} ${C}" transform="rotate(-90 100 100)"/>
    <text x="100" y="96" class="g-num">${skor}</text>
    <text x="100" y="124" class="g-sub">/ 100</text>
  </svg>`;
}

function renderReport(input, sonuc, rapor) {
  const yer = [input.mahalle, input.ilce, input.il].filter(Boolean).join(", ") || "—";
  const turAd = (TASINMAZ_TURLERI.find(t => t.id === input.tasinmazTuru) || {}).ad || "—";
  const kimlik = `Ada ${input.ada || "—"} / Parsel ${input.parsel || "—"} · ${input.m2 || "—"} m²`;

  const kirilimRows = sonuc.kirilim.map(k => {
    const pct = Math.round((k.puan / k.max) * 100);
    return `<div class="kr">
      <div class="kr-head"><span>${k.ad}</span><b>${k.puan} / ${k.max}</b></div>
      <div class="kr-bar"><span style="width:${pct}%"></span></div>
      <small>${k.not}</small></div>`;
  }).join("");

  const riskByGrup = {};
  sonuc.riskler.forEach(r => (riskByGrup[r.grup] = riskByGrup[r.grup] || []).push(r.metin));
  const riskHtml = sonuc.riskler.length
    ? Object.entries(riskByGrup).map(([g, arr]) =>
        `<div class="risk-grup"><h4>${g} Risk</h4><ul>${arr.map(m => `<li>${m}</li>`).join("")}</ul></div>`).join("")
    : `<p class="ok">Belirgin bir risk işaretlenmedi. Yine de tapu ve imar teyidi önerilir.</p>`;

  const guclu = sonuc.gucluYanlar.length
    ? `<ul>${sonuc.gucluYanlar.map(g => `<li>${g}</li>`).join("")}</ul>`
    : `<p class="muted">Belirgin güçlü yan öne çıkmadı.</p>`;

  $("#reportRoot").innerHTML = `
    <!-- Sayfa 1 -->
    <div class="card rep-page">
      <div class="rep-top">
        <div class="rep-score ${sonuc.karar.sinif}">
          ${gaugeSVG(sonuc.toplam, sonuc.karar.sinif)}
          <div class="rep-karar ${sonuc.karar.sinif}">${sonuc.karar.etiket}</div>
        </div>
        <div class="rep-ident">
          <span class="badge">Alınıralınmaz Skoru</span>
          <h2>${yer}</h2>
          <p class="rep-meta">${turAd} · ${kimlik}</p>
          ${input.imarDurumu ? `<p class="rep-meta">İmar: ${input.imarDurumu}</p>` : ""}
          ${input.m2Fiyat ? `<p class="rep-meta">m² fiyatı: ${Math.round(input.m2Fiyat).toLocaleString("tr-TR")} TL${input.bolgeOrt ? ` · Bölge ort. (tahmini): ${Number(input.bolgeOrt).toLocaleString("tr-TR")} TL` : ""}</p>` : ""}
        </div>
      </div>
      <h3 class="sec">Puan Kırılımı</h3>
      <div class="kirilim">${kirilimRows}</div>
    </div>

    <!-- Sayfa 2 -->
    <div class="card rep-page">
      <h3 class="sec">Güçlü Yanlar &amp; Riskler</h3>
      <div class="sw-grid">
        <div class="sw-col good"><h4>Güçlü Yanlar</h4>${guclu}</div>
        <div class="sw-col bad"><h4>Riskler</h4>${riskHtml}</div>
      </div>
    </div>

    <!-- Sayfa 3 -->
    <div class="card rep-page">
      <h3 class="sec">Bölge Analizi</h3>
      ${rapor.bolge.map(b => `<p>${b}</p>`).join("")}
    </div>

    <!-- Sayfa 4 -->
    <div class="card rep-page">
      <h3 class="sec">Nihai Karar — Zeck AI-ALMA Kararı (Ücretsiz)</h3>
      <div class="karar-banner ${sonuc.karar.sinif}">${sonuc.karar.etiket} · ${sonuc.toplam}/100</div>
      <p class="help esik-not">Karar profili: <strong>${sonuc.esik.profil}</strong> — Eşikler: ALINABİLİR ≥ ${sonuc.esik.a} · KONTROLLÜ ≥ ${sonuc.esik.k} · RİSKLİ ≥ ${sonuc.esik.r}. (Arazi türü ve kullanım amacına göre ayarlanır.)</p>
      <p class="karar-paragraf">${rapor.kararParagrafi}</p>
      <h4>Kazanç / Geliştirme Senaryosu</h4>
      <ul>${rapor.senaryo.map(s => `<li>${s}</li>`).join("")}</ul>
      <div class="hukuki">
        <h4>Hukuki Uyarı</h4>
        <ul>${rapor.hukuki.map(h => `<li>${h}</li>`).join("")}</ul>
      </div>
    </div>`;
}

/* ----------------- Harita ----------------- */
function setupMap(input) {
  const url = "https://parselsorgu.tkgm.gov.tr/";
  const frame = $("#mapFrame");
  frame.src = url;
  $("#mapOpen").href = url;
  // iframe engellenirse kullanıcı butonla açar (X-Frame-Options fallback)
}

/* ----------------- WhatsApp talebi ----------------- */
function sendWhatsapp() {
  const ad = $("#pAd").value.trim();
  const tel = $("#pTel").value.trim();
  if (!ad || !tel) { alert("Lütfen ad ve telefon bilgisini girin."); return; }
  const yer = $("#pYer").value.trim();
  const parsel = $("#pParsel").value.trim();
  const not = $("#pNot").value.trim();
  const msg =
    `Merhaba, aliniralinmaz.com üzerinden Premium Rapor / Zeck House Uzmanı talebi:%0A` +
    `Ad: ${ad}%0ATelefon: ${tel}%0AYer: ${yer || "-"}%0AAda/Parsel: ${parsel || "-"}%0ANot: ${not || "-"}`;
  window.open(`https://wa.me/${WHATSAPP_NO}?text=${msg}`, "_blank");
}

/* ----------------- Olay bağlama ----------------- */
function bindEvents() {
  $$("[data-go]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); goTo(el.dataset.go); }));
  $$("[data-next]").forEach(el => el.addEventListener("click", () => {
    if (validate(el.dataset.next)) goTo(el.dataset.next);
  }));
  $("#btnAnaliz").addEventListener("click", runAnaliz);
  $("#btnWhatsapp").addEventListener("click", sendWhatsapp);
  $("#bolgeOrt").addEventListener("input", e => { e.target.dataset.touched = "1"; });
}

document.addEventListener("DOMContentLoaded", () => {
  $("#yil").textContent = new Date().getFullYear();
  initForm();
  bindEvents();
});
