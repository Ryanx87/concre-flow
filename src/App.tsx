import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/tracking" element={<TruckTracking />} />
            <Route path="/materials" element={<MaterialStock />} />
            <Route path="/batching" element={<BatchingSchedule />} />
            <Route path="/quality" element={<QualityControl />} />
            <Route path="/ai-demo" element={<AIDocumentDemo />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/deliveries" element={<DeliveryManagement />} />
            <Route path="/issues" element={<IssuesManagement />} />
            <Route path="/maintenance" element={<PlantMaintenance />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
