# 🚀 Bitcoin POS - Offline Setup Guide

## ✅ What's Running

### 1. Backend Server
- **Status**: ✅ Running on port 3001
- **Local**: http://localhost:3001
- **Network (Phone)**: http://172.16.6.16:3001
- **Database**: SQLite (offline, no Docker needed!)
- **Status**: Backend is accessible from your local network

### 2. Vendor Dashboard
- **Status**: ✅ Running on port 5173
- **URL**: http://localhost:5173
- Open in your browser to manage products and generate QR codes

### 3. Mobile App
- **Ready to start**: Run `cd customer-app && npm install && npm start`
- **Network Config**: Already set to use laptop IP (172.16.6.16:3001)

---

## 📱 How It Works (Offline)

### Setup:
1. **Laptop**: Runs backend + vendor dashboard
2. **Phone**: Runs mobile app
3. **Communication**: Both connected to same WiFi network (no internet needed!)
4. **QR Codes**: Contain JSON data - completely offline

### Flow:
1. Vendor opens dashboard on laptop → Adds products → Builds cart → Generates QR code
2. QR code contains JSON with vendor ID, items, and total amount
3. Customer scans QR code with phone app (camera works offline)
4. App reads JSON from QR code → Shows payment screen
5. Customer confirms → Payment happens over local WiFi
6. Both devices update in real-time (all on local network)

---

## 🔑 Demo Accounts

### Vendor Dashboard:
- **Email**: vendor@example.com
- **Password**: password123
- **URL**: http://localhost:5173

### Customer Mobile App:
- **Email**: customer@example.com
- **Password**: password123

---

## 🚀 Quick Start

### On Laptop (Already Running):
✅ Backend: http://172.16.6.16:3001
✅ Vendor Dashboard: http://localhost:5173

### On Phone:

1. **Install Dependencies** (if not done):
```bash
cd customer-app
npm install
```

2. **Start Mobile App**:
```bash
npm start
```

3. **Connect Phone to Same WiFi as Laptop**

4. **Run on Device**:
   - iOS: Press `i` or scan QR code from Expo
   - Android: Press `a` or scan QR code from Expo

---

## 🔧 Important Notes

### Your Laptop's IP Address:
**172.16.6.16** (already configured)

If your IP changes, update these files:
1. `customer-app/src/utils/api.ts` - Change the IP address
2. Restart mobile app

To find your IP:
```bash
ipconfig getifaddr en0  # Mac WiFi
# or
ifconfig | grep "inet " # Linux/Mac
```

### QR Code Flow (100% Offline):
- QR codes contain **JSON data only** (no URLs, no internet)
- Example QR data:
```json
{
  "vendorId": "uuid-here",
  "cartItems": [...],
  "totalBTC": 0.00015,
  "totalSbtc": 1500.00
}
```
- Customer app reads this JSON directly from QR code
- Payment happens over local WiFi to laptop backend

### Testing Card Payments:
- **Success**: Cards starting with `4242`
- **Failure**: Any other card number

---

## 📝 Testing Steps

1. **Vendor Dashboard** (on laptop):
   - Login at http://localhost:5173
   - Go to Products → Add some products
   - Go to QR Generator → Build cart → Generate QR code

2. **Customer App** (on phone):
   - Login with customer@example.com
   - Add funds using card `4242 4242 4242 4242`
   - Go to Scan tab → Scan the QR code from laptop
   - Confirm payment → See success screen

3. **Check Transactions**:
   - Vendor dashboard → Transactions tab
   - Customer app → Transactions tab

---

## 🛠️ Troubleshooting

### Phone Can't Connect to Backend:
- ✅ Make sure both devices on same WiFi
- ✅ Check laptop IP hasn't changed (run: `ipconfig getifaddr en0`)
- ✅ Update IP in `customer-app/src/utils/api.ts` if changed
- ✅ Restart mobile app

### QR Code Not Scanning:
- ✅ Ensure camera permissions granted
- ✅ QR code must contain valid JSON (generated from vendor dashboard)
- ✅ Check QR code is clear and well-lit

### Backend Not Running:
```bash
cd backend
npm run dev
```

### Vendor Dashboard Not Running:
```bash
cd vendor-dashboard
npm run dev
```

---

## ✅ Everything is Set Up!

- ✅ SQLite database (no Docker needed!)
- ✅ Demo accounts created
- ✅ Backend running on local network
- ✅ Vendor dashboard running
- ✅ Mobile app configured for laptop IP

**You're ready for the hackathon demo! 🎉**

