document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen & Variabel Global ---
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
    const formSimulasi = document.getElementById('form-simulasi');
    const btnReset = document.getElementById('btn-reset-jenjang');
    const tambahPeriodeBtn = document.getElementById('tambah-periode');
    const lihatKonversiBtn = document.getElementById('lihat-konversi');
    const LOCAL_STORAGE_KEY = 'simulasiKarirDosenJenjang';

    // Elemen Modal Tambah Periode
    const modalTambahPeriode = document.getElementById('modal-tambah-periode');
    const btnSimpanPeriode = document.getElementById('btn-simpan-periode');
    const closeModalTambahPeriodeBtn = modalTambahPeriode.querySelector('.modal-close-btn');

    // Elemen Modal Lihat Konversi
    const modalLihatKonversi = document.getElementById('modal-lihat-konversi');
    const daftarKonversiContainer = document.getElementById('daftar-konversi-container');
    const closeModalLihatKonversiBtn = modalLihatKonversi.querySelector('.modal-close-btn');

    // Elemen Modal Hasil Utama
    const closeModalHasilBtn = modalHasil.querySelector('.modal-close-btn');
    // Elemen Modal Notifikasi Baru
    const modalNotifikasi = document.getElementById('modal-notifikasi');
    const notifJudul = document.getElementById('notif-judul');
    const notifPesan = document.getElementById('notif-pesan');
    const notifBtnOk = document.getElementById('notif-btn-ok');
    
    // --- State Management ---
    let riwayatKinerjaList = [];

    // --- Fungsi Navigasi & UI ---
    function showKalkulator() {
        mainMenu.classList.add('hidden');
        kalkulatorUtama.classList.remove('hidden');
        if (!localStorage.getItem(LOCAL_STORAGE_KEY) && !tanggalKenaikanInput.value) {
            const pesanAwal = `<h2>Selamat Datang!</h2><div class="notif info"><strong>Langkah Pertama:</strong><br>Silakan isi 'Tanggal Kenaikan Jabatan Terakhir' untuk memulai.</div>`;
            const modalOutput = document.getElementById('modal-output');
            if (modalOutput) { modalOutput.innerHTML = pesanAwal; openModalHasil(); }
            tanggalKenaikanInput.classList.add('input-warning');
        }
    }
    function showMainMenu() { mainMenu.classList.remove('hidden'); kalkulatorUtama.classList.add('hidden'); }
    function openModalHasil() { if (modalHasil) modalHasil.classList.add('active'); }
    function closeModalHasil() { 
        if (modalHasil) modalHasil.classList.remove('active'); 
        modalHasil.classList.remove('modal-prioritas'); // <-- Tambahkan baris ini
    }
        // --- FUNGSI NOTIFIKASI BARU ---
    function showNotifikasi(judul, pesan) {
        if (notifJudul) notifJudul.textContent = judul;
        if (notifPesan) notifPesan.textContent = pesan;
        if (modalNotifikasi) modalNotifikasi.classList.add('active');
    }
    function closeNotifikasi() {
        if (modalNotifikasi) modalNotifikasi.classList.remove('active');
    }

    // --- Fungsi Manajemen Tombol ---
    function updateTombolHitungState() {
        const dataTersimpan = localStorage.getItem(LOCAL_STORAGE_KEY);
        const btnHitung = formSimulasi.querySelector('button[type="submit"]');
        if (!btnHitung) return;
        if (dataTersimpan) {
            btnHitung.textContent = 'Lihat Perhitungan Tersimpan';
            btnHitung.classList.add('btn-saved');
        } else {
            btnHitung.textContent = 'Hitung Simulasi Karir';
            btnHitung.classList.remove('btn-saved');
        }
    }

    function updateTombolLihatKonversi() {
        if (riwayatKinerjaList.length > 0) {
            lihatKonversiBtn.classList.remove('hidden');
            lihatKonversiBtn.textContent = `Lihat Konversi (${riwayatKinerjaList.length} Periode)`;
        } else {
            lihatKonversiBtn.classList.add('hidden');
        }
    }

    // --- Fungsi Logika Modal ---
    function renderDaftarKonversi() {
    daftarKonversiContainer.innerHTML = ''; // Kosongkan dulu
    if (riwayatKinerjaList.length === 0) {
        daftarKonversiContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">Belum ada periode kinerja yang ditambahkan.</p>';
        return;
    }

    // Buat struktur tabel
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'kinerja-table-wrapper';
    
    const table = document.createElement('table');
    table.className = 'kinerja-table';

    // Buat Header Tabel
    table.innerHTML = `
        <thead>
            <tr>
                <th>Tahun</th>
                <th>Periode</th>
                <th>Nilai</th>
                <th style="width: 40px;"></th>
            </tr>
        </thead>
    `;

    // Buat Body Tabel dan isi dengan data
    const tbody = document.createElement('tbody');
    riwayatKinerjaList.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        const periodeMap = { "12": "Tahunan", "6": "Semester", "3": "Triwulanan", "1": "Bulanan" };
        const periodeText = periodeMap[item.periode] || 'Tahunan';

        // Buat sel untuk data
        const tdTahun = document.createElement('td');
        tdTahun.textContent = item.tahun;
        const tdPeriode = document.createElement('td');
        tdPeriode.textContent = periodeText;
        const tdPredikat = document.createElement('td');
        tdPredikat.textContent = item.predikat;

        // Buat sel untuk tombol hapus
        const tdHapus = document.createElement('td');
        tdHapus.style.textAlign = 'center';
        const hapusBtn = document.createElement('button');
        hapusBtn.innerHTML = '&times;'; // Karakter 'x' yang lebih bagus
        hapusBtn.className = 'btn-hapus-tabel';
        hapusBtn.title = 'Hapus Periode'; // Tooltip
        hapusBtn.onclick = () => {
            riwayatKinerjaList.splice(index, 1);
            renderDaftarKonversi();
            updateTombolLihatKonversi();
        };
        
        tdHapus.appendChild(hapusBtn);

        // Gabungkan semua sel ke dalam baris
        tr.append(tdTahun, tdPeriode, tdPredikat, tdHapus);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    daftarKonversiContainer.appendChild(tableWrapper);
}

