import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './components/AdminLayout';
import AdminHomePage from './pages/AdminHomePage';
import ViewBookingDetailsPage from './pages/ViewBookingDetailsPage';
import AddPropertiesPage from './pages/AddPropertiesPage';

function App() {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route
        path="/*"
        element={
          <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(15,23,42,0.45),transparent_35%)]" />
            <Navbar />
            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-8">
              <Routes>
                <Route path="/customer/profile" element={<ProfilePage />} />
              </Routes>
            </main>
          </div>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<AdminHomePage />} />
        <Route path="bookings" element={<ViewBookingDetailsPage />} />
        <Route path="properties/add" element={<AddPropertiesPage />} />
      </Route>
    </Routes>
  );
}

export default App;

