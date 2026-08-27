import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import Contact from "./pages/Contact";
import ContactAgent from "./pages/ContactAgent";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import SellerListings from "./pages/SellerListings";
import SellerAddListing from "./pages/SellerAddListing";
import SellerTours from "./pages/SellerTours";
import SellerAnalytics from "./pages/SellerAnalytics";
import SellerReviews from "./pages/SellerReviews";
import SellerMessages from "./pages/SellerMessages";
import SellerSettings from "./pages/SellerSettings";
import AgentDashboard from "./pages/AgentDashboard";
import BuyerFavorites from "./pages/BuyerFavorites";
import BuyerTours from "./pages/BuyerTours";
import BuyerMessages from "./pages/BuyerMessages";
import BuyerAlerts from "./pages/BuyerAlerts";
import BuyerSettings from "./pages/BuyerSettings";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { DistanceUnitProvider } from "./context/DistanceUnitContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { getErrorMessage } from "./lib/api-error";
import { ApiError } from "./types/api";
import AdminUsers from "./pages/AdminUsers";
import AdminProperties from "./pages/AdminProperties";
import AdminTours from "./pages/AdminTours";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminModeration from "./pages/AdminModeration";
import AdminPasswordResets from "./pages/AdminPasswordResets";
import AdminPropertyReview from "./pages/AdminPropertyReview";
import AdminUserReview from "./pages/AdminUserReview";
import AdminMessages from "./pages/AdminMessages";
import AdminSettings from "./pages/AdminSettings";
import AgentProperties from "./pages/AgentProperties";
import AgentCalendar from "./pages/AgentCalendar";
import AgentPerformance from "./pages/AgentPerformance";
import AgentMessages from "./pages/AgentMessages";
import AgentSettings from "./pages/AgentSettings";
import TourDetail from "./pages/TourDetail";
import RentalsBrowse from "./pages/RentalsBrowse";
import RentalDetail from "./pages/RentalDetail";
import SavedRentals from "./pages/SavedRentals";
import AdminReviews from "./pages/AdminReviews";
import RentalApplications from "./pages/RentalApplications";
import AgentReviews from "./pages/AgentReviews";
import BuyerCrm from "./pages/BuyerCrm";
import AdminPartners from "./pages/AdminPartners";
import AdCampaigns from "./pages/AdCampaigns";
import AdminAdCampaigns from "./pages/AdminAdCampaigns";
import AdminNews from "./pages/AdminNews";
import { WelcomeIntentDialog } from "./components/landing/WelcomeIntentDialog";
import { GlobalPageHelp } from "./features/help/components/GlobalPageHelp";
import DashboardHelp from "./pages/DashboardHelp";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.suppressErrorToast) return;
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => toast.error(getErrorMessage(error)),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DistanceUnitProvider>
      <SocketProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <WelcomeIntentDialog />
          <GlobalPageHelp />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/rentals" element={<RentalsBrowse />} />
            <Route path="/rentals/:id" element={<RentalDetail />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact-agent" element={<ContactAgent />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/users/:id" element={<ProtectedRoute roles={["admin"]}><AdminUserReview /></ProtectedRoute>} />
            <Route path="/admin/properties" element={<ProtectedRoute roles={["admin"]}><AdminProperties /></ProtectedRoute>} />
            <Route path="/admin/properties/:id" element={<ProtectedRoute roles={["admin"]}><AdminPropertyReview /></ProtectedRoute>} />
            <Route path="/admin/tours" element={<ProtectedRoute roles={["admin"]}><AdminTours /></ProtectedRoute>} />
            <Route path="/admin/tours/:id" element={<ProtectedRoute roles={["admin"]}><TourDetail /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute roles={["admin"]}><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute roles={["admin"]}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/moderation" element={<ProtectedRoute roles={["admin"]}><AdminModeration /></ProtectedRoute>} />
            <Route path="/admin/password-resets" element={<ProtectedRoute roles={["admin"]}><AdminPasswordResets /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute roles={["admin"]}><AdminMessages /></ProtectedRoute>} />
            <Route path="/admin/partners" element={<ProtectedRoute roles={["admin"]}><AdminPartners /></ProtectedRoute>} />
            <Route path="/admin/ad-campaigns" element={<ProtectedRoute roles={["admin"]}><AdminAdCampaigns /></ProtectedRoute>} />
            <Route path="/admin/news" element={<ProtectedRoute roles={["admin"]}><AdminNews /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/help" element={<ProtectedRoute roles={["admin"]}><DashboardHelp role="admin" /></ProtectedRoute>} />

            <Route path="/buyer" element={<ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/buyer/favorites" element={<ProtectedRoute roles={["buyer"]}><BuyerFavorites /></ProtectedRoute>} />
            <Route path="/buyer/saved-rentals" element={<ProtectedRoute roles={["buyer"]}><SavedRentals /></ProtectedRoute>} />
            <Route path="/buyer/applications" element={<ProtectedRoute roles={["buyer"]}><RentalApplications mode="buyer" /></ProtectedRoute>} />
            <Route path="/buyer/tours" element={<ProtectedRoute roles={["buyer"]}><BuyerTours /></ProtectedRoute>} />
            <Route path="/buyer/tours/:id" element={<ProtectedRoute roles={["buyer"]}><TourDetail /></ProtectedRoute>} />
            <Route path="/buyer/messages" element={<ProtectedRoute roles={["buyer"]}><BuyerMessages /></ProtectedRoute>} />
            <Route path="/buyer/alerts" element={<ProtectedRoute roles={["buyer"]}><BuyerAlerts /></ProtectedRoute>} />
            <Route path="/buyer/settings" element={<ProtectedRoute roles={["buyer"]}><BuyerSettings /></ProtectedRoute>} />
            <Route path="/buyer/help" element={<ProtectedRoute roles={["buyer"]}><DashboardHelp role="buyer" /></ProtectedRoute>} />

            <Route path="/seller" element={<ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/seller/listings" element={<ProtectedRoute roles={["seller"]}><SellerListings /></ProtectedRoute>} />
            <Route path="/seller/listings/new" element={<ProtectedRoute roles={["seller"]}><SellerAddListing /></ProtectedRoute>} />
            <Route path="/seller/listings/:id/edit" element={<ProtectedRoute roles={["seller"]}><SellerAddListing /></ProtectedRoute>} />
            <Route path="/seller/applications" element={<ProtectedRoute roles={["seller"]}><RentalApplications mode="seller" /></ProtectedRoute>} />
            <Route path="/seller/buyers" element={<ProtectedRoute roles={["seller"]}><BuyerCrm role="seller" sidebarActive="Buyers" messagePath="/seller/messages" /></ProtectedRoute>} />
            <Route path="/seller/tours" element={<ProtectedRoute roles={["seller"]}><SellerTours /></ProtectedRoute>} />
            <Route path="/seller/tours/:id" element={<ProtectedRoute roles={["seller"]}><TourDetail /></ProtectedRoute>} />
            <Route path="/seller/reviews" element={<ProtectedRoute roles={["seller"]}><SellerReviews /></ProtectedRoute>} />
            <Route path="/seller/analytics" element={<ProtectedRoute roles={["seller"]}><SellerAnalytics /></ProtectedRoute>} />
            <Route path="/seller/promotions" element={<ProtectedRoute roles={["seller"]}><AdCampaigns role="seller" /></ProtectedRoute>} />
            <Route path="/seller/messages" element={<ProtectedRoute roles={["seller"]}><SellerMessages /></ProtectedRoute>} />
            <Route path="/seller/settings" element={<ProtectedRoute roles={["seller"]}><SellerSettings /></ProtectedRoute>} />
            <Route path="/seller/help" element={<ProtectedRoute roles={["seller"]}><DashboardHelp role="seller" /></ProtectedRoute>} />

            <Route path="/agent" element={<ProtectedRoute roles={["agent"]}><AgentDashboard /></ProtectedRoute>} />
            <Route path="/agent/clients" element={<ProtectedRoute roles={["agent"]}><BuyerCrm role="agent" sidebarActive="Clients" messagePath="/agent/messages" /></ProtectedRoute>} />
            <Route path="/agent/properties" element={<ProtectedRoute roles={["agent"]}><AgentProperties /></ProtectedRoute>} />
            <Route path="/agent/applications" element={<ProtectedRoute roles={["agent"]}><RentalApplications mode="agent" /></ProtectedRoute>} />
            <Route path="/agent/calendar" element={<ProtectedRoute roles={["agent"]}><AgentCalendar /></ProtectedRoute>} />
            <Route path="/agent/tours" element={<ProtectedRoute roles={["agent"]}><SellerTours /></ProtectedRoute>} />
            <Route path="/agent/tours/:id" element={<ProtectedRoute roles={["agent"]}><TourDetail /></ProtectedRoute>} />
            <Route path="/agent/reviews" element={<ProtectedRoute roles={["agent"]}><AgentReviews /></ProtectedRoute>} />
            <Route path="/agent/performance" element={<ProtectedRoute roles={["agent"]}><AgentPerformance /></ProtectedRoute>} />
            <Route path="/agent/promotions" element={<ProtectedRoute roles={["agent"]}><AdCampaigns role="agent" /></ProtectedRoute>} />
            <Route path="/agent/messages" element={<ProtectedRoute roles={["agent"]}><AgentMessages /></ProtectedRoute>} />
            <Route path="/agent/settings" element={<ProtectedRoute roles={["agent"]}><AgentSettings /></ProtectedRoute>} />
            <Route path="/agent/help" element={<ProtectedRoute roles={["agent"]}><DashboardHelp role="agent" /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </SocketProvider>
      </DistanceUnitProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
