document.addEventListener('DOMContentLoaded', function() {
    // ================================================================
    //             DEKLARASI ELEMEN UTAMA
    // ================================================================
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Elemen baru untuk navigasi menu
    const mainMenu = document.getElementById('main-menu');
    const kalkulatorUtama = document.getElementById('kalkulator-utama');
    const btnMenuSyarat = document.getElementById('btn-menu-syarat');
    const btnMenuKalkulator = document.getElementById('btn-menu-kalkulator');
    const btnMenuPangkat = document.getElementById('btn-menu-pangkat');
    const btnKembali = document.getElementById('btn-kembali');

    // Elemen untuk semua modal (pop-up)
    const modalHasil = document.getElementById('modal-hasil');
    const modalSyarat = document.getElementById('modal-syarat'); // diganti dari modal-info
    const modalDonasi = document.getElementById('modal-donasi');


    // ================================================================
    //             LOGIKA NAVIGASI MENU
    // ================================================================
    function showKalkulator() {
        mainMenu.classList.add('hidden');
        kalkulatorUtama.classList.remove('hidden');
    }
    function showMainMenu() {
        mainMenu.classList.remove('hidden');
        kalkulatorUtama.classList.add('hidden');
    }
    // Pastikan elemen ada sebelum menambahkan event listener
    if (btnMenuKalkulator) btnMenuKalkulator.addEventListener('click', showKalkulator);
    if (btnKembali) btnKembali.addEventListener('click', showMainMenu);


    // ================================================================
    //             LOGIKA DARK MODE (Kode Anda dipertahankan)
    // ================================================================
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


    // ================================================================
    // KONTROL UNTUK SEMUA POP-UP (MODAL) (Kode Anda dipertahankan & ditambah)
    // ================================================================
    // --- Modal untuk Hasil Perhitungan ---
    if (modalHasil) {
        const closeHasilBtn = modalHasil.querySelector('.modal-close-btn');
        window.openModalHasil = () => modalHasil.classList.add('active');
        const closeModalHasil = () => modalHasil.classList.remove('active');
        if(closeHasilBtn) closeHasilBtn.addEventListener('click', closeModalHasil);
        modalHasil.addEventListener('click', (event) => { if (event.target === modalHasil) closeModalHasil(); });
    }
    
    // --- Modal untuk Info Syarat (BARU) ---
    if(modalSyarat) {
        const closeSyaratBtn = modalSyarat.querySelector('.modal-close-btn');
        const openModalSyarat = () => modalSyarat.classList.add('active');
        const closeModalSyarat = () => modalSyarat.classList.remove('active');
        if(btnMenuSyarat) btnMenuSyarat.addEventListener('click', openModalSyarat);
        if(closeSyaratBtn) closeSyaratBtn.addEventListener('click', closeModalSyarat);
        modalSyarat.addEventListener('click', (event) => { if (event.target === modalSyarat) closeModalSyarat(); });
    }

    // --- Modal untuk Donasi (Kode Anda dipertahankan) ---
    if(modalDonasi) {
        const btnDonasiQris = document.getElementById('btn-donasi-qris');
        const closeDonasiBtn = modalDonasi.querySelector('.modal-close-btn');
        const openModalDonasi = () => modalDonasi.classList.add('active');
        const closeModalDonasi = () => modalDonasi.classList.remove('active');
        if(btnDonasiQris) btnDonasiQris.addEventListener('click', openModalDonasi);
        if(closeDonasiBtn) closeDonasiBtn.addEventListener('click', closeModalDonasi);
        modalDonasi.addEventListener('click', (event) => { if (event.target === modalDonasi) closeModalDonasi(); });
    }


    // ================================================================
    //      LOGIKA FORM KALKULATOR (Semua kode Anda dipertahankan)
    // ================================================================
    const jenjangSelect = document.getElementById('jenjang');
    const pangkatSelect = document.getElementById('pangkat');
    const riwayatContainer = document.getElementById('riwayat-kinerja-container');
    let tahunCounter = new Date().getFullYear();

    if (jenjangSelect) {
        updatePangkatOptions();
        jenjangSelect.addEventListener('change', updatePangkatOptions);
    }

    function updatePangkatOptions() {
        const jenjangTerpilih = jenjangSelect.value;
        const aturan = ATURAN_JABATAN[jenjangTerpilih];
        pangkatSelect.innerHTML = '';
        if (aturan && aturan.pangkat) {
            for (const pangkat in aturan.pangkat) {
                const option = document.createElement('option');
                option.value = pangkat;
                option.textContent = `Pangkat ${pangkat}`;
                pangkatSelect.appendChild(option);
            }
        }
    }

    function tambahPeriodeInput() {
        const baris = document.createElement('div');
        baris.className = 'baris-periode';
        const inputTahun = document.createElement('input');
        inputTahun.type = 'number';
        inputTahun.className = 'input-tahun';
        inputTahun.value = tahunCounter;
        tahunCounter++;
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
        hapusBtn.onclick = () => {
             baris.remove();
             if (riwayatContainer.childElementCount === 0) {
                 tahunCounter = new Date().getFullYear();
             }
        };
        baris.append(inputTahun, selectPeriode, selectPredikat, hapusBtn);
        riwayatContainer.appendChild(baris);
    }

    const tambahPeriodeBtn = document.getElementById('tambah-periode');
    if (tambahPeriodeBtn) {
        tambahPeriodeBtn.addEventListener('click', tambahPeriodeInput);
    }

    const formSimulasi = document.getElementById('form-simulasi');
    if(formSimulasi) {
        formSimulasi.addEventListener('submit', function(e) {
            e.preventDefault();
            const jenjangDipilih = jenjangSelect.value;
            const pangkatDipilih = pangkatSelect.value;
            const akIntegrasi = parseFloat(document.getElementById('ak-integrasi').value) || 0;
            const data = {
                jenjang: jenjangDipilih, pangkat: pangkatDipilih,
                akMinimalWajib: ATURAN_JABATAN[jenjangDipilih].pangkat[pangkatDipilih].akKumulatif,
                akIntegrasi: akIntegrasi,
                ijazahBaru: document.getElementById('ijazah-baru').checked,
                riwayatKinerja: Array.from(document.querySelectorAll('#riwayat-kinerja-container .baris-periode')).map(baris => ({
                    tahun: parseInt(baris.querySelector('.input-tahun').value),
                    bulan: parseInt(baris.querySelector('.input-periode').value),
                    predikat: baris.querySelector('.input-predikat').value
                }))
            };
            const hasil = hitungSimulasiKarir(data);
            renderHasilSimulasi(hasil);
        });
    }

    // Ganti fungsi renderHasilSimulasi yang lama dengan yang ini

function renderHasilSimulasi(hasil) {
    const modalOutput = document.getElementById('modal-output');
    if (!modalOutput) return;

    if (hasil.error) {
        modalOutput.innerHTML = `<p style="color: red;">Error: ${hasil.error}</p>`;
    } else {
        const formatNumber = (num) => parseFloat(num.toFixed(2));
        
        // Logika untuk Analisis Kenaikan Jabatan (TETAP ADA)
        let htmlJenjang = '<h4>Analisis Kenaikan Jabatan</h4>';
        if (hasil.kebutuhanAkJenjang !== null) {
            const kekuranganJenjang = hasil.kebutuhanAkJenjang - hasil.akBaruTerkumpul;
             htmlJenjang += `
                <p>Target: <strong>Naik ke ${hasil.targetJenjang}</strong></p>
                <p>Syarat AK Tambahan: <strong>${formatNumber(hasil.kebutuhanAkJenjang)}</strong></p>
                <div class="notif ${kekuranganJenjang <= 0 ? 'sukses' : 'info'}">
                    Kekurangan AK: <strong>${formatNumber(kekuranganJenjang > 0 ? kekuranganJenjang : 0)}</strong><br>
                    Status: ${kekuranganJenjang <= 0 ? 'Memenuhi Syarat' : 'Belum Memenuhi Syarat'}
                </div>
            `;
            if (hasil.estimasi.pesan) {
                htmlJenjang += `<div class="notif estimasi">${hasil.estimasi.pesan}</div>`;
            }
        } else {
            htmlJenjang += '<p>Anda sudah berada di jenjang jabatan puncak.</p>';
        }

        // Struktur HTML utama yang sudah disederhanakan
        let html = `
            <h2>Analisis Simulasi Karir</h2>
            <div class="rincian-ak">
                <p>+ AK Integrasi (2022): <strong>${formatNumber(hasil.akIntegrasi)}</strong></p>
                <p>+ AK dari Ijazah Baru: <strong>${formatNumber(hasil.akDariIjazah)}</strong></p>
                <p>+ AK dari Konversi (Kinerja): <strong>${formatNumber(hasil.akDariKonversi)}</strong></p>
                <hr>
                <p><strong>Total AK Baru Terkumpul: ${formatNumber(hasil.akBaruTerkumpul)}</strong></p>
            </div>
            
            <div class="kartu-analisis">
                ${htmlJenjang}
            </div>

            <p style="font-size: 0.8em; color: var(--text-light); margin-top: 15px; text-align: center;">(Total Angka Kredit Kumulatif Anda sekarang adalah ${formatNumber(hasil.totalAkKumulatif)})</p>
        `;
        modalOutput.innerHTML = html;
    }
    window.openModalHasil();
}
});