document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen Global ---
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const pangkatSelect = document.getElementById('pangkat-sekarang');
    const tmtInput = document.getElementById('tmt-terakhir');
    const formPangkat = document.getElementById('form-pangkat');
    const riwayatContainer = document.getElementById('riwayat-kinerja-container');
    const tambahPeriodeBtn = document.getElementById('tambah-periode');
    const validasiContainer = document.getElementById('validasi-jabatan');
    const validasiPertanyaan = document.getElementById('validasi-pertanyaan');
    const btnValidasiYa = document.getElementById('btn-validasi-ya');
    const btnValidasiTidak = document.getElementById('btn-validasi-tidak');
    const formKonten = document.getElementById('form-konten');
    const modalHasil = document.getElementById('modal-hasil-pangkat');
    const modalOutput = document.getElementById('modal-output-pangkat');
    const closeModalBtn = modalHasil.querySelector('.modal-close-btn');

    // --- Data Pangkat, Koefisien, dan Kinerja ---
    const ATURAN_PANGKAT = {
        "III/a": { ak_kumulatif: 100, target: "III/b", butuh: 50, koefisien: 12.5 },
        "III/b": { ak_kumulatif: 150, target: "III/c", butuh: 50, koefisien: 12.5 },
        "III/c": { ak_kumulatif: 200, target: "III/d", butuh: 100, koefisien: 25 },
        "III/d": { ak_kumulatif: 300, target: "IV/a", butuh: 100, koefisien: 25 },
        "IV/a": { ak_kumulatif: 400, target: "IV/b", butuh: 150, koefisien: 37.5 },
        "IV/b": { ak_kumulatif: 550, target: "IV/c", butuh: 150, koefisien: 37.5 },
        "IV/c": { ak_kumulatif: 700, target: "IV/d", butuh: 150, koefisien: 37.5 },
        "IV/d": { ak_kumulatif: 850, target: "IV/e", butuh: 200, koefisien: 50 },
        "IV/e": { ak_kumulatif: 1050, target: null, butuh: 0, koefisien: 50 }
    };
    const KONVERSI_KINERJA = { "Sangat Baik": 1.50, "Baik": 1.00, "Butuh Perbaikan": 0.75, "Kurang": 0.50, "Sangat Kurang": 0.25 };
    const SYARAT_JABATAN = { "III/c": "Lektor", "IV/a": "Lektor Kepala", "IV/d": "Guru Besar" };

    // ================================================================
    //             DEKLARASI FUNGSI-FUNGSI UTAMA
    // ================================================================

    function renderHasil(html) {
        modalOutput.innerHTML = html;
        modalHasil.classList.add('active');
    }

    // Ganti fungsi tambahPeriodeInput yang lama dengan ini

