import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routers } from "./router";
import { PrototypeProvider } from "./prototype/context";
// QA metodológico (auto-tests) roda na carga do app
import "./services/assessment/methodologySelfTests";

const queryClient = new QueryClient();

const App = () => {
  const router = createBrowserRouter(routers);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PrototypeProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </PrototypeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
