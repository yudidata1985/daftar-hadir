const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYLuRuOHDuVjRc2DD6fDdoNDA_taIblzGPkZTjxC_-6BzHSsH4XekIfbJcV3Odv6FO-A/exec";

const params = new URLSearchParams(window.location.search);
const namaRapat = params.get("rapat") || "Rapat Umum";
document.getElementById("rapatInfo").textContent = namaRapat;

const canvas = document.getElementById("signatureCanvas");
const signaturePad = new SignaturePad(canvas, {
  backgroundColor: "rgba(255,255,255,0)",
  penColor: "#1a202c",
});

function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
  signaturePad.clear();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Logika Dropdown Jabatan
document.getElementById("jabatan").addEventListener("change", function() {
  const kolomLainnya = document.getElementById("kolomLainnya");
  const inputLainnya = document.getElementById("jabatanLainnya");
  if (this.value === "Lain-lain") {
    kolomLainnya.style.display = "block";
    inputLainnya.required = true;
  } else {
    kolomLainnya.style.display = "none";
    inputLainnya.required = false;
    inputLainnya.value = ""; 
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  signaturePad.clear();
});

document.getElementById("hadirForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const statusMsg = document.getElementById("statusMsg");
  const submitBtn = document.getElementById("submitBtn");

  const nama = document.getElementById("nama").value.trim();
  const nip = document.getElementById("nip").value.trim();
  const sekolah = document.getElementById("sekolah").value.trim();
  
  const jabatanUtama = document.getElementById("jabatan").value;
  const jabatanLainnya = document.getElementById("jabatanLainnya").value.trim();
  const jabatanFinal = jabatanUtama === "Lain-lain" ? jabatanLainnya : jabatanUtama;

  if (signaturePad.isEmpty()) {
    statusMsg.textContent = "Tanda tangan wajib diisi.";
    statusMsg.className = "status error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim...";
  statusMsg.textContent = "";

  const payload = {
    nama: nama,
    nip: nip,
    sekolah: sekolah,
    jabatan: jabatanFinal,
    rapat: namaRapat,
    tandaTangan: signaturePad.toDataURL("image/png"),
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      body: JSON.stringify(payload),
    });
    
    statusMsg.textContent = "✅ Kehadiran berhasil dicatat. Terima kasih!";
    statusMsg.className = "status success";
    document.getElementById("hadirForm").reset();
    signaturePad.clear();
    document.getElementById("kolomLainnya").style.display = "none";

  } catch (err) {
    statusMsg.textContent = "❌ Gagal mengirim. Periksa koneksi internet Anda.";
    statusMsg.className = "status error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Kirim Kehadiran";
  }
});
