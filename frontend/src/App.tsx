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
import Contact from "./pages/Contact";
import ContactAgent from "./pages/ContactAgent";
import News from "./pages/News";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import SellerListings from "./pages/SellerListings";
import SellerAddListing from "./pages/SellerAddListing";
import SellerTours from "./pages/SellerTours";
import SellerAnalytics from "./pages/SellerAnalytics";
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
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { getErrorMessage } from "./lib/api-error";
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
import AgentClients from "./pages/AgentClients";
import AgentProperties from "./pages/AgentProperties";
import AgentCalendar from "./pages/AgentCalendar";
import AgentPerformance from "./pages/AgentPerformance";
import AgentMessages from "./pages/AgentMessages";
import AgentSettings from "./pages/AgentSettings";
import TourDetail from "./pages/TourDetail";
import AdminReviews from "./pages/AdminReviews";
import AgentReviews from "./pages/AgentReviews";
import { AgentRouteGuard } from "./components/agent/AgentRouteGuard";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => toast.error(getErrorMessage(error)),
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
      <SocketProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact-agent" element={<ContactAgent />} />
            <Route path="/news" element={<News />} />
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
            <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>} />

            <Route path="/buyer" element={<ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/buyer/favorites" element={<ProtectedRoute roles={["buyer"]}><BuyerFavorites /></ProtectedRoute>} />
            <Route path="/buyer/tours" element={<ProtectedRoute roles={["buyer"]}><BuyerTours /></ProtectedRoute>} />
            <Route path="/buyer/tours/:id" element={<ProtectedRoute roles={["buyer"]}><TourDetail /></ProtectedRoute>} />
            <Route path="/buyer/messages" element={<ProtectedRoute roles={["buyer"]}><BuyerMessages /></ProtectedRoute>} />
            <Route path="/buyer/alerts" element={<ProtectedRoute roles={["buyer"]}><BuyerAlerts /></ProtectedRoute>} />
            <Route path="/buyer/settings" element={<ProtectedRoute roles={["buyer"]}><BuyerSettings /></ProtectedRoute>} />

            <Route path="/seller" element={<ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/seller/listings" element={<ProtectedRoute roles={["seller"]}><SellerListings /></ProtectedRoute>} />
            <Route path="/seller/listings/new" element={<ProtectedRoute roles={["seller"]}><SellerAddListing /></ProtectedRoute>} />
            <Route path="/seller/tours" element={<ProtectedRoute roles={["seller"]}><SellerTours /></ProtectedRoute>} />
            <Route path="/seller/tours/:id" element={<ProtectedRoute roles={["seller"]}><TourDetail /></ProtectedRoute>} />
            <Route path="/seller/analytics" element={<ProtectedRoute roles={["seller"]}><SellerAnalytics /></ProtectedRoute>} />
            <Route path="/seller/messages" element={<ProtectedRoute roles={["seller"]}><SellerMessages /></ProtectedRoute>} />
            <Route path="/seller/settings" element={<ProtectedRoute roles={["seller"]}><SellerSettings /></ProtectedRoute>} />

            <Route path="/agent" element={<ProtectedRoute roles={["agent"]}><AgentDashboard /></ProtectedRoute>} />
            <Route path="/agent/clients" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><AgentClients /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="/agent/properties" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><AgentProperties /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="/agent/calendar" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><AgentCalendar /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="/agent/tours" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><SellerTours /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="/agent/tours/:id" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><TourDetail /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="/agent/reviews" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><AgentReviews /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="/agent/performance" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><AgentPerformance /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="/agent/messages" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><AgentMessages /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="/agent/settings" element={<ProtectedRoute roles={["agent"]}><AgentRouteGuard><AgentSettings /></AgentRouteGuard></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
