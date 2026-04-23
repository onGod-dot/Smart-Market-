import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TargetCursor from "@/components/TargetCursor";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Forecasting from "@/pages/Forecasting";
import DemandAnalysis from "@/pages/DemandAnalysis";
import Products from "@/pages/Products";
import Predictions from "@/pages/Predictions";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TargetCursor
        targetSelector="button, a, input, select, textarea, [role='button'], .cursor-target"
        spinDuration={2}
        hideDefaultCursor={true}
        hoverDuration={0.2}
        parallaxOn={true}
      />
      <Toaster />
      <Sonner />
      <HashRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/demand-analysis" element={<DemandAnalysis />} />
            <Route path="/products" element={<Products />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
