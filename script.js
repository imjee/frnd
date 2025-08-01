const API_URL = "https://196ff485-102a-44c5-a0a4-304e23d28f09-00-3u7rui322d4dz.sisko.replit.dev";
const TOKEN = localStorage.getItem('drc_token') || "";

// --- LANDING PAGE DYNAMIC ---
let allBarang = [];
let currentTab = "all";
let produkList, produkCards;

async function loadBarangList() {
  document.getElementById("produk-loading")?.style.setProperty("display", "");
  const res = await fetch(API_URL);
  const data = await res.json();
  document.getElementById("produk-loading")?.style.setProperty("display", "none");
  return data;
}

function makeCard(barang, idx) {
  const card = document.createElement("div");
  card.className = "barang-card";
  card.style.animationDelay = (0.04 * idx) + "s";
  let label = "";
  if (barang.bestSeller) label = `<span class="barang-label best">Best Seller</span>`;
  else if (barang.newLaunching) label = `<span class="barang-label">New Launching</span>`;
  card.innerHTML = `
    ${label}
    <img src="${barang.foto}" alt="${barang.nama}">
    <h3>${barang.nama}</h3>
    <div class="harga">Rp${barang.harga.toLocaleString("id-ID")}</div>
    <p>${barang.deskripsi}</p>
    <a class="beli-btn" href="${barang.link}" target="_blank" rel="noopener">Beli</a>
  `;
  return card;
}

function renderBarangList(tab = "all") {
  produkList = document.getElementById("barang-list");
  if (!produkList) return;
  let barangList = allBarang || [];
  if (tab === "new") barangList = barangList.filter(b => b.newLaunching);
  else if (tab === "best") barangList = barangList.filter(b => b.bestSeller);

  produkList.style.opacity = "0";
  setTimeout(() => {
    produkList.innerHTML = "";
    if (barangList.length === 0) {
      produkList.innerHTML = "<p>Belum ada produk tersedia.</p>";
    } else {
      barangList.slice().reverse().forEach((barang, idx) => {
        produkList.appendChild(makeCard(barang, idx));
      });
    }
    produkList.style.opacity = "1";
    // Fade-in animasi kartu
    document.querySelectorAll(".barang-card").forEach(c=>c.classList.add("fade-in","visible"));
  }, 350);
}

function setupTabs() {
  const tabs = document.querySelectorAll('.produk-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentTab = this.dataset.tab;
      renderBarangList(currentTab);
    });
  });
}

// Fade-in section saat muncul di viewport
function fadeInOnScroll() {
  const faders = document.querySelectorAll('.fade-in');
  faders.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 30) el.classList.add('visible');
  });
}
window.addEventListener('scroll', fadeInOnScroll); window.addEventListener('DOMContentLoaded', fadeInOnScroll);

