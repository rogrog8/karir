document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen Global ---
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const pangkatSelect = document.getElementById('pangkat-sekarang');
    const tmtInput = document.getElementById('tmt-terakhir');
    const formPangkat = document.getElementById('form-pangkat');
    const namaDosenInput = document.getElementById('nama-dosen-pangkat');
    const btnReset = document.getElementById('btn-reset-pangkat');
    const validasiContainer = document.getElementById('validasi-jabatan');
    const validasiPertanyaan = document.getElementById('validasi-pertanyaan');
    const btnValidasiYa = document.getElementById('btn-validasi-ya');
    const btnValidasiTidak = document.getElementById('btn-validasi-tidak');
    const formKonten = document.getElementById('form-konten');
    const modalHasil = document.getElementById('modal-hasil-pangkat');
    const modalOutput = document.getElementById('modal-output-pangkat');
    const closeModalBtn = modalHasil.querySelector('.modal-close-btn');

    // Elemen Modal Baru
    const tambahPeriodeBtn = document.getElementById('tambah-periode-pangkat');
    const lihatPeriodeBtn = document.getElementById('lihat-periode-pangkat');
    const modalTambah = document.getElementById('modal-tambah-periode-pangkat');
    const btnSimpanPeriode = document.getElementById('btn-simpan-periode-pangkat');
    const modalLihat = document.getElementById('modal-lihat-periode-pangkat');
    const daftarPeriodeContainer = document.getElementById('daftar-periode-container-pangkat');
    const closeModalTambahBtn = modalTambah.querySelector('.modal-close-btn');
    const closeModalLihatBtn = modalLihat.querySelector('.modal-close-btn');

    // Elemen Modal Notifikasi
    const modalNotifikasi = document.getElementById('modal-notifikasi');
    const notifJudul = document.getElementById('notif-judul');
    const notifPesan = document.getElementById('notif-pesan');
    const notifBtnOk = document.getElementById('notif-btn-ok');
    
    // --- State & Aturan ---
    const LOCAL_STORAGE_KEY_PANGKAT = 'simulasiKarirDosenPangkat';
    let riwayatKinerjaList = [];
    const formatAngka = (num) => parseFloat(num.toFixed(3));
    const ATURAN_PANGKAT = { "III/a": { ak_kumulatif: 100, target: "III/b", butuh: 50, koefisien: 12.5 },"III/b": { ak_kumulatif: 150, target: "III/c", butuh: 50, koefisien: 12.5 },"III/c": { ak_kumulatif: 200, target: "III/d", butuh: 100, koefisien: 25 },"III/d": { ak_kumulatif: 300, target: "IV/a", butuh: 100, koefisien: 25 },"IV/a": { ak_kumulatif: 400, target: "IV/b", butuh: 150, koefisien: 37.5 },"IV/b": { ak_kumulatif: 550, target: "IV/c", butuh: 150, koefisien: 37.5 },"IV/c": { ak_kumulatif: 700, target: "IV/d", butuh: 150, koefisien: 37.5 },"IV/d": { ak_kumulatif: 850, target: "IV/e", butuh: 200, koefisien: 50 },"IV/e": { ak_kumulatif: 1050, target: null, butuh: 0, koefisien: 50 } };
    const KONVERSI_KINERJA = { "Sangat Baik": 1.50, "Baik": 1.00, "Butuh Perbaikan": 0.75, "Kurang": 0.50, "Sangat Kurang": 0.25 };
    const SYARAT_JABATAN = { "III/c": "Lektor", "IV/a": "Lektor Kepala", "IV/d": "Guru Besar" };

    // --- Fungsi UI & Notifikasi ---
    function renderHasil(html) { modalOutput.innerHTML = html; modalHasil.classList.add('active'); }
    function showNotifikasi(judul, pesan) { if (notifJudul) notifJudul.textContent = judul; if (notifPesan) notifPesan.textContent = pesan; if (modalNotifikasi) modalNotifikasi.classList.add('active'); }
    function closeNotifikasi() { if (modalNotifikasi) modalNotifikasi.classList.remove('active'); }
    function updateTombolHitungState() {
        const dataTersimpan = localStorage.getItem(LOCAL_STORAGE_KEY_PANGKAT);
        const btnHitung = formPangkat.querySelector('button[type="submit"]');
        if (!btnHitung) return;
        if (dataTersimpan) { btnHitung.textContent = 'Lihat Perhitungan Tersimpan'; btnHitung.classList.add('btn-saved'); } 
        else { btnHitung.textContent = 'Hitung Estimasi'; btnHitung.classList.remove('btn-saved'); }
    }

    // --- Fungsi Alur Pop-up ---
    function updateTombolLihatPeriode() {
        if (riwayatKinerjaList.length > 0) {
            lihatPeriodeBtn.classList.remove('hidden');
            lihatPeriodeBtn.textContent = `Lihat Periode (${riwayatKinerjaList.length})`;
        } else {
            lihatPeriodeBtn.classList.add('hidden');
        }
    }

    function renderDaftarPeriode() {
    daftarPeriodeContainer.innerHTML = ''; // Kosongkan dulu
    if (riwayatKinerjaList.length === 0) {
        daftarPeriodeContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">Belum ada periode kinerja yang ditambahkan.</p>';
        return;
    }

    // Buat struktur tabel yang benar
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'kinerja-table-wrapper';
    
    const table = document.createElement('table');
    table.className = 'kinerja-table';

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

    const tbody = document.createElement('tbody');
    riwayatKinerjaList.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        const periodeMap = { "12": "Tahunan", "6": "Semester", "3": "Triwulanan", "1": "Bulanan" };
        const periodeText = periodeMap[item.periode] || 'Tahunan';

        const tdTahun = document.createElement('td');
        tdTahun.textContent = item.tahun;
        const tdPeriode = document.createElement('td');
        tdPeriode.textContent = periodeText;
        const tdPredikat = document.createElement('td');
        tdPredikat.textContent = item.predikat;

        const tdHapus = document.createElement('td');
        tdHapus.style.textAlign = 'center';
        const hapusBtn = document.createElement('button');
        hapusBtn.innerHTML = '&times;';
        hapusBtn.className = 'btn-hapus-tabel';
        hapusBtn.title = 'Hapus Periode';
        hapusBtn.onclick = () => {
            riwayatKinerjaList.splice(index, 1);
            renderDaftarPeriode();
            updateTombolLihatPeriode();
        };
        
        tdHapus.appendChild(hapusBtn);
        tr.append(tdTahun, tdPeriode, tdPredikat, tdHapus);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    daftarPeriodeContainer.appendChild(tableWrapper);
}

    function openTambahPeriodeModal() {
        const tmtValue = tmtInput.value;
        if (!tmtValue) { showNotifikasi('Peringatan', "Silakan isi 'TMT Pangkat Terakhir' terlebih dahulu."); tmtInput.classList.add('input-warning'); return; }
        tmtInput.classList.remove('input-warning');
        const tahunTerakhir = riwayatKinerjaList.length > 0 ? Math.max(...riwayatKinerjaList.map(item => parseInt(item.tahun))) : parseInt(tmtValue.split('/')[2]) - 1;
        document.getElementById('input-tahun-modal-pangkat').value = tahunTerakhir + 1;
        modalTambah.classList.add('active');
    }
    function closeTambahPeriodeModal() { modalTambah.classList.remove('active'); }
    
    function openLihatPeriodeModal() { renderDaftarPeriode(); modalLihat.classList.add('active'); }
    function closeLihatPeriodeModal() { modalLihat.classList.remove('active'); }

    function simpanPeriodeDariModal() {
    const tmtValue = tmtInput.value;
    if (!tmtValue) { showNotifikasi('Peringatan', 'TMT Pangkat Terakhir harus diisi.'); return; }
    
    const tahunTmt = parseInt(tmtValue.split('/')[2]);
    const targetTahun = parseInt(document.getElementById('input-tahun-modal-pangkat').value);
    const tahunSekarang = new Date().getFullYear();

    // Validasi Tahun
    if (!targetTahun) { showNotifikasi('Input Tidak Valid', 'Tahun harus diisi.'); return; }
    if (targetTahun > tahunSekarang) { showNotifikasi('Input Tidak Valid', `Anda tidak dapat menambahkan kinerja untuk masa depan (tahun ${targetTahun}). Batas input adalah tahun ${tahunSekarang}.`); return; }
    if (targetTahun < tahunTmt) { showNotifikasi('Input Tidak Valid', `Anda tidak dapat menambahkan kinerja dari tahun ${targetTahun} karena sebelum tahun TMT Anda (${tahunTmt}).`); return; }

    // --- LOGIKA VALIDASI PERIODE YANG DISEMPURNAKAN ---
    const periodeBaruValue = document.getElementById('select-periode-modal-pangkat').value;
    const periodeDiTahunTarget = riwayatKinerjaList
        .filter(item => parseInt(item.tahun) === targetTahun)
        .map(item => parseInt(item.periode)); // Ambil durasi dalam angka (12, 6, 3, 1)

    // Cek 1: Validasi khusus untuk periode "Tahunan"
    if (periodeDiTahunTarget.includes(12)) {
        showNotifikasi('Input Ditolak', `Untuk tahun ${targetTahun}, Anda sudah menginput periode Tahunan dan tidak bisa menambah periode lain.`);
        return;
    }
    if (periodeBaruValue === "12" && periodeDiTahunTarget.length > 0) {
        showNotifikasi('Input Ditolak', `Untuk tahun ${targetTahun}, Anda tidak bisa menambahkan periode Tahunan jika sudah ada periode lain.`);
        return;
    }

    // Cek 2: Validasi total bulan tidak boleh melebihi 12
    const totalBulanTersimpan = periodeDiTahunTarget.reduce((sum, bulan) => sum + bulan, 0);
    const totalBulanSetelahDitambah = totalBulanTersimpan + parseInt(periodeBaruValue);

    if (totalBulanSetelahDitambah > 12) {
        showNotifikasi('Batas Input Tercapai', `Input ditolak. Total periode untuk tahun ${targetTahun} akan menjadi ${totalBulanSetelahDitambah} bulan, melebihi batas 12 bulan.`);
        return;
    }

    // --- Jika semua validasi lolos, simpan data ---
    const newItem = {
        tahun: targetTahun.toString(),
        periode: periodeBaruValue,
        predikat: document.getElementById('select-predikat-modal-pangkat').value
    };
    riwayatKinerjaList.push(newItem);
    riwayatKinerjaList.sort((a, b) => a.tahun - b.tahun);
    updateTombolLihatPeriode();
    closeTambahPeriodeModal();
}

    // --- Fungsi Data & Validasi Utama ---
    function muatData() {
        const dataTersimpan = localStorage.getItem(LOCAL_STORAGE_KEY_PANGKAT);
        if (dataTersimpan) {
            const data = JSON.parse(dataTersimpan);
            namaDosenInput.value = data.nama || '';
            pangkatSelect.value = data.pangkat || 'III/a';
            tmtInput.value = data.tmt || '';
            riwayatKinerjaList = data.riwayat || [];
            updateTombolLihatPeriode();
        }
    }

    function simpanData() {
        const dataUntukDisimpan = {
            nama: namaDosenInput.value,
            pangkat: pangkatSelect.value,
            tmt: tmtInput.value,
            riwayat: riwayatKinerjaList
        };
        localStorage.setItem(LOCAL_STORAGE_KEY_PANGKAT, JSON.stringify(dataUntukDisimpan));
    }

    function resetData() {
        if (confirm('Apakah Anda yakin ingin menghapus data tersimpan?')) {
            localStorage.removeItem(LOCAL_STORAGE_KEY_PANGKAT);
            location.reload();
        }
    }
    
    function cekValidasiJabatan() {
        const pangkatTerpilih = pangkatSelect.value;
        const targetJabatan = SYARAT_JABATAN[pangkatTerpilih];
        const submitButton = formPangkat.querySelector('button[type="submit"]');
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

    // --- Inisialisasi & Event Listeners ---
    for (const pangkat in ATURAN_PANGKAT) { const option = document.createElement('option'); option.value = pangkat; option.textContent = `Pangkat ${pangkat}`; pangkatSelect.appendChild(option); }
    muatData();
    updateTombolHitungState();
    //cekValidasiJabatan();
    if (!localStorage.getItem(LOCAL_STORAGE_KEY_PANGKAT)) {
        const pesan = `<h2>Selamat Datang</h2><div class="notif info"><strong>Ini adalah Kalkulator Pangkat.</strong><br>Silakan isi 'TMT Pangkat Terakhir' untuk memulai estimasi Anda.</div>`;
        renderHasil(pesan);
        tmtInput.classList.add('input-warning');
    }

    // Listener Event
    darkModeToggle.addEventListener('click', () => { body.classList.toggle('dark-mode'); if (body.classList.contains('dark-mode')) { localStorage.setItem('theme', 'dark'); darkModeToggle.innerHTML = '☀️'; } else { localStorage.setItem('theme', 'light'); darkModeToggle.innerHTML = '🌙'; } });
    if (tmtInput) { new Datepicker(tmtInput, { format: 'dd/mm/yyyy', autohide: true, buttonClass: 'btn' }); }
    pangkatSelect.addEventListener('change', cekValidasiJabatan);
    btnValidasiYa.addEventListener('click', () => { const submitButton = formPangkat.querySelector('button[type="submit"]'); validasiContainer.classList.add('hidden'); formKonten.classList.remove('disabled'); if(submitButton) submitButton.disabled = false; });
    btnValidasiTidak.addEventListener('click', () => { renderHasil(`<h2>Validasi Jabatan</h2><div class="notif info"><strong>Silakan melakukan kenaikan jabatan terlebih dahulu.</strong><br>Anda harus memenuhi syarat jenjang jabatan fungsional sebelum dapat mengajukan kenaikan pangkat ini.</div>`); });
    tambahPeriodeBtn.addEventListener('click', openTambahPeriodeModal);
    lihatPeriodeBtn.addEventListener('click', openLihatPeriodeModal);
    btnSimpanPeriode.addEventListener('click', simpanPeriodeDariModal);
    btnReset.addEventListener('click', resetData);
    
    // Listener untuk menutup semua modal
    closeModalBtn.addEventListener('click', () => modalHasil.classList.remove('active'));
    modalHasil.addEventListener('click', (e) => { if (e.target === modalHasil) modalHasil.classList.remove('active'); });
    closeModalTambahBtn.addEventListener('click', closeTambahPeriodeModal);
    modalTambah.addEventListener('click', (e) => { if (e.target === modalTambah) closeTambahPeriodeModal(); });
    closeModalLihatBtn.addEventListener('click', closeLihatPeriodeModal);
    modalLihat.addEventListener('click', (e) => { if (e.target === modalLihat) closeLihatPeriodeModal(); });
    notifBtnOk.addEventListener('click', closeNotifikasi);
    modalNotifikasi.addEventListener('click', (e) => { if (e.target === modalNotifikasi) closeNotifikasi(); });
    
    formPangkat.addEventListener('submit', function(e) {
        e.preventDefault();
        const tmtTerakhirInput = tmtInput.value;
        if (!tmtTerakhirInput) { renderHasil(`<h2>Peringatan</h2><div class="notif info">Silakan isi 'TMT Pangkat Terakhir' terlebih dahulu.</div>`); tmtInput.classList.add('input-warning'); return; }
        tmtInput.classList.remove('input-warning');

        let akBaru = 0, totalBulanKinerja = 0, rincianKinerja = [];
        const [dayTmt, monthTmt, yearTmt] = tmtTerakhirInput.split('/');
        const tahunTmt = parseInt(yearTmt), bulanTmt = parseInt(monthTmt);
        const aturanPangkatIni = ATURAN_PANGKAT[pangkatSelect.value];
        const koefisien = aturanPangkatIni ? aturanPangkatIni.koefisien : 0;

        riwayatKinerjaList.forEach(item => {
            const tahunKinerja = parseInt(item.tahun);
            const bulanKinerja = parseInt(item.periode);
            const predikat = item.predikat;
            const pengali = KONVERSI_KINERJA[predikat] || 0;
            let bulanYangDihitung = bulanKinerja;

            if (tahunKinerja === tahunTmt) {
                bulanYangDihitung = 12 - bulanTmt;
                if (bulanYangDihitung < 0) bulanYangDihitung = 0;
            }
            
            const akPerItem = (bulanYangDihitung / 12) * pengali * koefisien;
            totalBulanKinerja += bulanYangDihitung;
            const rincianTeks = `Tahun ${tahunKinerja} (${predikat}): (${bulanYangDihitung}/12) x ${pengali.toFixed(2)} x ${koefisien} = ${formatAngka(akPerItem)} AK`;
            akBaru += akPerItem;
            rincianKinerja.push(rincianTeks);
        });

        const totalAkTerkumpul = akBaru;
        const aturan = ATURAN_PANGKAT[pangkatSelect.value];
        const targetPangkat = aturan.target;
        const akDibutuhkan = aturan.butuh;
        const kekurangan = akDibutuhkan - totalAkTerkumpul;
        const namaDosen = namaDosenInput.value;

        let judul = `<h2>Analisis Kenaikan Pangkat</h2>`;
        if (namaDosen.trim() !== '') { judul = `<h2>Analisis Pangkat untuk ${namaDosen}</h2>`; }
        if (!targetPangkat) { renderHasil(`${judul}<p>Anda sudah berada di pangkat puncak.</p>`); return; }

        let pesan = `${judul}<div class="rincian-ak"><p>+ AK Baru (e-Kinerja): <strong>${formatAngka(akBaru)}</strong></p>`;
        if (rincianKinerja.length > 0) {
            pesan += `<ul style="font-size: 0.8em; margin-left: 20px; color: var(--text-light); list-style-type: '▸ '; padding-left: 15px; margin-top: 5px;">`;
            rincianKinerja.forEach(rincian => { pesan += `<li>${rincian}</li>`; });
            pesan += `</ul>`;
        }
        pesan += `<hr><p><strong>Total AK Baru Terkumpul: ${formatAngka(totalAkTerkumpul)}</strong></p></div><div class="kartu-analisis"><h4>Analisis Kenaikan Pangkat</h4><p>Target Berikutnya: <strong>Pangkat ${targetPangkat}</strong></p><p>Syarat AK Tambahan: <strong>${akDibutuhkan}</strong></p>`;
        
        const progressValue = Math.min(100, Math.max(0, (totalAkTerkumpul / akDibutuhkan) * 100));
        pesan += `<div style="margin-top: 10px; margin-bottom: 15px;"><div style="display: flex; justify-content: space-between; font-size: 0.8em; margin-bottom: 5px;"><span>Progres: <strong>${formatAngka(totalAkTerkumpul)} / ${akDibutuhkan} AK</strong></span><span><strong>${progressValue.toFixed(1)}%</strong></span></div><progress value="${progressValue}" max="100" style="width: 100%; height: 12px;"></progress></div>`;
        
        const statusText = (kekurangan <= 0) ? "Memenuhi Syarat" : "Belum Memenuhi Syarat";
        const statusClass = (kekurangan <= 0) ? "sukses" : "info";
        pesan += `<div class="notif ${statusClass}">Kekurangan AK: <strong>${formatAngka(kekurangan > 0 ? kekurangan : 0)}</strong><br>Status AK: <strong>${statusText}</strong></div>`;
        
        const tmtTerakhir = new Date(`${yearTmt}-${monthTmt}-${dayTmt}`);
        const tanggalSyaratWaktu = new Date(tmtTerakhir);
        tanggalSyaratWaktu.setFullYear(tanggalSyaratWaktu.getFullYear() + 2);
        const hariIni = new Date();
        if (hariIni < tanggalSyaratWaktu) {
            const tglFormatted = tanggalSyaratWaktu.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            pesan += `<div class="notif info" style="margin-top:10px;"><strong>Syarat Waktu Belum Terpenuhi.</strong><br>Anda baru bisa mengajukan paling cepat pada <strong>${tglFormatted}</strong>.</div>`;
        }
        if (kekurangan > 0 && koefisien > 0) {
            const thnBaik = kekurangan / (KONVERSI_KINERJA["Baik"] * koefisien);
            const thnSangatBaik = kekurangan / (KONVERSI_KINERJA["Sangat Baik"] * koefisien);
            pesan += `<div class="notif info" style="margin-top: 10px;"><p style="margin-bottom: 5px; margin-top:0;">Untuk menutupi kekurangan AK, Anda perlu:</p><ul style="margin: 0; padding-left: 20px; text-align: left;"><li>Sekitar <strong>${thnBaik.toFixed(1)} tahun</strong> lagi dengan predikat 'Baik'.</li><li>Atau, sekitar <strong>${thnSangatBaik.toFixed(1)} tahun</strong> lagi dengan predikat 'Sangat Baik'.</li></ul></div>`;
        }
        if (kekurangan > 0 && totalBulanKinerja > 0 && akBaru > 0) {
            const akPerBulan = akBaru / totalBulanKinerja;
            const bulanDibutuhkan = Math.ceil(kekurangan / akPerBulan);
            const tglAkTerpenuhi = new Date();
            tglAkTerpenuhi.setMonth(tglAkTerpenuhi.getMonth() + bulanDibutuhkan);
            const tglEstimasiFinal = tglAkTerpenuhi > tanggalSyaratWaktu ? tglAkTerpenuhi : tglAkTerpenuhi;
            const namaBulan = tglEstimasiFinal.toLocaleString('id-ID', { month: 'long' });
            const tahunProyeksi = tglEstimasiFinal.getFullYear();
            pesan += `<div class="notif estimasi">Dengan kinerja stabil, estimasi kenaikan ke <strong>Pangkat ${targetPangkat}</strong> dapat tercapai pada periode: <br><strong>${namaBulan} ${tahunProyeksi}</strong></div>`;
        }
        pesan += `</div>`;
        renderHasil(pesan);
        updateTombolHitungState();
    });
});