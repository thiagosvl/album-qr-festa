import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { FESTA_ROUTES } from "@/constants";
import { LayoutContextProvider } from "@/contexts/LayoutContext";
import { AdminEventosPage } from "@/pages/AdminEventosPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { ConvidadoPage } from "@/pages/ConvidadoPage";
import ConvitePublicoPage from "@/pages/ConvitePublicoPage";
import { GestaoPaiPage } from "@/pages/GestaoPaiPage";
import { ImpersonateBridgePage } from "@/pages/ImpersonateBridgePage";
import { ParceiroB2bPlaceholderPage } from "@/pages/ParceiroB2bPlaceholderPage";
import { ParceiroLoginPage } from "@/pages/ParceiroLoginPage";
import { TelaoPage } from "@/pages/TelaoPage";
import { LayoutProvider } from "@/providers/LayoutProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LayoutContextProvider>
          <LayoutProvider>
            <Routes>
              <Route
                path={FESTA_ROUTES.HOME}
                element={<Navigate to={FESTA_ROUTES.DEMO_CONVIDADO} replace />}
              />
              <Route
                path={FESTA_ROUTES.LEGACY_ADMIN}
                element={<Navigate to={FESTA_ROUTES.ADMIN_DASHBOARD} replace />}
              />
              <Route
                path={FESTA_ROUTES.LEGACY_PARCEIRO}
                element={<Navigate to={FESTA_ROUTES.PARCEIRO_PORTAL} replace />}
              />
              <Route
                path={FESTA_ROUTES.EVENTO_CONVIDADO}
                element={<ConvidadoPage />}
              />
              <Route
                path={FESTA_ROUTES.EVENTO_CONVIDADO_CURTO}
                element={<ConvidadoPage />}
              />
              <Route
                path={FESTA_ROUTES.EVENTO_CONVITE}
                element={<ConvitePublicoPage />}
              />
              <Route
                path={FESTA_ROUTES.EVENTO_CONVITE_CURTO}
                element={<ConvitePublicoPage />}
              />
              <Route path={FESTA_ROUTES.EVENTO_TELAO} element={<TelaoPage />} />
              <Route
                path={FESTA_ROUTES.EVENTO_TELAO_CURTO}
                element={<TelaoPage />}
              />
              <Route
                path={FESTA_ROUTES.GESTAO_PAI}
                element={<GestaoPaiPage />}
              />
              <Route
                path={FESTA_ROUTES.LOGIN}
                element={<ParceiroLoginPage />}
              />
              <Route
                path={FESTA_ROUTES.ADMIN_LOGIN}
                element={<AdminLoginPage />}
              />
              <Route
                path={FESTA_ROUTES.ADMIN_DASHBOARD}
                element={<AdminEventosPage />}
              />
              <Route
                path={FESTA_ROUTES.PARCEIRO_LOGIN}
                element={<ParceiroLoginPage />}
              />
              <Route
                path={FESTA_ROUTES.IMPERSONATE_BRIDGE}
                element={<ImpersonateBridgePage />}
              />
              <Route
                path={FESTA_ROUTES.PARCEIRO_PORTAL}
                element={<ParceiroB2bPlaceholderPage />}
              />
              <Route
                path="*"
                element={<Navigate to={FESTA_ROUTES.DEMO_CONVIDADO} replace />}
              />
            </Routes>
            <Toaster position="top-center" richColors closeButton />
          </LayoutProvider>
        </LayoutContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
