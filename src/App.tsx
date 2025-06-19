import { Routes, Route } from 'react-router-dom';
import LoginScreen from '@/components/Login/Login';
import AllDeliveriesTable from '@/components/Deliveries/AllDeliveries';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from '@/components/ProtectedLayout';
import NotFound from '@/components/NotFound/NotFound';
import AddDelivery from './Index/AddDelivery';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />

      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<AddDelivery />} />
        <Route path="/deliveries" element={<AllDeliveriesTable />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