// --- FUNGSI DENGAN LOGIKA NOTIFIKASI YANG DIPERBARUI ---
    function openTambahPeriodeModal() {
        const tmtValue = tanggalKenaikanInput.value;
        if (!tmtValue) {
            showNotifikasi('Peringatan', "Silakan isi 'Tanggal Kenaikan Jabatan Terakhir' terlebih dahulu.");
            tanggalKenaikanInput.classList.add('input-warning');
            return;
        }
        tanggalKenaikanInput.classList.remove('input-warning');
        
        const tahunTmt = parseInt(tmtValue.split('/')[2]);
        const tahunTerakhir = riwayatKinerjaList.length > 0 ? Math.max(...riwayatKinerjaList.map(item => parseInt(item.tahun))) : tahunTmt - 1;
        document.getElementById('input-tahun-modal').value = tahunTerakhir + 1;
        modalTambahPeriode.classList.add('active');
    }

    function closeTambahPeriodeModal() { modalTambahPeriode.classList.remove('active'); }

    function openLihatKonversiModal() {
        renderDaftarKonversi();
        modalLihatKonversi.classList.add('active');
    }
    function closeLihatKonversiModal() { modalLihatKonversi.classList.remove('active'); }

    function simpanPeriodeDariModal() {
        const tmtValue = tanggalKenaikanInput.value;
        if (!tmtValue) {
            showNotifikasi('Peringatan', 'Silakan isi "Tanggal Kenaikan Jabatan Terakhir" terlebih dahulu.');
            return;
        }
        
        const tahunTmt = parseInt(tmtValue.split('/')[2]);
        const targetTahun = parseInt(document.getElementById('input-tahun-modal').value);
        const tahunSekarang = 2025; // Sesuai konteks

        if (!targetTahun || targetTahun.toString().length !== 4) {
            showNotifikasi('Input Tidak Valid', 'Tahun harus diisi dengan format 4 digit (contoh: 2025).');
            return;
        }
        if (targetTahun > tahunSekarang) {
            showNotifikasi('Input Tidak Valid', `Anda tidak dapat menambahkan kinerja untuk masa depan (tahun ${targetTahun}). Batas input adalah tahun ${tahunSekarang}.`);
            return;
        }
        if (targetTahun < tahunTmt) {
            showNotifikasi('Input Tidak Valid', `Anda tidak dapat menambahkan kinerja dari tahun ${targetTahun} karena sebelum tahun TMT Anda (${tahunTmt}).`);
            return;
        }

        const periodeBaruValue = document.getElementById('select-periode-modal').value;
        const periodeDiTahunTarget = riwayatKinerjaList.filter(item => parseInt(item.tahun) === targetTahun).map(item => parseInt(item.periode));

        if (periodeDiTahunTarget.includes(12) || (periodeBaruValue === "12" && periodeDiTahunTarget.length > 0)) {
            showNotifikasi('Input Ditolak', `Untuk tahun ${targetTahun}, Anda tidak bisa mencampur periode Tahunan dengan periode lain.`);
            return;
        }
        
        const totalBulanTersimpan = periodeDiTahunTarget.reduce((sum, bulan) => sum + bulan, 0);
        const totalBulanSetelahDitambah = totalBulanTersimpan + parseInt(periodeBaruValue);

        if (totalBulanSetelahDitambah > 12) {
            showNotifikasi('Batas Input Tercapai', `Input ditolak. Total periode untuk tahun ${targetTahun} akan menjadi ${totalBulanSetelahDitambah} bulan, melebihi batas 12 bulan.`);
            return;
        }

        const newItem = {
            tahun: targetTahun.toString(),
            periode: periodeBaruValue,
            predikat: document.getElementById('select-predikat-modal').value
        };
        riwayatKinerjaList.push(newItem);
        riwayatKinerjaList.sort((a, b) => a.tahun - b.tahun);
        updateTombolLihatKonversi();
        closeTambahPeriodeModal();
    }

    // --- Fungsi Penyimpanan, Pemuatan, Reset ---
    function muatData() {
        const dataTersimpan = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (dataTersimpan) {
            const data = JSON.parse(dataTersimpan);
            document.getElementById('nama-dosen').value = data.nama || '';
            jenjangSelect.value = data.jenjang || 'Asisten Ahli';
            updatePangkatOptions();
            pangkatSelect.value = data.pangkat || '';
            tanggalKenaikanInput.value = data.tanggalKenaikan || '';
            document.getElementById('ijazah-baru').checked = data.ijazahBaru || false;
            document.getElementById('ak-integrasi').value = data.akIntegrasi || '0';
            riwayatKinerjaList = data.riwayat || [];
            updateTombolLihatKonversi();
        }
    }

    function simpanData() {
        const dataUntukDisimpan = {
            nama: document.getElementById('nama-dosen').value,
            jenjang: jenjangSelect.value,
            pangkat: pangkatSelect.value,
            tanggalKenaikan: tanggalKenaikanInput.value,
            ijazahBaru: document.getElementById('ijazah-baru').checked,
            akIntegrasi: document.getElementById('ak-integrasi').value,
            riwayat: riwayatKinerjaList
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataUntukDisimpan));
    }

    function resetData() {
        if (confirm('Apakah Anda yakin ingin menghapus data tersimpan?')) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            location.reload();
        }
    }

    // --- Fungsi Bantuan ---
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
    
    // --- Fungsi Tampilan Hasil ---
    function renderHasilSimulasi(hasil) {
        const modalOutput = document.getElementById('modal-output');
        if (!modalOutput) return;
        if (hasil.error) {
            modalOutput.innerHTML = `<p style="color: red;">Error: ${hasil.error}</p>`;
        } else {
            const formatNumber = (num) => parseFloat(num.toFixed(3));
            let judulModal = `<h2>Analisis Simulasi Karir</h2>`;
            if (hasil.nama && hasil.nama.trim() !== '') {
                judulModal = `<h2>Analisis Karir untuk ${hasil.nama}</h2>`;
            }
            let htmlJenjang = '<h4>Analisis Kenaikan Jabatan</h4>';
            if (hasil.kebutuhanAkJenjang !== null) {
                const kekuranganJenjang = hasil.kebutuhanAkJenjang - hasil.akBaruTerkumpul;
                const progressValue = Math.min(100, Math.max(0, (hasil.akBaruTerkumpul / hasil.kebutuhanAkJenjang) * 100));
                const progressBarHTML = `<div style="margin-top: 10px; margin-bottom: 15px;"><div style="display: flex; justify-content: space-between; font-size: 0.8em; margin-bottom: 5px;"><span>Progres: <strong>${formatNumber(hasil.akBaruTerkumpul)} / ${hasil.kebutuhanAkJenjang} AK</strong></span><span><strong>${progressValue.toFixed(1)}%</strong></span></div><progress value="${progressValue}" max="100" style="width: 100%; height: 12px;"></progress></div>`;
                htmlJenjang += `<p>Target: <strong>Naik ke ${hasil.targetJenjang}</strong></p>`;
                htmlJenjang += progressBarHTML;
                htmlJenjang += `<div class="notif ${kekuranganJenjang <= 0 ? 'sukses' : 'info'}">Kekurangan AK: <strong>${formatNumber(kekuranganJenjang > 0 ? kekuranganJenjang : 0)}</strong><br>Status: ${kekuranganJenjang <= 0 ? 'Memenuhi Syarat' : 'Belum Memenuhi Syarat'}</div>`;
                if (hasil.analisisSkenario && hasil.analisisSkenario.pesan) { htmlJenjang += `<div class="notif info" style="margin-top: 10px;">${hasil.analisisSkenario.pesan}</div>`; }
                if (hasil.estimasi.pesan) { htmlJenjang += `<div class="notif estimasi">${hasil.estimasi.pesan}</div>`; }
            } else {
                htmlJenjang += '<p>Anda sudah berada di jenjang jabatan puncak.</p>';
            }
            let html = `${judulModal}<div class="rincian-ak"><p>+ AK Integrasi: <strong>${formatNumber(hasil.akIntegrasi)}</strong></p><p>+ AK dari Ijazah Baru: <strong>${formatNumber(hasil.akDariIjazah)}</strong></p><p>+ AK dari Konversi (Kinerja): <strong>${formatNumber(hasil.akDariKonversi)}</strong></p>`;
            if (hasil.rincianKonversi && hasil.rincianKonversi.length > 0) {
                html += `<ul style="font-size: 0.8em; margin-left: 20px; color: var(--text-light); list-style-type: '▸ '; padding-left: 15px; margin-top: 5px;">`;
                hasil.rincianKonversi.forEach(rincian => { html += `<li>${rincian}</li>`; });
                html += `</ul>`;
            }
            html += `<hr><p><strong>Total AK Baru Terkumpul: ${formatNumber(hasil.akBaruTerkumpul)}</strong></p></div><div class="kartu-analisis">${htmlJenjang}</div><p style="font-size: 0.8em; color: var(--text-light); margin-top: 15px; text-align: center;">(Total Angka Kredit Kumulatif Anda sekarang adalah ${formatNumber(hasil.totalAkKumulatif)})</p>`;
            modalOutput.innerHTML = html;
        }
        openModalHasil();
    }
    
    // --- Inisialisasi & Event Listeners ---
    muatData();
    updatePangkatOptions();
    updateTombolHitungState();
    
    if (btnReset) btnReset.addEventListener('click', resetData);
    if (btnMenuKalkulator) btnMenuKalkulator.addEventListener('click', showKalkulator);
    if (btnKembali) btnKembali.addEventListener('click', showMainMenu);
    if (notifBtnOk) notifBtnOk.addEventListener('click', closeNotifikasi);
    if (modalNotifikasi) modalNotifikasi.addEventListener('click', (e) => { if (e.target === modalNotifikasi) closeNotifikasi(); });
    
    if (tambahPeriodeBtn) tambahPeriodeBtn.addEventListener('click', openTambahPeriodeModal);
    if (lihatKonversiBtn) lihatKonversiBtn.addEventListener('click', openLihatKonversiModal);
    if (btnSimpanPeriode) btnSimpanPeriode.addEventListener('click', simpanPeriodeDariModal);
    
    if (closeModalTambahPeriodeBtn) closeModalTambahPeriodeBtn.addEventListener('click', closeTambahPeriodeModal);
    if (modalTambahPeriode) modalTambahPeriode.addEventListener('click', (e) => { if (e.target === modalTambahPeriode) closeTambahPeriodeModal(); });
    
    if (closeModalLihatKonversiBtn) closeModalLihatKonversiBtn.addEventListener('click', closeLihatKonversiModal);
    if (modalLihatKonversi) modalLihatKonversi.addEventListener('click', (e) => { if (e.target === modalLihatKonversi) closeLihatKonversiModal(); });

    if (closeModalHasilBtn) closeModalHasilBtn.addEventListener('click', closeModalHasil);
    if (modalHasil) modalHasil.addEventListener('click', (e) => { if (e.target === modalHasil) closeModalHasil(); });
    
    if(darkModeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') { body.classList.add('dark-mode'); darkModeToggle.innerHTML = '☀️'; }
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) { localStorage.setItem('theme', 'dark'); darkModeToggle.innerHTML = '☀️'; } 
            else { localStorage.setItem('theme', 'light'); darkModeToggle.innerHTML = '🌙'; }
        });
    }

    if (tanggalKenaikanInput) { new Datepicker(tanggalKenaikanInput, { format: 'dd/mm/yyyy', autohide: true, buttonClass: 'btn' }); }
    if (jenjangSelect) jenjangSelect.addEventListener('change', updatePangkatOptions);

    formSimulasi.addEventListener('submit', function(e) {
        e.preventDefault();
        const tanggalKenaikanValue = tanggalKenaikanInput.value;
        if (!tanggalKenaikanValue) {
            const pesanError = `<h2>Peringatan</h2><div class="notif info"><strong>Input Tidak Lengkap.</strong><br>Silakan isi 'Tanggal Kenaikan Jabatan Terakhir' terlebih dahulu.</div>`;
            const modalOutput = document.getElementById('modal-output');
            if (modalOutput) { modalOutput.innerHTML = pesanError; openModalHasil(); }
            tanggalKenaikanInput.classList.add('input-warning');
            return;
        }
        tanggalKenaikanInput.classList.remove('input-warning');
        
        const [day, month, year] = tanggalKenaikanValue.split('/');
        const tahunKenaikan = parseInt(year);
        const bulanKenaikan = parseInt(month);

        const riwayatKinerjaData = riwayatKinerjaList.map(item => {
            const tahunKinerja = parseInt(item.tahun);
            let bulanYangDihitung = parseInt(item.periode);
            if (tahunKinerja === tahunKenaikan) {
                bulanYangDihitung = 12 - bulanKenaikan;
            }
            return { tahun: tahunKinerja, bulan: bulanYangDihitung, predikat: item.predikat };
        });

        const data = {
            nama: document.getElementById('nama-dosen').value,
            jenjang: jenjangSelect.value,
            pangkat: pangkatSelect.value,
            akMinimalWajib: ATURAN_JABATAN[jenjangSelect.value].pangkat[pangkatSelect.value].akKumulatif,
            akIntegrasi: parseFloat(document.getElementById('ak-integrasi').value) || 0,
            ijazahBaru: document.getElementById('ijazah-baru').checked,
            riwayatKinerja: riwayatKinerjaData
        };
        
        simpanData();
        const hasil = hitungSimulasiKarir(data);
        renderHasilSimulasi(hasil);
        updateTombolHitungState();
    });
});