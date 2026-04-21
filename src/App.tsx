import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthenticatedRoute, AdminRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import OrderManagement from "./pages/OrderManagement";
import TruckTracking from "./pages/TruckTracking";
import MaterialStock from "./pages/MaterialStock";
import BatchingSchedule from "./pages/BatchingSchedule";
import QualityControl from "./pages/QualityControl";
import AIDocumentDemo from "./pages/AIDocumentDemo";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import DeliveryManagement from "./pages/DeliveryManagement";
import IssuesManagement from "./pages/IssuesManagement";
import PlantMaintenance from "./pages/PlantMaintenance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<AuthenticatedRoute><OrderManagement /></AuthenticatedRoute>} />
              <Route path="/tracking" element={<AuthenticatedRoute><TruckTracking /></AuthenticatedRoute>} />
              <Route path="/materials" element={<AdminRoute><MaterialStock /></AdminRoute>} />
              <Route path="/batching" element={<AdminRoute><BatchingSchedule /></AdminRoute>} />
              <Route path="/quality" element={<AdminRoute><QualityControl /></AdminRoute>} />
              <Route path="/ai-demo" element={<AuthenticatedRoute><AIDocumentDemo /></AuthenticatedRoute>} />
              <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
              <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
              <Route path="/deliveries" element={<AuthenticatedRoute><DeliveryManagement /></AuthenticatedRoute>} />
              <Route path="/issues" element={<AuthenticatedRoute><IssuesManagement /></AuthenticatedRoute>} />
              <Route path="/maintenance" element={<AdminRoute><PlantMaintenance /></AdminRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
