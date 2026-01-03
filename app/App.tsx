import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './components/AdminLayout';
import AdminHomePage from './pages/AdminHomePage';
import ViewBookingDetailsPage from './pages/ViewBookingDetailsPage';
import AddPropertiesPage from './pages/AddPropertiesPage';
import ManagePropertiesPage from './pages/ManagePropertiesPage';

function App() {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route
        path="/*"
        element={
          <div className="relative min-h-screen overflow-hidden transition-colors duration-300 bg-linear-to-b from-slate-100 via-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.05),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(241,245,249,0.45),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(15,23,42,0.45),transparent_35%)]" />
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
        <Route path="properties" element={<ManagePropertiesPage />} />
        <Route path="properties/add" element={<AddPropertiesPage />} />
      </Route>
    </Routes>
  );
}

export default App;

