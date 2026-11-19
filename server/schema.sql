CREATE DATABASE IF NOT EXISTS smvms_db;
USE smvms_db;

CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(20) PRIMARY KEY,
  owner_name VARCHAR(120) NOT NULL,
  shop_name VARCHAR(150) NOT NULL,
  sector VARCHAR(120) NOT NULL,
  stall_code VARCHAR(30) NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL DEFAULT 8000.00,
  kpi_score INT NOT NULL DEFAULT 75,
  total_sales DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status ENUM('Pending', 'Approved', 'Blocked') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  vendor_id VARCHAR(20) NOT NULL,
  budget DECIMAL(12, 2) NOT NULL,
  spent DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(30) PRIMARY KEY,
  vendor_id VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(25) PRIMARY KEY,
  vendor_id VARCHAR(20) NOT NULL,
  description VARCHAR(255) NOT NULL,
  gross_amount DECIMAL(12, 2) NOT NULL,
  commission_amount DECIMAL(12, 2) NOT NULL,
  net_payout DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender VARCHAR(150) NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Seed Data
INSERT IGNORE INTO vendors (id, owner_name, shop_name, sector, stall_code, monthly_rent, kpi_score, total_sales, status) VALUES
('V-101', 'Rafiqul Islam', 'Dhaka Thread & Style', 'Garments and Fashion Shops', 'A-12', 9500, 88, 145000, 'Approved'),
('V-102', 'Nusrat Jahan', 'Apex IT & Cloud Care', 'Software and IT Solutions', 'C-04', 12000, 92, 210000, 'Approved'),
('V-103', 'Kamrul Hasan', 'VoltEdge Mobile Hub', 'Electronics and Mobile Accessories', 'B-19', 10000, 79, 118000, 'Approved'),
('V-104', 'Farhana Yasmin', 'FreshBasket Daily Mart', 'Grocery and Daily Necessities', 'G-02', 8500, 85, 96000, 'Approved'),
('V-105', 'Mahmudul Haque', 'BuildStrong Hardware', 'Hardware and Construction Materials', 'D-07', 11000, 70, 54000, 'Pending'),
('V-106', 'Sadia Afrin', 'FixIt Pro Maintenance', 'Service-Based Vendors', 'S-03', 6500, 62, 28000, 'Blocked');

INSERT IGNORE INTO campaigns (id, title, vendor_id, budget, spent) VALUES
('CMP-1', 'Festive Apparel Spotlight', 'V-101', 40000, 28500),
('CMP-2', 'Enterprise IT Audit Drive', 'V-102', 50000, 46000),
('CMP-3', 'Smart Gadget Week', 'V-103', 30000, 31500);

INSERT IGNORE INTO products (id, vendor_id, name, price, stock) VALUES
('P-1', 'V-101', 'Premium Panjabi Collection', 1850, 30),
('P-2', 'V-102', 'Web & ERP Security Audit', 15000, 12),
('P-3', 'V-103', '65W GaN Fast Charger', 2200, 45),
('P-4', 'V-104', 'Organic Basmati Rice (5kg)', 780, 60),
('P-5', 'V-105', 'Heavy Duty Drill Bits Set', 1450, 20);

INSERT IGNORE INTO transactions (id, vendor_id, description, gross_amount, commission_amount, net_payout) VALUES
('TXN-9001', 'V-101', 'Premium Panjabi Collection (x2)', 3700, 370, 3330),
('TXN-9002', 'V-102', 'Web & ERP Security Audit (x1)', 15000, 1500, 13500),
('TXN-9003', 'V-103', '65W GaN Fast Charger (x3)', 6600, 660, 5940);

INSERT IGNORE INTO messages (sender, message_text) VALUES
('V-101 (Dhaka Thread & Style)', 'Uploaded updated trade license & requested festive campaign banner.'),
('Admin (Market Authority)', 'Approved stall A-12 monthly commission schedule. Welcome to Q4 campaign.');
