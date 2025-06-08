# TownBook Frontend

This is the frontend application for TownBook, a community library management system built with React and Material-UI.

## Features

- User authentication (login/register)
- Book catalog browsing
- Reading room reservations
- User profile management
- Admin dashboard for librarians
- Responsive design
- Error handling and loading states

## Tech Stack

- React
- Vite
- Material-UI
- Redux Toolkit
- React Router
- Axios

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create a `.env` file in the frontend directory with the following content:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:5173`.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── layouts/        # Layout components
│   ├── pages/          # Page components
│   ├── store/          # Redux store and slices
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── public/             # Static assets
├── .env.example        # Example environment variables
└── package.json        # Project dependencies and scripts
```

## Development

- The application uses Material-UI for styling and components
- Redux Toolkit is used for state management
- React Router handles routing and navigation
- Axios is configured with interceptors for API requests
- Error boundaries handle unexpected errors gracefully

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
