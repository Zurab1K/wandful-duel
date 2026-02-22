import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HouseSelect from "./pages/HouseSelect";
import DuelArena from "./pages/DuelArena";
import HogwartsMap from "./pages/HogwartsMap";
import HogwartsExplore from "./pages/HogwartsExplore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/house-select" element={<HouseSelect />} />
          <Route path="/map" element={<HogwartsMap />} />
          <Route path="/explore" element={<HogwartsExplore />} />
          <Route path="/duel" element={<DuelArena />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
