import type { HelpManual } from "@/features/help/types/help.types";

export const HELP_MANUALS: Record<string, HelpManual> = {
  home: {
    id: "home",
    title: "Home Page",
    summary: "Browse featured listings, learn how the platform works, and choose whether to buy or rent.",
    role: "public",
    steps: [
      {
        title: "Explore featured properties",
        description: "Scroll through highlighted homes for sale and rent. Click any card to open full details, photos, and contact options.",
        visual: "listing-card",
      },
      {
        title: "Choose your path",
        description: "On first visit, a welcome popup lets you pick Buy or Sell. You can dismiss it and browse freely — it won't block navigation.",
        tips: ["Use the top navigation to jump to Properties, Rentals, or Agents anytime."],
      },
      {
        title: "Find agents & news",
        description: "The Agents section lists licensed professionals. News keeps you updated on market trends and platform announcements.",
        visual: "sidebar-nav",
      },
    ],
    relatedLinks: [
      { label: "Browse for sale", href: "/properties" },
      { label: "Browse rentals", href: "/rentals" },
    ],
  },

  "properties-browse": {
    id: "properties-browse",
    title: "Properties for Sale",
    summary: "Search, filter, and map-search homes for sale.",
    role: "public",
    steps: [
      {
        title: "Search by location",
        description: "Type a city, address, or ZIP in the search bar. Results update to match your location text.",
        visual: "search-filters",
      },
      {
        title: "Open filters",
        description: "Use the Filters button for property type, beds/baths, price range, amenities, and more. Price starts at “Any price” until you adjust the slider.",
        visual: "search-filters",
        tips: ["Drag the price slider inward to set a min/max budget."],
      },
      {
        title: "Search by map",
        description: "Click Map search, drop a pin or search a place, optionally set a radius, then Apply. Listings within that area appear in results.",
        visual: "map-search",
      },
      {
        title: "View listing details",
        description: "Click a property card to see photos, specs, agent info, tour booking, favorites, and share options.",
        visual: "listing-card",
      },
    ],
  },

  "property-detail": {
    id: "property-detail",
    title: "Property Details",
    summary: "Review a listing, book a tour, favorite it, or message the agent.",
    role: "public",
    steps: [
      {
        title: "Browse photos & facts",
        description: "View the image gallery, price, beds/baths, square footage, amenities, and location map.",
        visual: "listing-card",
      },
      {
        title: "Book a tour",
        description: "Click Request Tour, pick a date and time, and submit. You'll track status in your dashboard under My Tours.",
        visual: "tour-booking",
      },
      {
        title: "Save & share",
        description: "Heart the listing to add it to Favorites (buyers). Use Share to copy a link for friends or family.",
        tips: ["Sign in as a buyer to save favorites and book tours."],
      },
      {
        title: "Contact the agent",
        description: "Use Contact Agent or Message to start a conversation about this property.",
        visual: "message-chat",
      },
    ],
  },

  "rentals-browse": {
    id: "rentals-browse",
    title: "Rentals Browse",
    summary: "Find rentals with map, filters, saved searches, and sort options.",
    role: "public",
    steps: [
      {
        title: "Split map & list view",
        description: "Rentals show on the left list and right map. Pan or zoom the map to search the visible area automatically.",
        visual: "map-browse",
      },
      {
        title: "Filter rentals",
        description: "Open filters for price/month, beds, baths, pets, laundry, parking, and move-in date. Price defaults to Any until you move the slider.",
        visual: "search-filters",
      },
      {
        title: "Save a search",
        description: "After setting filters, save your search to reuse later from Saved Rentals in your buyer dashboard.",
        tips: ["Saved searches remember location, price, and amenity filters."],
      },
      {
        title: "Map pin search",
        description: "Use Map search to pick a center point and radius, same as the sale browse page.",
        visual: "map-search",
      },
    ],
  },

  "rental-detail": {
    id: "rental-detail",
    title: "Rental Details",
    summary: "Review a rental, apply, save it, or schedule a tour.",
    role: "public",
    steps: [
      {
        title: "Check rental terms",
        description: "See monthly rent, deposit, pet policy, furnished status, laundry, and availability date.",
        visual: "listing-card",
      },
      {
        title: "Apply online",
        description: "Signed-in buyers can submit a rental application with income and reference details.",
        visual: "rental-apply",
      },
      {
        title: "Save & tour",
        description: "Bookmark the rental for later or request a showing through the tour flow.",
        visual: "tour-booking",
      },
    ],
  },

  agents: {
    id: "agents",
    title: "Find Agents",
    summary: "Browse agents, view profiles, ratings, and contact them.",
    role: "public",
    steps: [
      {
        title: "Browse agent cards",
        description: "Each card shows the agent's name, service area, rating, and specialties.",
        visual: "reviews",
      },
      {
        title: "Open agent profile",
        description: "Click an agent to see their bio, reviews, and assigned listings.",
      },
      {
        title: "Contact an agent",
        description: "Use Contact or Message to reach out about buying, selling, or renting.",
        visual: "message-chat",
      },
    ],
  },

  contact: {
    id: "contact",
    title: "Contact Us",
    summary: "Send a general inquiry to the platform team.",
    role: "public",
    steps: [
      {
        title: "Fill out the form",
        description: "Enter your name, email, subject, and message. Required fields are marked.",
        visual: "auth-form",
      },
      {
        title: "Submit & wait for reply",
        description: "You'll see a confirmation toast. Our team responds via email.",
      },
    ],
  },

  "contact-agent": {
    id: "contact-agent",
    title: "Contact Agent",
    summary: "Reach a specific agent about a property or general help.",
    role: "public",
    steps: [
      {
        title: "Complete the contact form",
        description: "Provide your details and message. If you arrived from a listing, context may be pre-filled.",
        visual: "message-chat",
      },
      {
        title: "Follow up in Messages",
        description: "After signing in, continue the conversation in your dashboard Messages section.",
      },
    ],
  },

  news: {
    id: "news",
    title: "News & Updates",
    summary: "Read market news and platform announcements.",
    role: "public",
    steps: [
      {
        title: "Browse articles",
        description: "Scroll through news cards with headlines, summaries, and publish dates.",
        visual: "listing-card",
      },
      {
        title: "Read full articles",
        description: "Click a card to expand or navigate to the full article content.",
      },
    ],
  },

  login: {
    id: "login",
    title: "Sign In",
    summary: "Log in to access your role-based dashboard.",
    role: "public",
    steps: [
      {
        title: "Enter credentials",
        description: "Use your registered email and password. Admins, buyers, sellers, and agents each land on their own dashboard.",
        visual: "auth-form",
      },
      {
        title: "Redirect after login",
        description: "If you came from a protected link (e.g. create listing), you'll return there automatically after signing in.",
        tips: ["Use Forgot Password if you can't access your account."],
      },
    ],
  },

  "forgot-password": {
    id: "forgot-password",
    title: "Reset Password",
    summary: "Request a password reset link by email.",
    role: "public",
    steps: [
      {
        title: "Submit your email",
        description: "Enter the email tied to your account and submit the reset request.",
        visual: "auth-form",
      },
      {
        title: "Check admin queue",
        description: "Admins process reset requests from the Password Resets dashboard section.",
      },
    ],
  },

  "buyer-dashboard": {
    id: "buyer-dashboard",
    title: "Buyer Dashboard",
    summary: "Your home base for favorites, tours, applications, and messages.",
    role: "buyer",
    steps: [
      {
        title: "Overview stats",
        description: "See counts for favorites, saved rentals, active tours, and unread messages at a glance.",
        visual: "dashboard-stats",
      },
      {
        title: "Quick navigation",
        description: "Use the left sidebar to jump to Rentals, Buy, Favorites, Applications, Tours, and Messages.",
        visual: "sidebar-nav",
      },
      {
        title: "Get help anytime",
        description: "Click the ? button at the bottom-right for page-specific guides, or open Help in the sidebar for all buyer features.",
        visual: "help-fab",
      },
    ],
    relatedLinks: [{ label: "Full buyer help center", href: "/buyer/help" }],
  },

  "buyer-favorites": {
    id: "buyer-favorites",
    title: "Favorites",
    summary: "Saved homes for sale you've hearted while browsing.",
    role: "buyer",
    steps: [
      {
        title: "View saved homes",
        description: "All properties you favorited appear here with photo, price, and location.",
        visual: "listing-card",
      },
      {
        title: "Open or remove",
        description: "Click a card to view details. Un-heart to remove from favorites.",
      },
    ],
  },

  "buyer-saved-rentals": {
    id: "buyer-saved-rentals",
    title: "Saved Rentals",
    summary: "Bookmarked rentals and saved search filters.",
    role: "buyer",
    steps: [
      {
        title: "Saved listings",
        description: "Rentals you bookmarked from browse or detail pages show here.",
        visual: "listing-card",
      },
      {
        title: "Saved searches",
        description: "Reuse filter combinations you saved from the Rentals browse page.",
        visual: "search-filters",
      },
    ],
  },

  "buyer-applications": {
    id: "buyer-applications",
    title: "Rental Applications",
    summary: "Track rental applications you've submitted.",
    role: "buyer",
    steps: [
      {
        title: "View application status",
        description: "Each row shows the rental, submission date, and status (pending, approved, rejected).",
        visual: "table-actions",
      },
      {
        title: "Apply from rental pages",
        description: "Submit new applications from any rental detail page while signed in.",
        visual: "rental-apply",
      },
    ],
  },

  "buyer-tours": {
    id: "buyer-tours",
    title: "My Tours",
    summary: "Manage property tour requests and confirmations.",
    role: "buyer",
    steps: [
      {
        title: "Tour list",
        description: "See upcoming, pending, and past tours with property name, date, and status.",
        visual: "tour-booking",
      },
      {
        title: "Tour details",
        description: "Click a tour to view full details, agent contact, and leave feedback after completion.",
      },
    ],
  },

  "buyer-messages": {
    id: "buyer-messages",
    title: "Messages",
    summary: "Chat with agents and sellers.",
    role: "buyer",
    steps: [
      {
        title: "Conversation list",
        description: "Select a thread from the left panel. Unread threads are highlighted.",
        visual: "message-chat",
      },
      {
        title: "Send messages",
        description: "Type in the input box and press Send. Messages sync in real time when connected.",
        tips: ["Start chats from property detail pages or agent profiles."],
      },
    ],
  },

  "buyer-alerts": {
    id: "buyer-alerts",
    title: "Alerts",
    summary: "Notifications about tours, applications, and listing updates.",
    role: "buyer",
    steps: [
      {
        title: "Review notifications",
        description: "Alerts appear chronologically with type icons and short descriptions.",
        visual: "dashboard-stats",
      },
      {
        title: "Act on alerts",
        description: "Click an alert to jump to the related tour, message, or listing when available.",
      },
    ],
  },

  "buyer-settings": {
    id: "buyer-settings",
    title: "Buyer Settings",
    summary: "Update profile, password, and preferences.",
    role: "buyer",
    steps: [
      {
        title: "Profile info",
        description: "Edit name, phone, avatar, and contact details.",
        visual: "auth-form",
      },
      {
        title: "Distance units",
        description: "Switch between miles and kilometers for map search radius display.",
        tips: ["Changes apply across browse and map search pages."],
      },
    ],
  },

  "seller-dashboard": {
    id: "seller-dashboard",
    title: "Seller Dashboard",
    summary: "Monitor listings, tours, buyers, and performance.",
    role: "seller",
    steps: [
      {
        title: "Dashboard overview",
        description: "View listing counts, pending tours, buyer leads, and recent activity.",
        visual: "dashboard-stats",
      },
      {
        title: "Market tabs",
        description: "Switch between Sale and Rental tabs to filter dashboard stats by listing type.",
      },
      {
        title: "Sidebar shortcuts",
        description: "Jump to Listings, Promotions, Buyers CRM, Applications, Tours, Analytics, and Messages.",
        visual: "sidebar-nav",
      },
    ],
    relatedLinks: [{ label: "Full seller help center", href: "/seller/help" }],
  },

  "seller-listings": {
    id: "seller-listings",
    title: "My Listings",
    summary: "Manage your active, pending, and draft property listings.",
    role: "seller",
    steps: [
      {
        title: "Listing table",
        description: "See all your properties with status, price, type, and quick actions.",
        visual: "table-actions",
      },
      {
        title: "Add a listing",
        description: "Click Add Listing to open the creation form with map pin, photos, and details.",
        visual: "listing-form",
      },
      {
        title: "Edit or promote",
        description: "Edit existing listings or request a promotion campaign for more visibility.",
        visual: "promotion",
      },
    ],
  },

  "seller-add-listing": {
    id: "seller-add-listing",
    title: "Create / Edit Listing",
    summary: "Publish a sale or rental listing with map location and photos.",
    role: "seller",
    steps: [
      {
        title: "Basic details",
        description: "Enter title, description, price, beds, baths, square footage, and listing type (sale/rent).",
        visual: "listing-form",
      },
      {
        title: "Set map location",
        description: "Search an address or click the map to drop a pin. Valid coordinates are required for map search visibility.",
        visual: "map-search",
        tips: ["Listings without a map pin won't appear in map area searches."],
      },
      {
        title: "Upload photos & publish",
        description: "Add at least one image, select amenities, then save. New listings may require admin approval.",
      },
    ],
  },

  "seller-promotions": {
    id: "seller-promotions",
    title: "Promotions & Ads",
    summary: "Request sponsored placement for your listings.",
    role: "seller",
    steps: [
      {
        title: "Request a campaign",
        description: "Choose a listing, promotion type (Sponsored or Ad), duration, and payment details.",
        visual: "promotion",
      },
      {
        title: "Track status",
        description: "Campaigns start as Pending until admin approves and charges. Active campaigns show badges on listings.",
        tips: ["Promoted listings sort higher in browse results."],
      },
    ],
  },

  "seller-buyers": {
    id: "seller-buyers",
    title: "Buyers CRM",
    summary: "Track buyer leads and conversations.",
    role: "seller",
    steps: [
      {
        title: "Lead pipeline",
        description: "Organize buyers by stage — new, active, and closed.",
        visual: "crm-board",
      },
      {
        title: "Buyer details",
        description: "Open a buyer to see contact info, interested properties, notes, and message history.",
        visual: "message-chat",
      },
    ],
  },

  "seller-applications": {
    id: "seller-applications",
    title: "Rental Applications",
    summary: "Review applications for your rental listings.",
    role: "seller",
    steps: [
      {
        title: "Incoming applications",
        description: "See applicant name, rental, income info, and submission date.",
        visual: "rental-apply",
      },
      {
        title: "Approve or reject",
        description: "Update application status. Applicants are notified of your decision.",
        visual: "table-actions",
      },
    ],
  },

  "seller-tours": {
    id: "seller-tours",
    title: "Tour Requests",
    summary: "Manage showing requests for your listings.",
    role: "seller",
    steps: [
      {
        title: "Pending requests",
        description: "Review new tour requests with proposed dates and buyer info.",
        visual: "tour-booking",
      },
      {
        title: "Confirm or decline",
        description: "Accept tours to add them to the calendar, or decline with optional follow-up via Messages.",
      },
    ],
  },

  "seller-reviews": {
    id: "seller-reviews",
    title: "Feedback",
    summary: "View ratings and reviews from buyers and tour guests.",
    role: "seller",
    steps: [
      {
        title: "Review list",
        description: "See star ratings, comments, and linked properties or tours.",
        visual: "reviews",
      },
      {
        title: "Filter by rating",
        description: "Use rating filters to focus on recent or lower-scored feedback.",
      },
    ],
  },

  "seller-analytics": {
    id: "seller-analytics",
    title: "Analytics",
    summary: "Track views, inquiries, and listing performance.",
    role: "seller",
    steps: [
      {
        title: "Performance charts",
        description: "View trends for views, favorites, and inquiries over time.",
        visual: "dashboard-stats",
      },
      {
        title: "Per-listing breakdown",
        description: "Compare which listings get the most engagement.",
      },
    ],
  },

  "seller-messages": {
    id: "seller-messages",
    title: "Messages",
    summary: "Communicate with buyers and agents.",
    role: "seller",
    steps: [
      {
        title: "Inbox",
        description: "Select conversations from the left panel.",
        visual: "message-chat",
      },
      {
        title: "Reply promptly",
        description: "Respond to buyer inquiries to improve conversion and CRM status.",
      },
    ],
  },

  "seller-settings": {
    id: "seller-settings",
    title: "Seller Settings",
    summary: "Manage account and listing preferences.",
    role: "seller",
    steps: [
      {
        title: "Profile & security",
        description: "Update personal info and password.",
        visual: "auth-form",
      },
    ],
  },

  "agent-dashboard": {
    id: "agent-dashboard",
    title: "Agent Dashboard",
    summary: "Overview of clients, properties, tours, and performance.",
    role: "agent",
    steps: [
      {
        title: "At-a-glance metrics",
        description: "See assigned properties, upcoming tours, client count, and messages.",
        visual: "dashboard-stats",
      },
      {
        title: "Navigate features",
        description: "Use the sidebar for Clients, Properties, Calendar, Promotions, and Performance.",
        visual: "sidebar-nav",
      },
    ],
    relatedLinks: [{ label: "Full agent help center", href: "/agent/help" }],
  },

  "agent-clients": {
    id: "agent-clients",
    title: "Clients CRM",
    summary: "Manage buyer and seller client relationships.",
    role: "agent",
    steps: [
      {
        title: "Client pipeline",
        description: "Track clients across new, active, and closed stages.",
        visual: "crm-board",
      },
      {
        title: "Client profile",
        description: "View preferences, linked properties, and message history.",
        visual: "message-chat",
      },
    ],
  },

  "agent-properties": {
    id: "agent-properties",
    title: "Assigned Properties",
    summary: "Manage listings assigned to you by sellers or admin.",
    role: "agent",
    steps: [
      {
        title: "Property list",
        description: "See all assigned listings with status and viewership controls.",
        visual: "listing-card",
      },
      {
        title: "Pause viewership",
        description: "Toggle public visibility off temporarily when a showing isn't available or the listing is under contract.",
        visual: "table-actions",
        tips: ["Paused listings are hidden from public browse and map search."],
      },
    ],
  },

  "agent-applications": {
    id: "agent-applications",
    title: "Rental Applications",
    summary: "Review applications for assigned rental properties.",
    role: "agent",
    steps: [
      {
        title: "Application queue",
        description: "Review pending applications with applicant details.",
        visual: "rental-apply",
      },
      {
        title: "Update status",
        description: "Approve or reject and coordinate with the seller/landlord.",
        visual: "table-actions",
      },
    ],
  },

  "agent-calendar": {
    id: "agent-calendar",
    title: "Calendar",
    summary: "View and manage scheduled tours and appointments.",
    role: "agent",
    steps: [
      {
        title: "Monthly view",
        description: "See tour dates highlighted on the calendar grid.",
        visual: "calendar",
      },
      {
        title: "Tour details",
        description: "Click a date to see scheduled showings and property info.",
      },
    ],
  },

  "agent-tours": {
    id: "agent-tours",
    title: "Tours",
    summary: "Handle tour requests for assigned listings.",
    role: "agent",
    steps: [
      {
        title: "Request inbox",
        description: "Pending tour requests appear at the top.",
        visual: "tour-booking",
      },
      {
        title: "Confirm showings",
        description: "Accept or propose alternate times, then coordinate via Messages.",
      },
    ],
  },

  "agent-reviews": {
    id: "agent-reviews",
    title: "Feedback",
    summary: "Client and tour guest reviews for your service.",
    role: "agent",
    steps: [
      {
        title: "Ratings overview",
        description: "Your average rating and individual review comments.",
        visual: "reviews",
      },
    ],
  },

  "agent-performance": {
    id: "agent-performance",
    title: "Performance",
    summary: "Metrics on tours, conversions, and client activity.",
    role: "agent",
    steps: [
      {
        title: "KPI cards",
        description: "Track tours completed, active clients, and response rates.",
        visual: "dashboard-stats",
      },
    ],
  },

  "agent-promotions": {
    id: "agent-promotions",
    title: "Promotions",
    summary: "Request ad campaigns for assigned listings.",
    role: "agent",
    steps: [
      {
        title: "Campaign requests",
        description: "Submit promotion requests on behalf of sellers.",
        visual: "promotion",
      },
    ],
  },

  "agent-messages": {
    id: "agent-messages",
    title: "Messages",
    summary: "Chat with clients, buyers, and sellers.",
    role: "agent",
    steps: [
      {
        title: "Unified inbox",
        description: "All conversations in one place with real-time updates.",
        visual: "message-chat",
      },
    ],
  },

  "agent-settings": {
    id: "agent-settings",
    title: "Agent Settings",
    summary: "Profile, service area, and account settings.",
    role: "agent",
    steps: [
      {
        title: "Public profile",
        description: "Update bio, avatar, and contact info shown on the Agents page.",
        visual: "auth-form",
      },
    ],
  },

  "admin-dashboard": {
    id: "admin-dashboard",
    title: "Admin Dashboard",
    summary: "Platform overview — users, listings, tours, and moderation queue.",
    role: "admin",
    steps: [
      {
        title: "System overview",
        description: "Monitor totals for users, properties, tours, and pending approvals.",
        visual: "dashboard-stats",
      },
      {
        title: "Quick approvals",
        description: "Jump to pending properties and users from dashboard cards.",
        visual: "table-actions",
      },
    ],
    relatedLinks: [{ label: "Full admin help center", href: "/admin/help" }],
  },

  "admin-users": {
    id: "admin-users",
    title: "User Management",
    summary: "Browse, approve, and manage all platform users.",
    role: "admin",
    steps: [
      {
        title: "User table",
        description: "Filter by role and status. Click a user to review their full profile.",
        visual: "table-actions",
      },
      {
        title: "Approve or suspend",
        description: "Activate pending accounts or restrict access for moderation.",
      },
    ],
  },

  "admin-user-review": {
    id: "admin-user-review",
    title: "Review User",
    summary: "Detailed user review and approval actions.",
    role: "admin",
    steps: [
      {
        title: "Profile review",
        description: "Verify identity details, role assignment, and account history.",
        visual: "auth-form",
      },
      {
        title: "Take action",
        description: "Approve, reject, or change role/status as needed.",
        visual: "table-actions",
      },
    ],
  },

  "admin-properties": {
    id: "admin-properties",
    title: "Property Management",
    summary: "Review and manage all platform listings.",
    role: "admin",
    steps: [
      {
        title: "Listing queue",
        description: "Filter by status — pending listings need your approval before going live.",
        visual: "table-actions",
      },
      {
        title: "Assign agents",
        description: "Link listings to agents for client management.",
      },
    ],
  },

  "admin-property-review": {
    id: "admin-property-review",
    title: "Review Property",
    summary: "Approve or reject a submitted listing.",
    role: "admin",
    steps: [
      {
        title: "Verify listing data",
        description: "Check photos, price, location pin, and description for policy compliance.",
        visual: "listing-form",
      },
      {
        title: "Approve or reject",
        description: "Approved listings become visible on browse pages and map search.",
        visual: "table-actions",
      },
    ],
  },

  "admin-partners": {
    id: "admin-partners",
    title: "Partners",
    summary: "Manage partner organizations and relationships.",
    role: "admin",
    steps: [
      {
        title: "Partner list",
        description: "View partner details and linked users.",
        visual: "crm-board",
      },
    ],
  },

  "admin-ad-campaigns": {
    id: "admin-ad-campaigns",
    title: "Ad Campaigns",
    summary: "Approve, charge, and manage listing promotions.",
    role: "admin",
    steps: [
      {
        title: "Pending campaigns",
        description: "Review promotion requests with listing, duration, and payment info.",
        visual: "promotion",
      },
      {
        title: "Approve & activate",
        description: "Approve to charge and activate badges. Campaigns auto-expire after the paid period.",
        visual: "table-actions",
      },
    ],
  },

  "admin-tours": {
    id: "admin-tours",
    title: "Tours",
    summary: "Oversee all tour requests platform-wide.",
    role: "admin",
    steps: [
      {
        title: "Tour oversight",
        description: "View all tours with status, property, buyer, and agent.",
        visual: "tour-booking",
      },
    ],
  },

  "tour-detail": {
    id: "tour-detail",
    title: "Tour Details",
    summary: "View and manage a single tour appointment.",
    role: "public",
    steps: [
      {
        title: "Tour information",
        description: "See property, date/time, participants, and current status.",
        visual: "tour-booking",
      },
      {
        title: "Actions by role",
        description: "Buyers can cancel; agents/sellers confirm or reschedule; admins can override status.",
      },
    ],
  },

  "admin-reviews": {
    id: "admin-reviews",
    title: "Feedback Moderation",
    summary: "Review platform feedback and ratings.",
    role: "admin",
    steps: [
      {
        title: "All reviews",
        description: "Browse reviews with filters for rating and report status.",
        visual: "reviews",
      },
    ],
  },

  "admin-analytics": {
    id: "admin-analytics",
    title: "Platform Analytics",
    summary: "Site-wide metrics and trends.",
    role: "admin",
    steps: [
      {
        title: "Global metrics",
        description: "Users, listings, tours, and engagement over time.",
        visual: "dashboard-stats",
      },
    ],
  },

  "admin-moderation": {
    id: "admin-moderation",
    title: "Moderation",
    summary: "Handle reported content and policy violations.",
    role: "admin",
    steps: [
      {
        title: "Report queue",
        description: "Review flagged listings, messages, or reviews.",
        visual: "table-actions",
      },
    ],
  },

  "admin-password-resets": {
    id: "admin-password-resets",
    title: "Password Resets",
    summary: "Process user password reset requests.",
    role: "admin",
    steps: [
      {
        title: "Reset queue",
        description: "Approve or deny reset requests submitted from the Forgot Password page.",
        visual: "table-actions",
      },
    ],
  },

  "admin-messages": {
    id: "admin-messages",
    title: "Messages",
    summary: "Monitor or participate in platform conversations.",
    role: "admin",
    steps: [
      {
        title: "Message oversight",
        description: "View conversations for support and moderation.",
        visual: "message-chat",
      },
    ],
  },

  "admin-settings": {
    id: "admin-settings",
    title: "Admin Settings",
    summary: "Platform configuration and admin account settings.",
    role: "admin",
    steps: [
      {
        title: "System settings",
        description: "Configure platform-wide options and admin profile.",
        visual: "auth-form",
      },
    ],
  },

  "dashboard-help": {
    id: "dashboard-help",
    title: "Help Center",
    summary: "Browse manuals for every feature in your dashboard.",
    role: "public",
    steps: [
      {
        title: "Feature manuals",
        description: "Expand any topic below to read step-by-step instructions with visual guides.",
        visual: "help-fab",
      },
      {
        title: "Page-specific help",
        description: "On any page, click the floating ? button at the bottom-right for a guide focused on that screen.",
        visual: "help-fab",
      },
    ],
  },

  "generic-page": {
    id: "generic-page",
    title: "Page Help",
    summary: "Quick tips for using this page.",
    role: "public",
    steps: [
      {
        title: "Navigation",
        description: "Use the top menu or dashboard sidebar to move between sections.",
        visual: "sidebar-nav",
      },
      {
        title: "Need more help?",
        description: "Open the Help section in your dashboard for complete feature manuals, or visit Contact Us.",
        visual: "help-fab",
      },
    ],
  },
};

