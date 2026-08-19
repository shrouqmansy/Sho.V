import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { MobileMenu } from './components/common/MobileMenu';
import { CartDrawer } from './components/common/CartDrawer';
import { SearchModal } from './components/common/SearchModal';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { NewInPage } from './pages/NewInPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CollectionPage } from './pages/CollectionPage';
import { AccountPage } from './pages/AccountPage';
import { ShippingPage } from './pages/ShippingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { TenantWorkspacePage } from './pages/TenantWorkspacePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function MainContent() {
  const { activePage, navigateTo } = useShop();

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'newin':
        return <NewInPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'collection':
        return <CollectionPage />;
      case 'account':
        return <AccountPage />;
      case 'login':
        return (
          <LoginPage
            onNavigateRegister={() => navigateTo('register')}
            onNavigateForgot={() => navigateTo('forgot-password')}
            onLoginSuccess={() => navigateTo('workspace')}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onNavigateLogin={() => navigateTo('login')}
            onRegisterSuccess={() => navigateTo('workspace')}
          />
        );
      case 'forgot-password':
        return <ForgotPasswordPage onNavigateLogin={() => navigateTo('login')} />;
      case 'workspace':
        return (
          <ProtectedRoute onRedirectToLogin={() => navigateTo('login')}>
            <TenantWorkspacePage />
          </ProtectedRoute>
        );
      case 'shipping':
        return <ShippingPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfaf7] text-[#1b1c1c] font-sans antialiased">
      <Header />
      <MobileMenu />
      <CartDrawer />
      <SearchModal />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <MainContent />
      </ShopProvider>
    </AuthProvider>
  );
}
