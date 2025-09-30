const ATURAN_JABATAN = {
    "Asisten Ahli": {
        pangkat: { "III/a": { akKumulatif: 0 }, "III/b": { akKumulatif: 50 } },
        koefisien: 12.5, syaratAkKenaikanPangkat: 50, targetJenjangBerikutnya: "Lektor",
        kebutuhanUntukJenjangBerikutnya: 50,
    },
    "Lektor": {
        pangkat: { "III/c": { akKumulatif: 100 }, "III/d": { akKumulatif: 200 } },
        koefisien: 25, syaratAkKenaikanPangkat: 100, targetJenjangBerikutnya: "Lektor Kepala",
        kebutuhanUntukJenjangBerikutnya: 200,
    },
    "Lektor Kepala": {
        pangkat: { "IV/a": { akKumulatif: 400 }, "IV/b": { akKumulatif: 550 }, "IV/c": { akKumulatif: 700 } },
        koefisien: 37.5, syaratAkKenaikanPangkat: 150, targetJenjangBerikutnya: "Guru Besar",
        kebutuhanUntukJenjangBerikutnya: 450,
    },
    "Guru Besar": {
        pangkat: { "IV/d": { akKumulatif: 850 }, "IV/e": { akKumulatif: 1050 } },
        koefisien: 50, syaratAkKenaikanPangkat: 200, targetJenjangBerikutnya: null,
        kebutuhanUntukJenjangBerikutnya: null,
    }
};

const KONVERSI_KINERJA = { "Sangat Baik": 1.50, "Baik": 1.00, "Butuh Perbaikan": 0.75, "Kurang": 0.50, "Sangat Kurang": 0.25 };

function hitungSimulasiKarir(data) {
    const { jenjang, pangkat, akMinimalWajib, akIntegrasi, riwayatKinerja, ijazahBaru } = data;
    const aturan = ATURAN_JABATAN[jenjang];
    if (!aturan) return { error: "Jenjang jabatan tidak valid." };

    let akDariIjazah = ijazahBaru ? 0.25 * aturan.syaratAkKenaikanPangkat : 0;
    
    let akDariKonversi = 0;
    riwayatKinerja.forEach(item => {
        const pengali = KONVERSI_KINERJA[item.predikat] || 0;
        akDariKonversi += (item.bulan / 12) * pengali * aturan.koefisien;
    });

    const akBaruTerkumpul = akIntegrasi + akDariIjazah + akDariKonversi;
    const totalAkKumulatif = akMinimalWajib + akBaruTerkumpul;
    const akSejakPangkatTerakhir = totalAkKumulatif - akMinimalWajib;

    // --- Analisis Pangkat ---
    const daftarPangkat = Object.keys(aturan.pangkat);
    const pangkatSaatIniIndex = daftarPangkat.indexOf(pangkat);
    let targetPangkat = null, kebutuhanAkPangkat = null, kekuranganPangkat = null, kelebihanAkPangkat = 0;
    if (pangkatSaatIniIndex < daftarPangkat.length - 1) {
        targetPangkat = daftarPangkat[pangkatSaatIniIndex + 1];
        kebutuhanAkPangkat = aturan.pangkat[targetPangkat].akKumulatif - akMinimalWajib;
        kekuranganPangkat = kebutuhanAkPangkat - akSejakPangkatTerakhir;
        if (kekuranganPangkat <= 0) {
            kelebihanAkPangkat = -kekuranganPangkat;
        }
    }

    // --- Analisis Jenjang ---
    let targetJenjang = aturan.targetJenjangBerikutnya;
    let kebutuhanAkJenjang = aturan.kebutuhanUntukJenjangBerikutnya;
    let kekuranganJenjang = null;
    if (kebutuhanAkJenjang !== null) {
        kekuranganJenjang = kebutuhanAkJenjang - akBaruTerkumpul;
    }
    
    // --- Logika Estimasi ---
    let estimasi = { pesan: null };
    // Jalankan estimasi hanya jika ada kekurangan AK untuk jenjang berikutnya
    if (kebutuhanAkJenjang && riwayatKinerja.length > 0 && kekuranganJenjang > 0) {
    // Ambil data kinerja terakhir sebagai dasar proyeksi
    const kinerjaTerakhir = riwayatKinerja[riwayatKinerja.length - 1];
    const pengaliTerakhir = KONVERSI_KINERJA[kinerjaTerakhir.predikat] || 0;
    
    // Hitung estimasi perolehan AK per tahun berdasarkan kinerja terakhir
    const akPerTahunEstimasi = pengaliTerakhir * aturan.koefisien;

    if (akPerTahunEstimasi > 0) {
        // 1. Hitung perolehan AK per bulan untuk presisi yang lebih tinggi
        const akPerBulanEstimasi = akPerTahunEstimasi / 12;

        // 2. Hitung berapa bulan yang dibutuhkan untuk menutupi kekurangan AK
        const bulanDibutuhkan = Math.ceil(kekuranganJenjang / akPerBulanEstimasi);

        // 3. Tentukan tanggal mulai untuk proyeksi (kita anggap akhir tahun dari data terakhir)
        const tanggalMulaiProyeksi = new Date(kinerjaTerakhir.tahun, 11, 31); // Akhir Desember tahun terakhir

        // 4. Tambahkan bulan yang dibutuhkan ke tanggal mulai
        tanggalMulaiProyeksi.setMonth(tanggalMulaiProyeksi.getMonth() + bulanDibutuhkan);

        // 5. Format output ke dalam format "Nama Bulan Tahun" dalam Bahasa Indonesia
        const namaBulan = tanggalMulaiProyeksi.toLocaleString('id-ID', { month: 'long' });
        const tahunProyeksi = tanggalMulaiProyeksi.getFullYear();

        // 6. Buat pesan estimasi yang baru dan lebih detail
        estimasi.pesan = `Dengan asumsi kinerja stabil (${kinerjaTerakhir.predikat}), estimasi kenaikan ke <strong>${targetJenjang}</strong> diperkirakan tercapai pada <strong>${namaBulan} ${tahunProyeksi}</strong>.`;

    } else {
        estimasi.pesan = "Kinerja konversi terakhir tidak menghasilkan Angka Kredit, estimasi tidak dapat dihitung.";
    }
    }

return {
        jenjang, // <-- TAMBAHKAN BARIS INI
        pangkat, // <-- TAMBAHKAN BARIS INI
        akIntegrasi,
        akDariIjazah,
        akDariKonversi,
        akBaruTerkumpul,
        totalAkKumulatif,
        targetPangkat,
        kebutuhanAkPangkat,
        kekuranganPangkat: kekuranganPangkat > 0 ? kekuranganPangkat : 0,
        kelebihanAkPangkat,
        targetJenjang,
        kebutuhanAkJenjang,
        kekuranganJenjang: kekuranganJenjang > 0 ? kekuranganJenjang : 0,
        estimasi
    };
}

function hitungAkPromosi(targetJenjang) {
    const aturan = ATURAN_JABATAN[targetJenjang];
    if (!aturan) return { error: "Jenjang jabatan target tidak valid." };
    const akDasar = 100;
    const akDariKinerja = 2 * (1.50 * aturan.koefisien);
    const totalAk = akDasar + akDariKinerja;
    return { targetJenjang, akDasar, akDariKinerja: akDariKinerja.toFixed(3), totalAk: totalAk.toFixed(3), pesan: "Angka Kredit ini dapat digunakan untuk pengangkatan pertama ke dalam Jabatan Fungsional." };
}