document.addEventListener("DOMContentLoaded", async function() {
  // Landing
  if(document.getElementById("barang-list")){
    allBarang = await loadBarangList();
    renderBarangList("all");
    setupTabs();
    setInterval(async ()=>{ allBarang = await loadBarangList(); renderBarangList(currentTab); }, 9000);
  }
  // Admin CRUD
  const form = document.getElementById("barangForm");
  if(!form) return;
  adminRenderBarangList();

  form.foto.addEventListener('change', function(){
    if(this.files[0]){
      const reader = new FileReader();
      reader.onload = function(ev){
        document.getElementById("currentFoto").src = ev.target.result;
        document.getElementById("currentFoto").style.display = "block";
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  form.onsubmit = async function(e){
    e.preventDefault();
    const id = form.id.value;
    const nama = form.nama.value.trim();
    const deskripsi = form.deskripsi.value.trim();
    const harga = parseInt(form.harga.value);
    const link = form.link.value.trim();
    const newLaunching = form.newLaunching.checked;
    const bestSeller = form.bestSeller.checked;

    let foto = "";
    if(form.foto.files[0]){
      const reader = new FileReader();
      reader.onload = async function(ev){
        foto = ev.target.result;
        await submitBarang({id, nama, deskripsi, harga, foto, link, newLaunching, bestSeller});
      };
      reader.readAsDataURL(form.foto.files[0]);
      return;
    } else if(document.getElementById("currentFoto").src){
      foto = document.getElementById("currentFoto").src;
    }
    await submitBarang({id, nama, deskripsi, harga, foto, link, newLaunching, bestSeller});
  };

  async function submitBarang(data){
    let method = "POST";
    let url = API_URL;
    if(data.id){ method = "PUT"; url = `${API_URL}/${data.id}`; }
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + TOKEN
      },
      body: JSON.stringify(data)
    });
    if(res.ok){
      form.reset();
      document.getElementById("currentFoto").style.display = "none";
      document.getElementById("success-message").innerText = data.id ? "Produk berhasil diedit!" : "Produk berhasil ditambahkan!";
      adminRenderBarangList();
      reloadLandingProduk();
    }else{
      alert("Gagal menyimpan produk.");
    }
  }
});

// ----- ADMIN CRUD -----
async function fetchAdminBarang() {
  document.getElementById("dashboard-loading")?.style.setProperty("display", "");
  const res = await fetch(API_URL);
  const data = await res.json();
  document.getElementById("dashboard-loading")?.style.setProperty("display", "none");
  return data;
}

async function adminRenderBarangList() {
  const list = await fetchAdminBarang();
  const cont = document.getElementById("admin-barang-list");
  if(!cont) return;
  if(list.length === 0) {
    cont.innerHTML = "<p>Belum ada produk.</p>";
    return;
  }
  cont.innerHTML = "";
  list.slice().reverse().forEach(barang => {
    const div = document.createElement("div");
    div.className = "barang-card";
    let label = "";
    if (barang.bestSeller) label = `<span class="barang-label best">Best Seller</span>`;
    else if (barang.newLaunching) label = `<span class="barang-label">New Launching</span>`;
    div.innerHTML = `
      ${label}
      <img src="${barang.foto}" alt="${barang.nama}">
      <h3>${barang.nama}</h3>
      <div class="harga">Rp${barang.harga.toLocaleString("id-ID")}</div>
      <p>${barang.deskripsi}</p>
      <a class="beli-btn" href="${barang.link}" target="_blank" rel="noopener">Beli</a>
      <div style="margin-top:12px;">
        <button class="edit-btn" data-id="${barang.id}">Edit</button>
        <button class="del-btn" data-id="${barang.id}">Hapus</button>
      </div>
    `;
    cont.appendChild(div);
  });

  // Edit
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = async function() {
      const id = this.dataset.id;
      const list = await fetchAdminBarang();
      const barang = list.find(b => b.id === id);
      fillForm(barang);
      window.scrollTo({top:0,behavior:"smooth"});
    };
  });
  // Delete
  document.querySelectorAll(".del-btn").forEach(btn => {
    btn.onclick = async function() {
      const id = this.dataset.id;
      if(confirm("Yakin hapus produk ini?")){
        await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { "Authorization": "Bearer " + TOKEN }
        });
        adminRenderBarangList();
        reloadLandingProduk();
        document.getElementById("barangForm").reset();
        document.getElementById("currentFoto").style.display = "none";
        document.getElementById("success-message").innerText = "Produk berhasil dihapus!";
      }
    };
  });
}

function fillForm(barang){
  const form = document.getElementById("barangForm");
  form.id.value = barang.id;
  form.nama.value = barang.nama;
  form.deskripsi.value = barang.deskripsi;
  form.harga.value = barang.harga;
  form.link.value = barang.link;
  form.newLaunching.checked = barang.newLaunching;
  form.bestSeller.checked = barang.bestSeller;
  document.getElementById("currentFoto").src = barang.foto;
  document.getElementById("currentFoto").style.display = "block";
}

async function reloadLandingProduk(){
  allBarang = await loadBarangList();
  renderBarangList(currentTab);
}
