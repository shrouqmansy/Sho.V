import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProductsFromDb, searchProductsApi } from '../data/products';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [activePage, setActivePage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');

  // PostgreSQL Database State
  const [dbProducts, setDbProducts] = useState([]);
  const [isDbLoading, setIsDbLoading] = useState(true);

  // Search & Browser Agent State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isClothingQuery, setIsClothingQuery] = useState(true);
  const [triggeredAgentState, setTriggeredAgentState] = useState(false);
  const [searchFeedbackMsg, setSearchFeedbackMsg] = useState(null);

  // Cart State (Initialized empty from PostgreSQL)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState('featured');
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  // Favorites / Wishlist State
  const [favorites, setFavorites] = useState([]);

  // Language State
  const [language, setLanguage] = useState('English');

  // User Account State
  const [userAccount, setUserAccount] = useState(() => {
    try {
      const saved = localStorage.getItem('shov_user_account');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      isLoggedIn: false,
      name: '',
      email: '',
      savedPassword: '',
      rememberMe: true,
      orders: []
    };
  });

  // Fetch initial catalog from PostgreSQL database once on mount or explicitly
  const refreshProductsFromDb = async (cat = 'All', force = false) => {
    if (!force && dbProducts.length > 0 && cat === 'All') return;

    setIsDbLoading(true);
    try {
      const prods = await fetchProductsFromDb(cat);
      setDbProducts(prods);
    } catch (err) {
      console.error('Error loading products from PostgreSQL:', err);
    } finally {
      setIsDbLoading(false);
    }
  };

  useEffect(() => {
    if (dbProducts.length === 0) {
      refreshProductsFromDb('All');
    }
  }, []);

  // Execute Search or Browser Agent Discovery
  const executeSearch = async (queryStr) => {
    if (!queryStr || !queryStr.trim()) {
      setSearchResults([]);
      setSearchFeedbackMsg(null);
      setIsSearching(false);
      setTriggeredAgentState(false);
      return;
    }

    setIsSearching(true);
    setSearchKeyword(queryStr);
    setSearchFeedbackMsg(null);

    try {
      const result = await searchProductsApi(queryStr);
      setSearchResults(result.products || []);
      setIsClothingQuery(result.isClothing !== undefined ? result.isClothing : true);
      setTriggeredAgentState(Boolean(result.triggeredAgent));
      if (result.message) setSearchFeedbackMsg(result.message);

      // Refresh DB list after discovery
      if (result.triggeredAgent) {
        refreshProductsFromDb('All');
      }
    } catch (err) {
      console.error('Search execution error:', err);
      setSearchResults([]);
      setSearchFeedbackMsg('Web discovery server error. Please try another search.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('shov_user_account', JSON.stringify(userAccount));
    } catch (e) {
      console.error(e);
    }
  }, [userAccount]);

  // Native Browser History (Back / Forward) Listener
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        const { page, catFilter, selProd, selCol, scrollY } = event.state;
        if (page) setActivePage(page);
        if (catFilter !== undefined) setCategoryFilter(catFilter);
        if (selProd !== undefined) setSelectedProduct(selProd);
        if (selCol !== undefined) setSelectedCollection(selCol);

        if (scrollY !== undefined) {
          setTimeout(() => {
            window.scrollTo({ top: scrollY, behavior: 'instant' });
          }, 20);
        }
      }
    };

    const initialState = {
      page: activePage,
      catFilter: categoryFilter,
      selProd: selectedProduct,
      selCol: selectedCollection,
      scrollY: window.scrollY
    };
    window.history.replaceState(initialState, '', window.location.pathname);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateBrowserHistory = (newPage, newCatFilter, newSelProd, newSelCol) => {
    const currentScrollY = window.scrollY;
    if (window.history.state) {
      window.history.replaceState(
        { ...window.history.state, scrollY: currentScrollY },
        '',
        window.location.pathname
      );
    }

    const nextState = {
      page: newPage,
      catFilter: newCatFilter !== undefined ? newCatFilter : categoryFilter,
      selProd: newSelProd !== undefined ? newSelProd : selectedProduct,
      selCol: newSelCol !== undefined ? newSelCol : selectedCollection,
      scrollY: 0
    };

    window.history.pushState(nextState, '', window.location.pathname);
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId) => favorites.includes(productId);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'EGY 0';
    return `EGY ${parseFloat(price).toLocaleString('en-US')}`;
  };

  const navigateTo = (page) => {
    if (page !== activePage) {
      updateBrowserHistory(page, 'All', null, null);
    }
    setActivePage(page);
    if (page !== 'product') setSelectedProduct(null);
    if (page !== 'collection') setSelectedCollection(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setCategoryFilterAndSync = (filterName) => {
    updateBrowserHistory(activePage, filterName, selectedProduct, selectedCollection);
    setCategoryFilter(filterName);
  };

  const openProduct = (product) => {
    updateBrowserHistory('product', categoryFilter, product, null);
    setSelectedProduct(product);
    setSelectedCollection(null);
    setActivePage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCollection = (collectionName) => {
    updateBrowserHistory('collection', categoryFilter, null, collectionName);
    setSelectedCollection(collectionName);
    setSelectedProduct(null);
    setActivePage('collection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = (orderData) => {
    const orderId = `SHOV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      items: cart.map(item => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      total: orderData.totalPrice,
      shippingAddress: `${orderData.street}, ${orderData.area}, ${orderData.city}, Egypt`,
      customerInfo: {
        name: orderData.fullName,
        email: orderData.email,
        phone: orderData.phone
      },
      paymentMethod: orderData.paymentMethod,
      shippingMethod: orderData.shippingMethod
    };

    setLastPlacedOrder(newOrder);

    setUserAccount(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders]
    }));

    clearCart();
    navigateTo('order-confirmation');
  };

  const loginUser = (name, email, password, remember) => {
    setUserAccount(prev => ({
      ...prev,
      isLoggedIn: true,
      name: name || 'Sho.V Client',
      email: email,
      savedPassword: remember ? password : '',
      rememberMe: remember
    }));
  };

  const logoutUser = () => {
    setUserAccount(prev => ({
      ...prev,
      isLoggedIn: false
    }));
  };

  return (
    <ShopContext.Provider
      value={{
        activePage,
        navigateTo,
        selectedProduct,
        setSelectedProduct,
        openProduct,
        selectedCollection,
        openCollection,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        searchKeyword,
        setSearchKeyword,
        categoryFilter,
        setCategoryFilter: setCategoryFilterAndSync,
        sortOption,
        setSortOption,
        cartCount,
        cartSubtotal,
        formatPrice,
        favorites,
        toggleFavorite,
        isFavorite,
        language,
        setLanguage,
        userAccount,
        loginUser,
        logoutUser,
        placeOrder,
        lastPlacedOrder,
        dbProducts,
        isDbLoading,
        refreshProductsFromDb,
        isSearching,
        searchResults,
        isClothingQuery,
        triggeredAgentState,
        searchFeedbackMsg,
        executeSearch
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
