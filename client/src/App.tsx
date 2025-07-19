import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";
import Home from "./pages/Home";
import ContactPage from "./pages/ContactPage";
import CustomizePage from "./pages/CustomizePage";
import TShirtDesignerDemo from "./pages/TShirtDesignerDemo";
import ProductsPage from "./pages/ProductsPage";
import AdminPage from "./pages/AdminPage"; // Changed from AdminDashboard to AdminPage
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnimeMascot from "./components/AnimeMascot";
import { AuthProvider } from "./contexts/AuthContext";
import { PurchaseProvider } from "./contexts/PurchaseContext";
import UserOrders from "./pages/UserOrders";
import AuthCallbackPage from './pages/AuthCallbackPage';

window.addEventListener("DOMContentLoaded", () => {
  const imgs = document.querySelectorAll("img:not([loading])");
  imgs.forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });
});

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/user-orders" component={UserOrders} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/customize" component={CustomizePage} />
          <Route path="/tshirt-designer" component={TShirtDesignerDemo} />
          <Route path="/admin" component={AdminPage} /> {/* Changed to AdminPage */}
          <Route path="/auth/callback" component={AuthCallbackPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
      <AnimeMascot defaultMascot="neko" position="bottom-right" autoGreet={true} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <PurchaseProvider>
            <Router />
          </PurchaseProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;