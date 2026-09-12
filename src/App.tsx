import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { useSettingsStore } from './store/useSettingsStore';
import PageLayout from './components/layout/PageLayout';
import OnboardingPage from './features/onboarding/OnboardingPage';
import DashboardPage from './features/dashboard/DashboardPage';
import NewBudgetPage from './features/budget/NewBudgetPage';
import CategoryPage from './features/budget/CategoryPage';
import ServicePage from './features/budget/ServicePage';
import BudgetStepPage from './features/budget/BudgetStepPage';
import PricingPage from './features/budget/PricingPage';
import ResultPage from './features/budget/ResultPage';
import QuickBudgetPage from './features/quick/QuickBudgetPage';
import ProposalPage from './features/proposal/ProposalPage';
import ClientsPage from './features/clients/ClientsPage';
import MaterialsPage from './features/materials/MaterialsPage';
import WorksListPage from './features/works/WorksListPage';
import WorkDetailPage from './features/works/WorkDetailPage';
import SettingsPage from './features/settings/SettingsPage';
import BudgetsListPage from './features/budget/BudgetsListPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useSettingsStore((s) => s.user);
  if (!user?.name) return <OnboardingPage />;
  return <PageLayout>{children}</PageLayout>;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/new" element={<ProtectedRoute><NewBudgetPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
          <Route path="/services/:category" element={<ProtectedRoute><ServicePage /></ProtectedRoute>} />
          <Route path="/budget/:budgetId/step/:step" element={<ProtectedRoute><BudgetStepPage /></ProtectedRoute>} />
          <Route path="/budget/:budgetId/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
          <Route path="/budget/:budgetId/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
          <Route path="/budget/:budgetId/proposal" element={<ProtectedRoute><ProposalPage /></ProtectedRoute>} />
          <Route path="/quick" element={<ProtectedRoute><QuickBudgetPage /></ProtectedRoute>} />
          <Route path="/orcamentos" element={<ProtectedRoute><BudgetsListPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><MaterialsPage /></ProtectedRoute>} />
          <Route path="/works" element={<ProtectedRoute><WorksListPage /></ProtectedRoute>} />
          <Route path="/work/:executionId" element={<ProtectedRoute><WorkDetailPage /></ProtectedRoute>} />
          <Route path="/config" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
