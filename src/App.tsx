import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { MarketingLayout } from "@/components/MarketingLayout";
import { PlaygroundLayout } from "@/components/PlaygroundLayout";
import { isPlayground, getPlaygroundUrl } from "@/lib/subdomain";

import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";
import BillingPage from "@/pages/BillingPage";
import ScreenCandidatesPage from "@/pages/ScreenCandidatesPage";
import FeaturesPage from "@/pages/FeaturesPage";
import PricingPage from "@/pages/PricingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import DemoPage from "@/pages/DemoPage";
import JobsPage from "@/pages/JobsPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ScreeningHistoryPage from "@/pages/ScreeningHistoryPage";
import ScreeningHistoryListPage from "@/pages/ScreeningHistoryListPage";
import QuestionsPage from "@/pages/QuestionsPage";
import { AuthProvider } from "@/components/auth/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  const onPlayground = isPlayground();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background">
              <Routes>
                {onPlayground ? (
                  // Playground Routes
                  <>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes wrapped in PlaygroundLayout */}
                    <Route path="/dashboard" element={<PlaygroundLayout><DashboardPage /></PlaygroundLayout>} />
                    <Route path="/jobs" element={<PlaygroundLayout><JobsPage /></PlaygroundLayout>} />
                    <Route path="/jobs/:jobId" element={<PlaygroundLayout><JobDetailsPage /></PlaygroundLayout>} />
                    <Route path="/settings" element={<PlaygroundLayout><SettingsPage /></PlaygroundLayout>} />
                    <Route path="/billing" element={<PlaygroundLayout><BillingPage /></PlaygroundLayout>} />
                    <Route path="/screen-candidates" element={<PlaygroundLayout><ScreenCandidatesPage /></PlaygroundLayout>} />
                    <Route path="/screening-history/:runId" element={<PlaygroundLayout><ScreeningHistoryPage /></PlaygroundLayout>} />
                    <Route path="/screening-history" element={<PlaygroundLayout><ScreeningHistoryListPage /></PlaygroundLayout>} />
                    <Route path="/questions" element={<PlaygroundLayout><QuestionsPage /></PlaygroundLayout>} />

                    {/* Redirect root to dashboard (or login if handled by auth guard) */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* 404 for Playground */}
                    <Route path="*" element={<NotFoundPage />} />
                  </>
                ) : (
                  // Marketing Routes
                  <>
                    <Route path="/" element={<MarketingLayout><HomePage /></MarketingLayout>} />
                    <Route path="/features" element={<MarketingLayout><FeaturesPage /></MarketingLayout>} />
                    <Route path="/pricing" element={<MarketingLayout><PricingPage /></MarketingLayout>} />
                    <Route path="/about" element={<MarketingLayout><AboutPage /></MarketingLayout>} />
                    <Route path="/contact" element={<MarketingLayout><ContactPage /></MarketingLayout>} />
                      <Route path="/demo" element={<MarketingLayout><DemoPage /></MarketingLayout>} />

                      {/* Redirect login on main site to playground login */}
                      <Route path="/login" element={<NavigateConstant to={getPlaygroundUrl() + "/login"} />} />

                      {/* 404 for Marketing */}
                      <Route path="*" element={<NotFoundPage />} />
                  </>
                )}
              </Routes>
            </div>
            <Toaster position="bottom-right" richColors />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Helper for external redirect
const NavigateConstant = ({ to }: { to: string }) => {
  window.location.href = to;
  return null;
};

export default App;
