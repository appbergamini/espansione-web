import { PrototypeLayout } from "@/components/layout/prototype-layout";
import Landing from "./pages/landing";
import Contexto from "./pages/contexto";
import Assessment from "./pages/assessment";
import Transicao from "./pages/transicao";
import Dashboard from "./pages/dashboard";
import Competencias from "./pages/competencias";
import Comportamental from "./pages/comportamental";
import Matriz from "./pages/matriz";
import Prioridades from "./pages/prioridades";
import Plano from "./pages/plano";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    name: "prototype",
    element: <PrototypeLayout />,
    children: [
      { path: "/", name: "landing", element: <Landing /> },
      { path: "/contexto", name: "contexto", element: <Contexto /> },
      { path: "/assessment", name: "assessment", element: <Assessment /> },
      { path: "/organizando", name: "organizando", element: <Transicao /> },
      { path: "/dashboard", name: "dashboard", element: <Dashboard /> },
      { path: "/competencias", name: "competencias", element: <Competencias /> },
      { path: "/comportamental", name: "comportamental", element: <Comportamental /> },
      { path: "/matriz", name: "matriz", element: <Matriz /> },
      { path: "/prioridades", name: "prioridades", element: <Prioridades /> },
      { path: "/plano", name: "plano", element: <Plano /> },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
