
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Create from "./pages/Create";
import Financial from "./pages/Financial";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import PodcastPage from "./pages/PodcastPage";
import ZooToolsDemo from "./pages/ZooToolsDemo";
import OurPodcasts from "./pages/OurPodcasts";
import LiquidGlassDemo from "./pages/LiquidGlassDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner richColors theme="dark" />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<Create />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/podcast/:id" element={<PodcastPage />} />
          <Route path="/zootools" element={<ZooToolsDemo />} />
          <Route path="/our-podcasts" element={<OurPodcasts />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/liquid-glass" element={<LiquidGlassDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
