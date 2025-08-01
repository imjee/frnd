const API_URL = "https://196ff485-102a-44c5-a0a4-304e23d28f09-00-3u7rui322d4dz.sisko.replit.dev";
const TOKEN = localStorage.getItem('drc_token') || "";

// --- LANDING PAGE DYNAMIC ---
let allBarang = [];
let currentTab = "all";
let produkList, produkCards;

async function loadBarangList() {
  document.getElementById("dashboard-loading")?.classList.remove("hidden");

  try {
    const res = await fetch(`${API_URL}/api/barang`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const result = await res.json();
    allBarang = result.data.reverse(); // data terbaru di atas

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
        <button onclick="editBarang('${barang._id}')">Edit</button>
        <button onclick="deleteBarang('${barang._id}')">Hapus</button>
      </div>
    `;
    list.appendChild(el);
  });
}

async function submitBarangForm(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const isEdit = form.id.value;

  try {
    const res = await fetch(`${API_URL}/api/barang${isEdit ? `/${isEdit}` : ""}`, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      alert("Barang berhasil disimpan.");
      form.reset();
      document.getElementById("currentFoto").style.display = "none";
      loadBarangList();
    } else {
      alert(result.message || "Gagal menyimpan barang.");
    }
  } catch (err) {
    console.error("Error submit:", err);
    alert("Terjadi kesalahan saat menyimpan barang.");
  }
}

async function deleteBarang(id) {
  if (!confirm("Yakin ingin menghapus barang ini?")) return;

  try {
    const res = await fetch(`${API_URL}/api/barang/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const result = await res.json();
    if (res.ok) {
      alert("Barang dihapus.");
      loadBarangList();
    } else {
      alert(result.message || "Gagal menghapus barang.");
    }
  } catch (err) {
    console.error("Error delete:", err);
  }
}

function editBarang(id) {
  const barang = allBarang.find((b) => b._id === id);
  if (!barang) return;

  const form = document.getElementById("barangForm");
  form.id.value = barang._id;
  form.nama.value = barang.nama;
  form.deskripsi.value = barang.deskripsi;
  form.harga.value = barang.harga;
  form.link.value = barang.link;
  form.bestSeller.checked = barang.bestSeller;
  form.newLaunching.checked = barang.newLaunching;

  const fotoPreview = document.getElementById("currentFoto");
  fotoPreview.src = barang.foto;
  fotoPreview.style.display = "block";
}

// Inisialisasi
window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("barangForm");
  if (form) {
    form.addEventListener("submit", submitBarangForm);
    loadBarangList();
  }
});
