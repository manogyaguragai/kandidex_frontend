import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { MarketingLayout } from "@/components/MarketingLayout";

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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background">
              {/* Navbar is handled inside Layout for protected pages or globally if appropriately conditionally rendered */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MarketingLayout><HomePage /></MarketingLayout>} />
                <Route path="/features" element={<MarketingLayout><FeaturesPage /></MarketingLayout>} />
                <Route path="/pricing" element={<MarketingLayout><PricingPage /></MarketingLayout>} />
                <Route path="/about" element={<MarketingLayout><AboutPage /></MarketingLayout>} />
                <Route path="/contact" element={<MarketingLayout><ContactPage /></MarketingLayout>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/demo" element={<MarketingLayout><DemoPage /></MarketingLayout>} />

                {/* Protected Routes (Layout is applied inside these pages components or should be wrapped here) */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/screen-candidates" element={<ScreenCandidatesPage />} />
                <Route path="/screening-history/:runId" element={<ScreeningHistoryPage />} />
                <Route path="/screening-history" element={<ScreeningHistoryListPage />} />
                <Route path="/questions" element={<QuestionsPage />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            <Toaster position="bottom-right" richColors />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