export const ROLE_HELP_ORDER: Record<string, string[]> = {
  admin: [
    "admin-dashboard",
    "admin-users",
    "admin-user-review",
    "admin-partners",
    "admin-properties",
    "admin-property-review",
    "admin-ad-campaigns",
    "admin-tours",
    "tour-detail",
    "admin-reviews",
    "admin-analytics",
    "admin-moderation",
    "admin-password-resets",
    "admin-messages",
    "admin-settings",
    "properties-browse",
    "rentals-browse",
  ],
  buyer: [
    "buyer-dashboard",
    "buyer-favorites",
    "buyer-saved-rentals",
    "buyer-applications",
    "buyer-tours",
    "tour-detail",
    "buyer-messages",
    "buyer-alerts",
    "buyer-settings",
    "properties-browse",
    "property-detail",
    "rentals-browse",
    "rental-detail",
  ],
  seller: [
    "seller-dashboard",
    "seller-listings",
    "seller-add-listing",
    "seller-promotions",
    "seller-buyers",
    "seller-applications",
    "seller-tours",
    "tour-detail",
    "seller-reviews",
    "seller-analytics",
    "seller-messages",
    "seller-settings",
  ],
  agent: [
    "agent-dashboard",
    "agent-clients",
    "agent-properties",
    "agent-promotions",
    "agent-applications",
    "agent-tours",
    "tour-detail",
    "agent-calendar",
    "agent-reviews",
    "agent-performance",
    "agent-messages",
    "agent-settings",
  ],
};