function tambahPeriodeInput() {
    const tmtValue = tmtInput.value;

    // --- VALIDASI BARU ---
    // 1. Cek apakah TMT sudah diisi
    if (!tmtValue) {
        // Buat pesan error dalam format HTML
        const pesanError = `
            <h2>Selamat Datang</h2>
            <div class="notif info">
                <strong>Ini adalah kalkulator pangkat</strong><br>
                Silakan isi 'TMT Pangkat Terakhir' terlebih dahulu sebelum menambahkan periode kinerja.
            </div>
        `;
        // Gunakan fungsi renderHasil() yang sudah ada untuk menampilkan modal
        renderHasil(pesanError); 
        tmtInput.classList.add('input-warning');
        return;
    }
    
    // Hapus tanda jika sudah diisi
    tmtInput.classList.remove('input-warning');

    const [day, month, year] = tmtValue.split('/');
    const tahunTmt = parseInt(year);

    // Dapatkan tahun terakhir yang sudah diinput (jika ada)
    const tahunTerakhirDiinput = riwayatContainer.childElementCount > 0 
        ? parseInt(riwayatContainer.lastChild.querySelector('.input-tahun').value) 
        : tahunTmt - 1;

    // 2. Cek apakah tahun berikutnya valid
    const tahunBerikutnya = tahunTerakhirDiinput + 1;
    if (tahunBerikutnya < tahunTmt) {
        alert(`Anda tidak bisa menambahkan kinerja dari tahun ${tahunBerikutnya} karena sebelum tahun TMT Anda (${tahunTmt}).`);
        return; // Hentikan fungsi
    }

    // --- Lanjutan kode yang sudah ada ---
    const baris = document.createElement('div');
    baris.className = 'baris-periode';
    const inputTahun = document.createElement('input');
    inputTahun.type = 'number';
    inputTahun.className = 'input-tahun';
    // Gunakan tahunBerikutnya yang sudah divalidasi, atau tahun TMT jika ini input pertama
    inputTahun.value = riwayatContainer.childElementCount === 0 ? tahunTmt : tahunBerikutnya;
    
    const opsiPeriode = { "Bulanan": 1, "Triwulanan": 3, "Semester": 6, "Tahunan": 12 };
    const selectPeriode = document.createElement('select');
    selectPeriode.className = 'input-periode';
    for (const [nama, bulan] of Object.entries(opsiPeriode)) {
        const option = document.createElement('option');
        option.value = bulan;
        option.textContent = nama;
        selectPeriode.appendChild(option);
    }
    const opsiPredikat = ["Sangat Baik", "Baik", "Butuh Perbaikan", "Kurang", "Sangat Kurang"];
    const selectPredikat = document.createElement('select');
    selectPredikat.className = 'input-predikat';
    opsiPredikat.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        selectPredikat.appendChild(option);
    });
    const hapusBtn = document.createElement('button');
    hapusBtn.textContent = '×';
    hapusBtn.type = 'button';
    hapusBtn.className = 'btn-hapus';
    hapusBtn.onclick = () => baris.remove();
    baris.append(inputTahun, selectPeriode, selectPredikat, hapusBtn);
    riwayatContainer.appendChild(baris);
}

    function cekValidasiJabatan() {
        const pangkatTerpilih = pangkatSelect.value;
        const targetJabatan = SYARAT_JABATAN[pangkatTerpilih];
        const submitButton = formPangkat.querySelector('.btn-primary');

        if (targetJabatan) {
            validasiPertanyaan.textContent = `Apakah Anda sudah naik jenjang ke jabatan ${targetJabatan}?`;
            validasiContainer.classList.remove('hidden');
            formKonten.classList.add('disabled');
            if(submitButton) submitButton.disabled = true;
        } else {
            validasiContainer.classList.add('hidden');
            formKonten.classList.remove('disabled');
            if(submitButton) submitButton.disabled = false;
        }
    }

    // ================================================================
    //             INISIALISASI & EVENT LISTENERS
    // ================================================================

    // --- Dark Mode ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '☀️';
    }
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            darkModeToggle.innerHTML = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            darkModeToggle.innerHTML = '🌙';
        }
    });

    // --- Datepicker ---
    if (tmtInput) {
        new Datepicker(tmtInput, { format: 'dd/mm/yyyy', autohide: true, buttonClass: 'btn' });
    }

    // --- Dropdown Pangkat ---
    for (const pangkat in ATURAN_PANGKAT) {
        const option = document.createElement('option');
        option.value = pangkat;
        option.textContent = `Pangkat ${pangkat}`;
        pangkatSelect.appendChild(option);
    }
    
    // --- Validasi Jabatan ---
    pangkatSelect.addEventListener('change', cekValidasiJabatan);
    btnValidasiYa.addEventListener('click', () => {
        const submitButton = formPangkat.querySelector('.btn-primary');
        validasiContainer.classList.add('hidden');
        formKonten.classList.remove('disabled');
        if(submitButton) submitButton.disabled = false;
    });
    btnValidasiTidak.addEventListener('click', () => {
        const pesan = `<h2>Validasi Jabatan</h2><div class="notif info"><strong>Silakan melakukan kenaikan jabatan terlebih dahulu.</strong><br>Anda harus memenuhi syarat jenjang jabatan fungsional sebelum dapat mengajukan kenaikan pangkat ini.</div>`;
        renderHasil(pesan);
    });
    cekValidasiJabatan();

    // --- Tambah Periode Kinerja ---
    tambahPeriodeBtn.addEventListener('click', tambahPeriodeInput);
    tambahPeriodeInput();

    // --- Modal ---
    closeModalBtn.addEventListener('click', () => modalHasil.classList.remove('active'));
    modalHasil.addEventListener('click', (e) => { if (e.target === modalHasil) modalHasil.classList.remove('active'); });
    
    // --- Form Submit Utama ---
