import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import { useSelector } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Notifications from "./pages/Notifications";
import UsersList from "./pages/Admin/UsersList";
import BookAppointment from "./pages/BookAppointment";
import AdminAppointments from "./pages/Admin/AdminAppointments";
import Appointments from "./pages/Appointments";
import AddBoards from "./pages/Admin/AddBoards";
import Ceditor from "./pages/Ceditor";

import ExperimentsList from "./pages/Admin/ExperimentList";
import Profile from "./pages/Profile";
import AddExperiments from "./pages/Admin/AddExperiments";
import ChangeNumOfBoards from "./pages/Admin/ChangeNumOfBoards";

function App() {
  const { loading } = useSelector((state) => state.alerts);
  return (
    <BrowserRouter>
      {loading && (
        <div className="spinner-parent">
          <div class="spinner-border" role="status"></div>
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/userslist"
          element={
            <ProtectedRoute>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/experimentsList"
          element={
            <ProtectedRoute>
              <ExperimentsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ceditor"
          element={
            <ProtectedRoute>
              <Ceditor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-appointments/:experimentId"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin/appointmentList"
          element={
            <ProtectedRoute>
              <AdminAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addExperiments"
          element={
            <ProtectedRoute>
              <AddExperiments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/changeNumOfBoards"
          element={
            <ProtectedRoute>
              <ChangeNumOfBoards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addBoards"
          element={
            <ProtectedRoute>
              <AddBoards />
            </ProtectedRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
