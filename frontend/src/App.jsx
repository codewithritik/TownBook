import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { loadUser } from "./store/slices/authSlice";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Rooms from "./pages/Rooms";
import Reservations from "./pages/Reservations";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import BookRequests from "./pages/BookRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ApprovedRooms from "./pages/ApprovedRooms";

const theme = createTheme({
  palette: {
    primary: {
      main: "#008D86",
    },
    secondary: {
      main: "#F5F6F5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
  },
});

const App = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route element={<MainLayout />}>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/books"
                element={
                  <ProtectedRoute>
                    <Books />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute>
                    <Rooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <ProtectedRoute>
                    <Reservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              {/* Admin Routes */}
              {user?.role === "librarian" && (
                <>
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/book-requests"
                    element={
                      <ProtectedRoute>
                        <BookRequests />
                      </ProtectedRoute>
                    }
                  />
                </>
              )}
              <Route
                path="/approved-rooms"
                element={
                  <ProtectedRoute>
                    <ApprovedRooms />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
