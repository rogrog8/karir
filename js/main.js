document.addEventListener('DOMContentLoaded', function() {
    // ================================================================
    //             DEKLARASI ELEMEN UTAMA
    // ================================================================
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const mainMenu = document.getElementById('main-menu');
    const kalkulatorUtama = document.getElementById('kalkulator-utama');
    const btnMenuKalkulator = document.getElementById('btn-menu-kalkulator');
    const btnKembali = document.getElementById('btn-kembali');
    const modalHasil = document.getElementById('modal-hasil');
    const tanggalKenaikanInput = document.getElementById('tanggal-kenaikan');
    const jenjangSelect = document.getElementById('jenjang');
    const pangkatSelect = document.getElementById('pangkat');
    const riwayatContainer = document.getElementById('riwayat-kinerja-container');
    const tambahPeriodeBtn = document.getElementById('tambah-periode');
    const formSimulasi = document.getElementById('form-simulasi');
    let tahunCounter = new Date().getFullYear();

    // ================================================================
    //             DEKLARASI FUNGSI-FUNGSI UTAMA
    // ================================================================

    function showKalkulator() {
    mainMenu.classList.add('hidden');
    kalkulatorUtama.classList.remove('hidden');

    // --- LOGIKA BARU: Tampilkan notifikasi saat halaman muncul ---
    if (!tanggalKenaikanInput.value) {
        const pesanAwal = `
            <h2>Selamat Datang!</h2>
            <div class="notif info">
                <strong>Langkah Pertama:</strong><br>
                Silakan isi 'Tanggal Kenaikan Jabatan Terakhir' untuk memulai simulasi.
            </div>
        `;
        const modalOutput = document.getElementById('modal-output');
        if (modalOutput) {
            modalOutput.innerHTML = pesanAwal;
            openModalHasil();
        }
        tanggalKenaikanInput.classList.add('input-warning');
    }
    }

    function showMainMenu() {
        mainMenu.classList.remove('hidden');
        kalkulatorUtama.classList.add('hidden');
    }

    function openModalHasil() {
        if (modalHasil) modalHasil.classList.add('active');
    }

    function closeModalHasil() {
        if (modalHasil) modalHasil.classList.remove('active');
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
        const tanggalKenaikanValue = tanggalKenaikanInput.value;
        if (!tanggalKenaikanValue) {
            const pesanError = `<h2>Peringatan</h2><div class="notif info"><strong>Input Tidak Lengkap.</strong><br>Silakan isi 'Tanggal Kenaikan Jabatan Terakhir' terlebih dahulu.</div>`;
            const modalOutput = document.getElementById('modal-output');
            if (modalOutput) {
                modalOutput.innerHTML = pesanError;
                openModalHasil();
            }
            tanggalKenaikanInput.classList.add('input-warning');
            return;
        }
        tanggalKenaikanInput.classList.remove('input-warning');
        const [day, month, year] = tanggalKenaikanValue.split('/');
        const tahunKenaikan = parseInt(year);
        const tahunTerakhirDiinput = riwayatContainer.childElementCount > 0 ? parseInt(riwayatContainer.lastChild.querySelector('.input-tahun').value) : tahunKenaikan - 1;
        const tahunBerikutnya = tahunTerakhirDiinput + 1;
        if (tahunBerikutnya < tahunKenaikan) {
            const pesanError = `<h2>Peringatan</h2><div class="notif info">Anda tidak bisa menambahkan kinerja dari tahun ${tahunBerikutnya} karena sebelum tahun kenaikan jabatan Anda (${tahunKenaikan}).</div>`;
            const modalOutput = document.getElementById('modal-output');
             if (modalOutput) {
                modalOutput.innerHTML = pesanError;
                openModalHasil();
            }
            return;
        }
        const baris = document.createElement('div'); baris.className = 'baris-periode';
        const inputTahun = document.createElement('input'); inputTahun.type = 'number'; inputTahun.className = 'input-tahun';
        inputTahun.value = riwayatContainer.childElementCount === 0 ? tahunKenaikan : tahunBerikutnya;
        const opsiPeriode = { "Bulanan": 1, "Triwulanan": 3, "Semester": 6, "Tahunan": 12 };
        const selectPeriode = document.createElement('select'); selectPeriode.className = 'input-periode';
        for (const [nama, bulan] of Object.entries(opsiPeriode)) { const option = document.createElement('option'); option.value = bulan; option.textContent = nama; selectPeriode.appendChild(option); }
        const opsiPredikat = ["Sangat Baik", "Baik", "Butuh Perbaikan", "Kurang", "Sangat Kurang"];
        const selectPredikat = document.createElement('select'); selectPredikat.className = 'input-predikat';
        opsiPredikat.forEach(opt => { const option = document.createElement('option'); option.value = opt; option.textContent = opt; selectPredikat.appendChild(option); });
        const hapusBtn = document.createElement('button'); hapusBtn.textContent = '×'; hapusBtn.type = 'button'; hapusBtn.className = 'btn-hapus';
        hapusBtn.onclick = () => baris.remove();
        baris.append(inputTahun, selectPeriode, selectPredikat, hapusBtn);
        riwayatContainer.appendChild(baris);
    }

    function renderHasilSimulasi(hasil) {
    const modalOutput = document.getElementById('modal-output');
    if (!modalOutput) return;
    if (hasil.error) {
        modalOutput.innerHTML = `<p style="color: red;">Error: ${hasil.error}</p>`;
    } else {
        const formatNumber = (num) => parseFloat(num.toFixed(3));
        let htmlJenjang = '<h4>Analisis Kenaikan Jabatan</h4>';

        // Logika utama dimulai di sini
        if (hasil.kebutuhanAkJenjang !== null) {
            const kekuranganJenjang = hasil.kebutuhanAkJenjang - hasil.akBaruTerkumpul;
            
            // Menampilkan Target, Syarat AK, dan Status Kekurangan (kode Anda yang sudah ada)
            htmlJenjang += `<p>Target: <strong>Naik ke ${hasil.targetJenjang}</strong></p><p>Syarat AK Tambahan: <strong>${formatNumber(hasil.kebutuhanAkJenjang)}</strong></p><div class="notif ${kekuranganJenjang <= 0 ? 'sukses' : 'info'}">Kekurangan AK: <strong>${formatNumber(kekuranganJenjang > 0 ? kekuranganJenjang : 0)}</strong><br>Status: ${kekuranganJenjang <= 0 ? 'Memenuhi Syarat' : 'Belum Memenuhi Syarat'}</div>`;

            // ================================================================
            // ▼▼▼ KODE BARU UNTUK ANALISIS SKENARIO DITAMBAHKAN DI SINI ▼▼▼
            // ================================================================
            if (hasil.analisisSkenario && hasil.analisisSkenario.pesan) {
                htmlJenjang += `<div class="notif info" style="margin-top: 10px;">${hasil.analisisSkenario.pesan}</div>`;
            }
            
            // Menampilkan estimasi waktu kenaikan (kode Anda yang sudah ada)
            if (hasil.estimasi.pesan) { 
                htmlJenjang += `<div class="notif estimasi">${hasil.estimasi.pesan}</div>`; 
            }

        } else {
            // Ini hanya berjalan jika sudah di jenjang puncak
            htmlJenjang += '<p>Anda sudah berada di jenjang jabatan puncak.</p>';
        }

        // Bagian ini menyusun sisa tampilan modal (kode Anda yang sudah ada)
        let html = `<h2>Analisis Simulasi Karir</h2><div class="rincian-ak"><p>+ AK Integrasi: <strong>${formatNumber(hasil.akIntegrasi)}</strong></p><p>+ AK dari Ijazah Baru: <strong>${formatNumber(hasil.akDariIjazah)}</strong></p><p>+ AK dari Konversi (Kinerja): <strong>${formatNumber(hasil.akDariKonversi)}</strong></p>`;
        
        if (hasil.rincianKonversi && hasil.rincianKonversi.length > 0) {
            html += `<ul style="font-size: 0.8em; margin-left: 20px; color: var(--text-light); list-style-type: '▸ '; padding-left: 15px; margin-top: 5px;">`;
            hasil.rincianKonversi.forEach(rincian => {
                html += `<li>${rincian}</li>`;
            });
            html += `</ul>`;
        }

        html += `<hr><p><strong>Total AK Baru Terkumpul: ${formatNumber(hasil.akBaruTerkumpul)}</strong></p></div><div class="kartu-analisis">${htmlJenjang}</div><p style="font-size: 0.8em; color: var(--text-light); margin-top: 15px; text-align: center;">(Total Angka Kredit Kumulatif Anda sekarang adalah ${formatNumber(hasil.totalAkKumulatif)})</p>`;
        
        modalOutput.innerHTML = html;
    }
    openModalHasil();
}

    // ================================================================
    //             INISIALISASI & EVENT LISTENERS
    // ================================================================
    // --- Navigasi & Dark Mode ---
    if (btnMenuKalkulator) btnMenuKalkulator.addEventListener('click', showKalkulator);
    if (btnKembali) btnKembali.addEventListener('click', showMainMenu);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') { body.classList.add('dark-mode'); darkModeToggle.innerHTML = '☀️'; }
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) { localStorage.setItem('theme', 'dark'); darkModeToggle.innerHTML = '☀️'; } 
        else { localStorage.setItem('theme', 'light'); darkModeToggle.innerHTML = '🌙'; }
    });

    // --- Datepicker ---
    if (tanggalKenaikanInput) { new Datepicker(tanggalKenaikanInput, { format: 'dd/mm/yyyy', autohide: true, buttonClass: 'btn' }); }

    // --- Kontrol Modal ---
    if (modalHasil) {
        const closeHasilBtn = modalHasil.querySelector('.modal-close-btn');
        if(closeHasilBtn) closeHasilBtn.addEventListener('click', closeModalHasil);
        modalHasil.addEventListener('click', (event) => { if (event.target === modalHasil) closeModalHasil(); });
    }

    // --- Kontrol Form ---
    if (jenjangSelect) {
        updatePangkatOptions();
        jenjangSelect.addEventListener('change', updatePangkatOptions);
    }
    if (tambahPeriodeBtn) {
        tambahPeriodeBtn.addEventListener('click', tambahPeriodeInput);
    }
    if (formSimulasi) {
        formSimulasi.addEventListener('submit', function(e) {
            e.preventDefault();
            const jenjangDipilih = jenjangSelect.value;
            const pangkatDipilih = pangkatSelect.value;
            const akIntegrasi = parseFloat(document.getElementById('ak-integrasi').value) || 0;
            const tanggalKenaikanValue = document.getElementById('tanggal-kenaikan').value;
            if (!tanggalKenaikanValue) {
                const pesanError = `<h2>Peringatan</h2><div class="notif info"><strong>Input Tidak Lengkap.</strong><br>Silakan isi 'Tanggal Kenaikan Jabatan Terakhir' terlebih dahulu.</div>`;
                const modalOutput = document.getElementById('modal-output');
                modalOutput.innerHTML = pesanError;
                openModalHasil();
                return;
            }
            const [day, month, year] = tanggalKenaikanValue.split('/');
            const tahunKenaikan = parseInt(year);
            const bulanKenaikan = parseInt(month);
            const data = {
                jenjang: jenjangDipilih, pangkat: pangkatDipilih,
                akMinimalWajib: ATURAN_JABATAN[jenjangDipilih].pangkat[pangkatDipilih].akKumulatif,
                akIntegrasi: akIntegrasi, ijazahBaru: document.getElementById('ijazah-baru').checked,
                riwayatKinerja: Array.from(document.querySelectorAll('#riwayat-kinerja-container .baris-periode'))
                    .filter(baris => parseInt(baris.querySelector('.input-tahun').value) >= tahunKenaikan)
                    .map(baris => {
                        const tahunKinerja = parseInt(baris.querySelector('.input-tahun').value);
                        let bulanKinerja = parseInt(baris.querySelector('.input-periode').value);
                        if (tahunKinerja === tahunKenaikan) {
                            let totalPeriodeDiTahunKenaikan = 0;
                            document.querySelectorAll('#riwayat-kinerja-container .baris-periode').forEach(b => {
                                if (parseInt(b.querySelector('.input-tahun').value) === tahunKenaikan) {
                                    totalPeriodeDiTahunKenaikan += parseInt(b.querySelector('.input-periode').value);
                                }
                            });
                            const sisaBulanValid = 12 - bulanKenaikan;
                            if (totalPeriodeDiTahunKenaikan > sisaBulanValid) {
                                bulanKinerja = (sisaBulanValid / totalPeriodeDiTahunKenaikan) * bulanKinerja;
                            }
                        }
                        return { tahun: tahunKinerja, bulan: bulanKinerja, predikat: baris.querySelector('.input-predikat').value };
                    })
            };
            const hasil = hitungSimulasiKarir(data);
            renderHasilSimulasi(hasil);
        });
    }
});