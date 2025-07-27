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
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import UserOrders from "./pages/UserOrders";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import TestPage from "./pages/TestPage";
import AuthCallbackPage from './pages/AuthCallbackPage';
import AccountPage from './pages/AccountPage';

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
          <Route path="/cart" component={CartPage} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route path="/test" component={TestPage} />
          <Route path="/user-orders" component={UserOrders} />
          <Route path="/account" component={AccountPage} />
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
            <CartProvider>
              <WishlistProvider>
                <Router />
              </WishlistProvider>
            </CartProvider>
          </PurchaseProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;