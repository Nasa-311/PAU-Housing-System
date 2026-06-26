# PAU Off-Campus Housing System

A web-based housing platform designed for Pan-Atlantic University (PAU) students and property owners. Students can browse, filter, and save verified off-campus housing listings near the PAU campus. Property owners can register, list properties with photos, and receive enquiries from students.

---

## 🔗 Links

- **GitHub Repository:** https://github.com/Nasa-311/PAU-Housing-System
- **Live Backend (Render):** https://pau-housing-system.onrender.com
- **Live Frontend (Netlify):** https://pau-housing-system.netlify.app

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Image Upload | Multer |
| Email Notifications | Nodemailer |
| Version Control | Git & GitHub |
| Deployment (Backend) | Render |
| Deployment (Frontend) | Netlify |

---

## 📁 Project Structure

```
pau-housing/
├── frontend/
│   ├── pages/
│   │   ├── index.html             # Homepage / Landing page
│   │   ├── login.html             # Login page
│   │   ├── register.html          # Registration page
│   │   ├── properties.html        # Property listings page
│   │   ├── property-detail.html   # Property detail page
│   │   ├── landlords.html         # Landlords directory page
│   │   ├── student-dashboard.html # Student dashboard
│   │   ├── owner-dashboard.html   # Property owner dashboard
│   │   └── settings.html          # Appearance settings page
│   ├── css/
│   │   └── style.css              # Main stylesheet (includes dark mode)
│   ├── js/
│   │   ├── config.js              # API base URL config (local vs live)
│   │   ├── main.js                # Shared JS (navbar, properties, search)
│   │   ├── accessibility.js       # Dark mode + text size (silent apply)
│   │   └── toast.js               # Toast notifications + confirm popups
│   └── images/                    # Local image assets
├── backend/
│   ├── server.js                  # Main Express server + all API routes
│   ├── db.js                      # PostgreSQL connection pool
│   ├── database.sql               # Database schema + sample data
│   ├── package.json               # Node dependencies
│   └── .env                       # Environment variables (not committed)
├── render.yaml                    # Render deployment config
├── netlify.toml                   # Netlify deployment config
└── README.md                      # This file
```

---

## How to Run Locally

### Prerequisites
- Node.js v18 or higher
- PostgreSQL installed and running
- pgAdmin (optional, for database management)

### Step 1 — Clone the repository
```bash
git clone https://github.com/Nasa-311/PAU-Housing-System.git
cd PAU-Housing-System
```

### Step 2 — Set up the database
Open pgAdmin, create a database called `pau_housing`, then run the contents of `backend/database.sql` in the Query Tool.

### Step 3 — Configure environment variables
Create a `.env` file inside the `backend` folder:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pau_housing
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=3000

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=your_gmail@gmail.com
```

### Step 4 — Start the backend
```bash
cd backend
npm install
node server.js
```
You should see:
```
✅ Connected to PostgreSQL database
✅ PAU Housing Backend is RUNNING! → http://localhost:3000
```

### Step 5 — Open the frontend
In a second terminal:
```bash
npx serve frontend/pages
```
Then open `http://localhost:3000` in your browser.

---

## User Roles

| Role | Features |
|---|---|
| **Student** | Browse properties, filter by type/rent/distance, save properties, message landlords, dark mode |
| **Property Owner** | Add/delete listings with photos, view student messages, manage profile |
| **Visitor** | View homepage, see featured properties (login required for full access) |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/register | Register new user (student or landlord) |
| POST | /api/login | Authenticate user |
| GET | /api/properties | Get all properties (supports filters) |
| GET | /api/properties/:id | Get single property |
| POST | /api/properties | Add new property (landlord only) |
| DELETE | /api/properties/:id | Delete property |
| GET | /api/my-properties | Get logged-in landlord's properties |
| GET | /api/landlords | Get all landlords with property counts |
| GET | /api/landlords/:id | Get single landlord profile |
| POST | /api/messages | Send message to landlord |
| GET | /api/messages/landlord/:id | Get messages for a landlord |

---

## Features

- Property search with filters (name, room type, rent range, distance)
- Property cards with images, badges, and save functionality
- Landlord directory with profile modals and property links
- Student-to-landlord messaging on property detail page
- Student dashboard with saved properties
- Owner dashboard with listings, add property form, and messages inbox
- Dark mode and adjustable text size (saved across sessions)
- Automated email notification on new user registration
- Fully responsive layout for mobile, tablet, and desktop
- Role-based access control (students vs landlords vs visitors)

---

##  AI Assistance Disclosure

This project was developed with assistance from **Claude** (by Anthropic), an AI assistant, as part of the development process for the Final Year Project at Pan-Atlantic University.

AI assistance was used in the following areas:
- Frontend UI design and HTML/CSS structure
- JavaScript logic for API calls, filtering, and role-based navigation
- Backend Express.js API route development
- PostgreSQL database schema design
- Dark mode CSS implementation
- Debugging and troubleshooting during development
- Academic documentation (Chapters 4 and 5 writing support)

All code was reviewed, tested, and deployed by the project author, **Chinasa Ihedioha**, as part of the final year project submission for the academic year 2024/2025.

The use of AI tools in this project was disclosed to and acknowledged by the project supervisor.

---

## Author

**Chinasa Ihedioha**
Final Year Student — Pan-Atlantic University, Lagos
GitHub: [@Nasa-311](https://github.com/Nasa-311)
Email: chinasa.ihedioha@pau.edu.ng

---

## Licence

This project was created for academic purposes at Pan-Atlantic University.