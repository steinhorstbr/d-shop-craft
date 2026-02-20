import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import PublicStorefront from "./pages/PublicStorefront";

// Super Admin
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SuperAdminStores from "./pages/super-admin/SuperAdminStores";
import SuperAdminPlans from "./pages/super-admin/SuperAdminPlans";
import SuperAdminConfig from "./pages/super-admin/SuperAdminConfig";

// Store Admin
import StoreAdminLayout from "./layouts/StoreAdminLayout";
import StoreAdminDashboard from "./pages/store-admin/StoreAdminDashboard";
import StoreAdminProducts from "./pages/store-admin/StoreAdminProducts";
import StoreAdminOrders from "./pages/store-admin/StoreAdminOrders";
import StoreAdminCustomers from "./pages/store-admin/StoreAdminCustomers";
import StoreAdminPrinters from "./pages/store-admin/StoreAdminPrinters";
import StoreAdminFilaments from "./pages/store-admin/StoreAdminFilaments";
import StoreAdminPackaging from "./pages/store-admin/StoreAdminPackaging";
import StoreAdminStoreSettings from "./pages/store-admin/StoreAdminStoreSettings";
import StoreAdminSettings from "./pages/store-admin/StoreAdminSettings";
import StoreAdminAuditLog from "./pages/store-admin/StoreAdminAuditLog";
import PublicProductPage from "./pages/PublicProductPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/loja/:storeId" element={<PublicStorefront />} />
            <Route path="/loja/:storeId/produto/:productId" element={<PublicProductPage />} />

            {/* Super Admin */}
            <Route path="/super-admin" element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminLayout><SuperAdminDashboard /></SuperAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/super-admin/stores" element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminLayout><SuperAdminStores /></SuperAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/super-admin/plans" element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminLayout><SuperAdminPlans /></SuperAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/super-admin/config" element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminLayout><SuperAdminConfig /></SuperAdminLayout>
              </ProtectedRoute>
            } />

            {/* Store Admin */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminDashboard /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminProducts /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminOrders /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminCustomers /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/printers" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminPrinters /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/filaments" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminFilaments /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/packaging" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminPackaging /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/store-settings" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminStoreSettings /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminSettings /></StoreAdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/audit-log" element={
              <ProtectedRoute requiredRole="store_admin">
                <StoreAdminLayout><StoreAdminAuditLog /></StoreAdminLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
