// --- LANDING PAGE DYNAMIC (PAKAI DATA STATIS JSON) ---
let allBarang = [];
let currentTab = "all";

async function loadBarangList() {
  document.getElementById("dashboard-loading")?.classList.remove("hidden");

  try {
    const res = await fetch("/produk.json"); // Ambil data dari file lokal
    const result = await res.json();
    allBarang = result.data.reverse(); // Data terbaru di atas

    if (document.getElementById("admin-barang-list")) {
      showAdminBarangList();
    }
  } catch (err) {
    console.error("Gagal load barang:", err);
  } finally {
    document.getElementById("dashboard-loading")?.classList.add("hidden");
  }
}

function showAdminBarangList() {
  const list = document.getElementById("admin-barang-list");
  list.innerHTML = "";

  allBarang.forEach((barang) => {
    const el = document.createElement("div");
    el.className = "produk-card";
    el.innerHTML = `
      <img src="${barang.foto}" alt="${barang.nama}" />
      <div>
        <h3>${barang.nama}</h3>
        <p>${barang.deskripsi}</p>
        <p><strong>Rp${barang.harga.toLocaleString()}</strong></p>
        <a href="${barang.link}" target="_blank">Beli</a>
      </div>
    `;
    list.appendChild(el);
  });
}

// Inisialisasi
window.addEventListener("DOMContentLoaded", () => {
  loadBarangList();
});
