import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Bookings from "@/pages/Bookings";
import Specialists from "@/pages/Specialists";
import Services from "@/pages/Services";
import Staff from "@/pages/Staff";
import Inventory from "@/pages/Inventory";
import Promotions from "@/pages/Promotions";
import Training from "@/pages/Training";
import Billing from "@/pages/Billing";
import Clients from "@/pages/Clients";
import Calendar from "@/pages/Calendar";
import PlatformAdmin from "@/pages/PlatformAdmin";
import Marketing from "@/pages/Marketing";
import Reviews from "@/pages/Reviews";
import Inbox from "@/pages/Inbox";
import Policies from "@/pages/Policies";
import Wallet from "@/pages/Wallet";
import StaffSchedule from "@/pages/StaffSchedule";
import Payroll from "@/pages/Payroll";
import PaymentSettings from "@/pages/PaymentSettings";
import Gallery from "@/pages/Gallery";

// Auth
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PendingApproval from "@/pages/PendingApproval";
import { useAuth } from "@/lib/auth";
import AiAdvisor from "@/components/AiAdvisor";

// Therapist Pages
import TherapistDashboard from "@/pages/therapist/TherapistDashboard";
import CustomerHistory from "@/pages/therapist/CustomerHistory";

// Onboarding
import SetupWizard from "@/pages/onboarding/SetupWizard";

const queryClient = new QueryClient();

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return (
      <Switch key={location}>
        <Route path="/register" component={Register} />
        <Route component={Login} />
      </Switch>
    );
  }

  if (user.role === 'THERAPIST') {
    return (
      <Layout>
        <Switch>
          <Route path="/" component={TherapistDashboard} />
          <Route path="/therapist" component={TherapistDashboard} />
          <Route path="/therapist/history" component={CustomerHistory} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    );
  }

  if (user.role === 'PLATFORM_ADMIN') {
    return (
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/platform" component={PlatformAdmin} />
          <Route path="/clients" component={Clients} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    );
  }

  // Gate SPA_OWNERs who are not APPROVED
  if (user.role === 'SPA_OWNER' && user.spaApprovalStatus !== 'APPROVED') {
    return (
      <Switch>
        <Route component={() => <PendingApproval status={user.spaApprovalStatus} />} />
      </Switch>
    );
  }

  // Gate SPA_OWNERs who have not completed setup
  // Demo accounts always bypass this — setup is for real production users only
  if (user.role === 'SPA_OWNER' && user.spaSetupComplete === false && !user.isDemo) {
    return (
      <Switch>
        <Route component={SetupWizard} />
      </Switch>
    );
  }

  return (
      <Layout>
        <Switch>
          {/* Owner/Manager/Receptionist Routes */}
          <Route path="/" component={Dashboard} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/specialists" component={Specialists} />
          <Route path="/staff" component={Staff} />
          <Route path="/staff-schedule" component={StaffSchedule} />
          <Route path="/payroll" component={Payroll} />
          <Route path="/services" component={Services} />
          <Route path="/promotions" component={Promotions} />
          <Route path="/training" component={Training} />
          <Route path="/billing" component={Billing} />
          <Route path="/clients" component={Clients} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/marketing" component={Marketing} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/inbox" component={Inbox} />
          <Route path="/policies" component={Policies} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/settings/payment" component={PaymentSettings} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/staff-schedule" component={StaffSchedule} />
          <Route component={NotFound} />
        </Switch>
      {/* AI Advisor floating widget — available on all pages */}
      <AiAdvisor />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
