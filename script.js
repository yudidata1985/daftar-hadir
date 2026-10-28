// 1. GANTI DENGAN URL APPS SCRIPT BAPAK YANG PALING BARU (yang berakhiran /exec)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwVe82Eg3QCbZjd9EDmLnMtNUkUUv4D8oss9LQEjkfXwy6iStFKVq0if2DIFYd8fuO1zQ/exec";

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
    rapat: namaRapat,
    tandaTangan: signaturePad.toDataURL("image/png"),
  };

  try {
    // 2. KODE INI KITA GUNAKAN UNTUK MELIHAT ERROR ASLINYA
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    // Jika server Google membalas dengan error, kita tangkap
    const result = await res.json();
    console.log("Balasan dari Google:", result);

    if (result.status === "success") {
      statusMsg.textContent = "✅ Kehadiran berhasil dicatat. Terima kasih!";
      statusMsg.className = "status success";
      document.getElementById("hadirForm").reset();
      signaturePad.clear();
    } else {
      throw new Error(result.message || "Gagal menyimpan");
    }
  } catch (err) {
    console.error("Error detail:", err);
    statusMsg.textContent = "❌ " + err.message;
    statusMsg.className = "status error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Kirim Kehadiran";
  }
});
