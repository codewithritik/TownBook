# TownBook

TownBook is a community library management system designed to streamline book catalog browsing, reading room reservations, and library administration. The project consists of a React-based frontend and an Express/MongoDB backend.

## URL 
https://townbook-ritik.netlify.app/login

## backend api url 
https://townbook-efvj.onrender.com

## Features

- User authentication (login/register)
- Book catalog browsing
- Reading room reservations
- User profile management
- Admin dashboard for librarians
- Book and room request management
- Automated email reminders for book pickups
- Responsive design

## Tech Stack

- **Frontend:** React, Vite, Material-UI, Redux Toolkit, React Router, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer, Node-cron

## Project Structure

```
TownBook-main/
├── frontend/   # React frontend application
├── backend/    # Express backend API
└── README.md   # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TownBook-main
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```
MONGODB_URI=mongodb://localhost:27017/townbook
PORT=5000
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173).

## API Endpoints (Backend)
- `POST /api/auth` - User authentication
- `GET /api/books` - Book catalog
- `POST /api/books` - Add new book (admin)
- `GET /api/rooms` - List reading rooms
- `POST /api/reservations` - Reserve a room
- `GET /api/book-requests` - Book requests (admin)
- `GET /api/room-requests` - Room requests (admin)

## Automated Tasks
- Daily email reminders for approved book pickups (using Node-cron and Nodemailer)

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.


-- admin dashboard
email - Librarian@gmail.com
pass - Librarian@123
