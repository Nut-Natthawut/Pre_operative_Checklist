import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';

// Pages
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import FormNew from './pages/FormNew';
import FormView from './pages/FormView';
import SearchPage from './pages/Search';
import AdminUsersPage from './pages/AdminUsers';
import Homepage from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/form/new" element={<FormNew />} />
          <Route path="/form/:id" element={<FormView />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
