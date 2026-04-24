import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { SnackbarsProvider } from "@/snackbars/SnackbarsContext";
import { SnackbarStack } from "@/snackbars/SnackbarStack";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import RisksPage from "./pages/RisksPage";
import AgentsPage from "./pages/AgentsPage";
import StubPage from "./pages/StubPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// LOVABLE_KEEP_START
// Не изменять этот блок: специфическая настройка basename для GitHub Pages
const isGitHubPages = window.location.hostname.includes("github.io");
const basename = isGitHubPages ? "/insightful-nudges" : "";
// LOVABLE_KEEP_END

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      {/* LOVABLE_KEEP_START */}
      <BrowserRouter basename={basename}>
      {/* LOVABLE_KEEP_END */}
        <SnackbarsProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/risks" element={<RisksPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route
                path="/measures"
                element={
                  <StubPage
                    title="Меры реагирования"
                    lead="Каталог корректирующих и предупреждающих мер, привязанных к рискам и инцидентам."
                  />
                }
              />
              <Route
                path="/analytics"
                element={
                  <StubPage
                    title="Аналитика"
                    lead="Сводки и графики по рискам, инцидентам и эффективности мер от агента-аналитика."
                  />
                }
              />
              <Route
                path="/knowledge"
                element={
                  <StubPage
                    title="База знаний"
                    lead="Документы и инструкции, которыми пользуются AI-агенты для ответов и анализа."
                  />
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SnackbarStack />
        </SnackbarsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
