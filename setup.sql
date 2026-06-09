CREATE DATABASE IF NOT EXISTS db_siprabu_ft;
USE db_siprabu_ft;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'PJ_Ruangan', 'Koorprodi', 'Wadek') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS barangs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_barang VARCHAR(100) NOT NULL,
    no_urut_pendaft INT NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    merk_type VARCHAR(255) NOT NULL,
    th_perolehan YEAR NOT NULL,
    lokasi_ruangan VARCHAR(100) NOT NULL,
    kondisi ENUM('Baik', 'Rusak Ringan', 'Rusak Berat') DEFAULT 'Baik',
    status_bmn ENUM('Aktif', 'Dihapuskan') DEFAULT 'Aktif',
    kategori ENUM('Rendah', 'Tinggi') DEFAULT 'Tinggi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(kode_barang, no_urut_pendaft)
);

CREATE TABLE IF NOT EXISTS laporan_kerusakans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_barang VARCHAR(100) NOT NULL,
    no_urut_pendaft INT NOT NULL,
    dilaporkan_oleh VARCHAR(255) NOT NULL,
    deskripsi_kerusakan TEXT NOT NULL,
    foto_url VARCHAR(255) NOT NULL,
    status_laporan ENUM('Menunggu', 'Diproses', 'Selesai', 'Ditolak') DEFAULT 'Menunggu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kode_barang, no_urut_pendaft) REFERENCES barangs(kode_barang, no_urut_pendaft) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mutasis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_barang VARCHAR(100) NOT NULL,
    no_urut_pendaft INT NOT NULL,
    ruangan_asal VARCHAR(100) NOT NULL,
    ruangan_tujuan VARCHAR(100) NOT NULL,
    alasan TEXT NOT NULL,
    foto_bukti VARCHAR(255) NULL,
    status_mutasi ENUM('Pending_Asal', 'Pending_Tujuan', 'Disetujui', 'Ditolak_Asal', 'Ditolak_Tujuan') DEFAULT 'Pending_Asal',
    diajukan_oleh VARCHAR(255) NOT NULL,
    disetujui_asal_oleh VARCHAR(255) NULL,
    disetujui_tujuan_oleh VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kode_barang, no_urut_pendaft) REFERENCES barangs(kode_barang, no_urut_pendaft) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sla_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    laporan_id INT NOT NULL,
    tahap VARCHAR(100) NOT NULL,
    waktu_mulai TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    waktu_selesai TIMESTAMP NULL,
    durasi_menit INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laporan_id) REFERENCES laporan_kerusakans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stok_opnames (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruangan VARCHAR(100) NOT NULL,
    tanggal_mulai TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_selesai TIMESTAMP NULL,
    status ENUM('Berjalan', 'Selesai') DEFAULT 'Berjalan',
    dilakukan_oleh VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stok_opname_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stok_opname_id INT NOT NULL,
    kode_barang VARCHAR(100) NOT NULL,
    no_urut_pendaft INT NOT NULL,
    status_keberadaan ENUM('Ditemukan', 'Tidak Ditemukan') DEFAULT 'Tidak Ditemukan',
    discan_pada TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stok_opname_id) REFERENCES stok_opnames(id) ON DELETE CASCADE,
    FOREIGN KEY (kode_barang, no_urut_pendaft) REFERENCES barangs(kode_barang, no_urut_pendaft) ON DELETE CASCADE
);

-- Insert sample admin user
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Administrator', 'admin@siprabu.ft.uns.ac.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin');
