# HMS Backend — Setup Guide

## 📁 Folder Structure
```
backend/
├── server.js           ← Entry point
├── seed.js             ← Populate database with demo data
├── .env.example        ← Copy this to .env and fill in values
├── package.json
├── config/
│   ├── db.js           ← MongoDB connection
│   └── cloudinary.js   ← File upload config
├── middleware/
│   └── auth.js         ← JWT verification + role checks
├── models/             ← Database schemas
│   ├── User.js
│   ├── Room.js
│   ├── Complaint.js
│   ├── Outpass.js
│   ├── Attendance.js
│   ├── Notice.js
│   ├── Mess.js
│   ├── RoomChange.js
│   ├── Visitor.js
│   ├── Fee.js
│   └── HostelApplication.js
└── routes/             ← API endpoints
    ├── auth.js
    ├── students.js
    ├── rooms.js
    ├── complaints.js
    ├── outpass.js
    ├── attendance.js
    ├── notices.js
    ├── mess.js
    ├── visitors.js
    ├── roomchanges.js
    ├── fees.js
    ├── applications.js
    └── managers.js
```

---

## 🚀 Step-by-Step Setup

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2 — Get a free MongoDB Atlas database
1. Go to https://cloud.mongodb.com
2. Sign up (free)
3. Create a new project → Create a cluster (M0 Free)
4. Click **Connect** → **Drivers**
5. Copy the connection string — looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
make sure internet connected
### Step 3 — Get free Cloudinary account (for file uploads)
1. Go to https://cloudinary.com and sign up (free)
2. Go to Dashboard
3. Copy your **Cloud Name**, **API Key**, and **API Secret**

### Step 4 — Set up environment variables
In the `backend/` folder:
```bash
# Copy the example file
cp .env.example .env
```
Then open `.env` and fill in:
```
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/hostel_db
JWT_SECRET=any_long_random_string_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

### Step 5 — Install dependencies
Open terminal in the `backend/` folder:
```bash
npm install
```

### Step 6 — Seed the database with demo data
```bash
node seed.js
```
You should see:
```
✅ MongoDB Connected
✅ Users seeded
✅ Rooms seeded
✅ Mess schedule seeded
✅ Notices seeded
✅ Fee structures seeded
🎉 Database seeded successfully!
```

### Step 7 — Start the backend
```bash
npm run dev
```
You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### Step 8 — Test it's working
Open browser and go to:
```
http://localhost:5000/api/health
```
You should see: `{ "status": "ok", "message": "HMS Backend running" }`

---

## 🔌 All API Endpoints

### Auth
| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| POST | /api/auth/login | Login (all roles) | ❌ |
| GET  | /api/auth/me    | Get current user  | ✅ |

### Students
| Method | URL | Description | Role |
|--------|-----|-------------|------|
| GET    | /api/students | Get all students | Manager/Admin |
| POST   | /api/students | Register student | Manager/Admin |
| PATCH  | /api/students/:id/allocate | Assign room | Manager/Admin |
| PATCH  | /api/students/:id/deallocate | Remove room | Manager/Admin |
| DELETE | /api/students/:id | Delete student | Admin |

### Rooms
| Method | URL | Description | Role |
|--------|-----|-------------|------|
| GET    | /api/rooms | Get all rooms | All |
| POST   | /api/rooms | Add room | Manager |
| PATCH  | /api/rooms/:id | Update room | Manager |
| DELETE | /api/rooms/:id | Delete room | Admin |

### Complaints
| Method | URL | Description | Role |
|--------|-----|-------------|------|
| GET    | /api/complaints | Get complaints | All (filtered) |
| POST   | /api/complaints | Submit complaint | Student |
| PATCH  | /api/complaints/:id/status | Update status | Manager |
| DELETE | /api/complaints/:id | Delete | Manager |

### Fee Payments
| Method | URL | Description | Role |
|--------|-----|-------------|------|
| GET    | /api/fees/payments | Get payments | All (filtered) |
| POST   | /api/fees/payments | Submit + upload proof | Student |
| PATCH  | /api/fees/payments/:id/verify | Verify payment | Manager |
| PATCH  | /api/fees/payments/:id/reject | Reject payment | Manager |
| GET    | /api/fees/structure | Get fee types | All |
| POST   | /api/fees/structure | Add fee type | Manager |
| DELETE | /api/fees/structure/:id | Delete fee type | Manager |

### Other modules (same pattern)
- `/api/outpasses` — GET, POST, PATCH /:id/status
- `/api/attendance` — GET, POST, DELETE /:id
- `/api/notices` — GET, POST, DELETE /:id
- `/api/mess/schedule` — GET, PATCH /:id
- `/api/mess/feedback` — GET, POST
- `/api/visitors` — GET, POST, PATCH /:id/status
- `/api/roomchanges` — GET, POST, PATCH /:id/status
- `/api/applications` — GET, POST, PATCH /:id/approve, PATCH /:id/reject
- `/api/managers` — GET, POST, DELETE /:id

---

## 🔐 How Authentication Works

1. Frontend sends `POST /api/auth/login` with `{ email, password, role }`
2. Backend returns a **JWT token**
3. Frontend stores token in `localStorage`
4. Every subsequent request sends: `Authorization: Bearer <token>`
5. Backend verifies the token and knows who the user is

---

## 📦 Demo Login Credentials
```
Super Admin  →  superadmin@college.edu  /  superadmin123
Manager      →  manager@college.edu     /  manager123
Student      →  john@college.edu        /  student123
```