// Ganti seluruh blok event listener formPangkat dengan yang ini
// Ganti seluruh blok event listener formPangkat dengan yang ini
// Ganti SELURUH blok event listener formPangkat Anda dengan yang ini

formPangkat.addEventListener('submit', function(e) {
    e.preventDefault();
    const pangkatSaatIni = pangkatSelect.value;
    const tmtTerakhirInput = tmtInput.value;
    
    // Validasi TMT harus diisi
    if (!tmtTerakhirInput) {
        renderHasil(`<h2>Peringatan</h2><div class="notif info">Silakan isi 'TMT Pangkat Terakhir' terlebih dahulu.</div>`);
        tmtInput.classList.add('input-warning');
        return;
    }
    tmtInput.classList.remove('input-warning');

    let akBaru = 0;
    let totalBulanKinerja = 0;
    let rincianKinerja = []; // <-- Variabel baru untuk menyimpan rincian
    const aturanPangkatIni = ATURAN_PANGKAT[pangkatSaatIni];
    const koefisien = aturanPangkatIni ? aturanPangkatIni.koefisien : 0;

    const riwayatKinerja = document.querySelectorAll('#riwayat-kinerja-container .baris-periode');
    
    // Loop untuk menghitung AK dan mengumpulkan rincian
    riwayatKinerja.forEach(baris => {
        const tahunKinerja = parseInt(baris.querySelector('.input-tahun').value);
        const bulanKinerja = parseInt(baris.querySelector('.input-periode').value);
        const predikat = baris.querySelector('.input-predikat').value;
        const pengali = KONVERSI_KINERJA[predikat] || 0;
        
        const [dayTmt, monthTmt, yearTmt] = tmtTerakhirInput.split('/');
        const tahunTmt = parseInt(yearTmt);
        const bulanTmt = parseInt(monthTmt);
        
        let akPerItem = 0;
        let rincianTeks = '';

        if (tahunKinerja === tahunTmt) {
            const bulanYangDihitung = 12 - bulanTmt + 1;
            akPerItem = (bulanYangDihitung / 12) * pengali * koefisien;
            totalBulanKinerja += bulanYangDihitung;
            rincianTeks = `Tahun ${tahunKinerja} (${predikat}): (${bulanYangDihitung}/12) x ${pengali.toFixed(2)} x ${koefisien} = ${akPerItem.toFixed(3)} AK`;
        } else {
            akPerItem = (bulanKinerja / 12) * pengali * koefisien;
            totalBulanKinerja += bulanKinerja;
            rincianTeks = `Tahun ${tahunKinerja} (${predikat}): (${bulanKinerja}/12) x ${pengali.toFixed(2)} x ${koefisien} = ${akPerItem.toFixed(3)} AK`;
        }
        akBaru += akPerItem;
        rincianKinerja.push(rincianTeks);
    });

    const totalAkTerkumpul = akBaru;
    const aturan = ATURAN_PANGKAT[pangkatSaatIni];
    const targetPangkat = aturan.target;

    if (!targetPangkat) {
        renderHasil("<h2>Analisis Kenaikan Pangkat</h2><p>Anda sudah berada di pangkat puncak.</p>");
        return;
    }

    const akDibutuhkan = aturan.butuh;
    const kekurangan = akDibutuhkan - totalAkTerkumpul;

    // --- Mulai menyusun tampilan hasil ---
    let pesan = `
        <h2>Analisis Kenaikan Pangkat</h2>
        <div class="rincian-ak">
            <p>+ AK Baru (e-Kinerja): <strong>${akBaru.toFixed(3)}</strong></p>`;
    
    // Menampilkan Rincian Perhitungan AK
    if (rincianKinerja.length > 0) {
        pesan += `<ul style="font-size: 0.8em; margin-left: 20px; color: var(--text-light); list-style-type: '▸ '; padding-left: 15px; margin-top: 5px;">`;
        rincianKinerja.forEach(rincian => {
            pesan += `<li>${rincian}</li>`;
        });
        pesan += `</ul>`;
    }
    
    pesan += `
            <hr>
            <p><strong>Total AK Baru Terkumpul: ${totalAkTerkumpul.toFixed(3)}</strong></p>
        </div>
        <div class="kartu-analisis">
            <h4>Analisis Kenaikan Pangkat</h4>
            <p>Target Berikutnya: <strong>Pangkat ${targetPangkat}</strong></p>
            <p>Syarat AK Tambahan: <strong>${akDibutuhkan}</strong></p>
        `;

    const [day, month, year] = tmtTerakhirInput.split('/');
    const tmtTerakhir = new Date(`${year}-${month}-${day}`);
    const tanggalSyaratWaktu = new Date(tmtTerakhir);
    tanggalSyaratWaktu.setFullYear(tanggalSyaratWaktu.getFullYear() + 2);
    const hariIni = new Date();

    // Logika Notifikasi Status
    if (kekurangan <= 0 && hariIni >= tanggalSyaratWaktu) {
        pesan += `<div class="notif sukses"><strong>Selamat!</strong> Anda sudah memenuhi syarat AK dan Waktu.<br>Kelebihan AK: <strong>${(-kekurangan).toFixed(2)}</strong></div>`;
    } else {
        pesan += `<div class="notif info">Kekurangan AK: <strong>${(kekurangan > 0 ? kekurangan : 0).toFixed(2)}</strong><br>Status: Belum Memenuhi Syarat</div>`;
    }
    if (hariIni < tanggalSyaratWaktu) {
        const tanggalPengajuanFormatted = tanggalSyaratWaktu.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        pesan += `<div class="notif info" style="margin-top:10px;"><strong>Syarat Waktu Belum Terpenuhi.</strong><br>Anda baru bisa mengajukan paling cepat pada <strong>${tanggalPengajuanFormatted}</strong>.</div>`;
    }
    
    // Menampilkan Analisis Skenario Progresif
    if (kekurangan > 0 && koefisien > 0) {
        const akPerTahunBaik = KONVERSI_KINERJA["Baik"] * koefisien;
        const tahunDibutuhkanBaik = kekurangan / akPerTahunBaik;
        const akPerTahunSangatBaik = KONVERSI_KINERJA["Sangat Baik"] * koefisien;
        const tahunDibutuhkanSangatBaik = kekurangan / akPerTahunSangatBaik;
        
        pesan += `
            <div class="notif info" style="margin-top: 10px;">
                <p style="margin-bottom: 5px; margin-top:0;">Untuk menutupi kekurangan AK, Anda perlu:</p>
                <ul style="margin: 0; padding-left: 20px; text-align: left;">
                    <li>Sekitar <strong>${tahunDibutuhkanBaik.toFixed(1)} tahun</strong> lagi dengan predikat 'Baik'.</li>
                    <li>Atau, sekitar <strong>${tahunDibutuhkanSangatBaik.toFixed(1)} tahun</strong> lagi dengan predikat 'Sangat Baik'.</li>
                </ul>
            </div>`;
    }

    // Menampilkan Estimasi Waktu
    if (kekurangan > 0 && totalBulanKinerja > 0 && akBaru > 0) {
        const akPerBulanRataRata = akBaru / totalBulanKinerja;
        const bulanDibutuhkanUntukAk = Math.ceil(kekurangan / akPerBulanRataRata);
        const tanggalAkTerpenuhi = new Date();
        tanggalAkTerpenuhi.setMonth(tanggalAkTerpenuhi.getMonth() + bulanDibutuhkanUntukAk);
        const tanggalEstimasiFinal = tanggalAkTerpenuhi > tanggalSyaratWaktu ? tanggalAkTerpenuhi : tanggalSyaratWaktu;
        const namaBulan = tanggalEstimasiFinal.toLocaleString('id-ID', { month: 'long' });
        const tahunProyeksi = tanggalEstimasiFinal.getFullYear();
        pesan += `<div class="notif estimasi">Dengan kinerja stabil, estimasi kenaikan ke <strong>Pangkat ${targetPangkat}</strong> dapat tercapai pada periode: <br><strong>${namaBulan} ${tahunProyeksi}</strong></div>`;
    }
    
    pesan += `</div>`; // Menutup kartu-analisis
    
    renderHasil(pesan);
});
});