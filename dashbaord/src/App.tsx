import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AnalyticsPage from './pages/AnalyticsPage';
import PartsListPage from './pages/PartsListPage';
import OrdersListPage from './pages/OrdersListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderPrintView from './pages/OrderPrintView';
import ShopsListPage from './pages/ShopsListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<AnalyticsPage />} />
            <Route path="/parts" element={<PartsListPage />} />
            <Route path="/orders" element={<OrdersListPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/shops" element={<ShopsListPage />} />
          </Route>
          <Route path="/orders/:id/print" element={<OrderPrintView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
