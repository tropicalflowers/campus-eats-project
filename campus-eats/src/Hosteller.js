// src/Hosteller.js
import React, { useState, useEffect } from 'react';
import { useAppContext } from './app.jsx';
import { Link } from 'react-router-dom';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Mess Booking Component
const MessBookingDrawerContent = ({ confirmMessBooking }) => {
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false
  });
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  const mealPrices = {
    breakfast: 50,
    lunch: 80,
    dinner: 75
  };

  const toggleMeal = (meal) => {
    setSelectedMeals(prev => ({ ...prev, [meal]: !prev[meal] }));
  };

  const total = Object.keys(selectedMeals).reduce((sum, meal) => {
    return sum + (selectedMeals[meal] ? mealPrices[meal] : 0);
  }, 0);

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white/90 to-slate-300/90 bg-clip-text text-transparent">Book Mess Meals</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-bold text-white mb-2">Select Date</label>
        <input 
          type="date" 
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white focus:border-blue-500/60 focus:outline-none"
        />
      </div>

      <div className="space-y-3 mb-6">
        <div 
          onClick={() => toggleMeal('breakfast')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedMeals.breakfast 
              ? 'border-amber-400/60 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 shadow-lg shadow-amber-500/30' 
              : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-lg">🌅 Breakfast</p>
              <p className="text-sm text-slate-400">7:00 AM - 9:00 AM</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-emerald-400">₹{mealPrices.breakfast}</span>
              <div className={`w-6 h-6 rounded-full border-2 transition-all ${selectedMeals.breakfast ? 'bg-gradient-to-r from-amber-500/70 to-yellow-500/70 border-amber-400/60 shadow-lg shadow-amber-500/30' : 'border-slate-600/50'}`}></div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => toggleMeal('lunch')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedMeals.lunch 
              ? 'border-orange-400/60 bg-gradient-to-r from-orange-500/15 to-red-500/15 shadow-lg shadow-orange-500/30' 
              : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-lg">🍛 Lunch</p>
              <p className="text-sm text-slate-400">12:00 PM - 2:00 PM</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-emerald-400">₹{mealPrices.lunch}</span>
              <div className={`w-6 h-6 rounded-full border-2 transition-all ${selectedMeals.lunch ? 'bg-gradient-to-r from-orange-500/70 to-red-500/70 border-orange-400/60 shadow-lg shadow-orange-500/30' : 'border-slate-600/50'}`}></div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => toggleMeal('dinner')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedMeals.dinner 
              ? 'border-indigo-400/60 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 shadow-lg shadow-indigo-500/30' 
              : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-lg">🌙 Dinner</p>
              <p className="text-sm text-slate-400">7:00 PM - 9:00 PM</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-emerald-400">₹{mealPrices.dinner}</span>
              <div className={`w-6 h-6 rounded-full border-2 transition-all ${selectedMeals.dinner ? 'bg-gradient-to-r from-indigo-500/70 to-purple-500/70 border-indigo-400/60 shadow-lg shadow-indigo-500/30' : 'border-slate-600/50'}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-4 rounded-xl mb-4 shadow-xl">
        <div className="flex justify-between items-center text-white text-lg">
          <span>Total Amount:</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400/80 to-teal-400/80 bg-clip-text text-transparent">₹{total}</span>
        </div>
      </div>

      <button 
        onClick={() => confirmMessBooking(selectedMeals, bookingDate, total)}
        disabled={total === 0}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-xl ${
          total === 0 
            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-emerald-500/80 via-teal-500/80 to-cyan-500/80 text-white hover:from-emerald-600/80 hover:via-teal-600/80 hover:to-cyan-600/80 hover:shadow-2xl hover:shadow-emerald-500/30'
        }`}
      >
        {total === 0 ? 'Select at least one meal' : 'Confirm Booking ✓'}
      </button>
    </div>
  );
};

const MenuDrawerContent = ({ rest, addToCart }) => {
  const itemsBlock = (section, items) => (
    <div key={section} className="mb-6">
      <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-amber-400/60 to-orange-400/60 bg-clip-text text-transparent">{capitalize(section)}</h2>
      {items?.map((it, i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-700/30 last:border-b-0 hover:bg-gradient-to-r hover:from-slate-800/30 hover:to-slate-700/30 px-3 rounded-lg transition">
          <div>
            <p className="font-semibold text-white text-lg notranslate">{it.n}</p>
            <p className="text-sm text-slate-400 notranslate">{it.d}</p>
          </div>
          <div className="text-right flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400/70 to-teal-400/70 bg-clip-text text-transparent">₹{it.p}</span>
            <button onClick={() => addToCart(it)} className="bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white px-4 py-2 rounded-lg hover:from-blue-600/80 hover:to-cyan-600/80 transition text-sm font-bold shadow-lg">
              Add +
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-teal-500/50 p-4 rounded-lg mb-4 shadow-xl">
        <p className="text-white font-bold text-center">{rest.type} • Tap 'Add' to place items in your cart 🛒</p>
      </div>
      {rest.menu?.main && itemsBlock('main', rest.menu.main)}
      {rest.menu?.starters && itemsBlock('starters', rest.menu.starters)}
      {rest.menu?.drinks && itemsBlock('drinks', rest.menu.drinks)}
    </div>
  );
};

const PaymentDrawerContent = ({ cart, total, confirmPayment }) => {
  const [selectedPayment, setSelectedPayment] = useState('counter');

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white/90 to-slate-300/90 bg-clip-text text-transparent">Choose Payment Method</h3>
      
      <div className="space-y-3 mb-6">
        <div 
          onClick={() => setSelectedPayment('counter')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedPayment === 'counter' 
              ? 'border-blue-400/60 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 shadow-lg shadow-blue-500/30' 
              : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-lg">💵 Pay at Counter</p>
              <p className="text-sm text-slate-400">Pay when you pick up your order</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 transition-all ${selectedPayment === 'counter' ? 'bg-gradient-to-r from-blue-500/70 to-cyan-500/70 border-blue-400/60 shadow-lg shadow-blue-500/30' : 'border-slate-600/50'}`}></div>
          </div>
        </div>

        <div 
          onClick={() => setSelectedPayment('wallet')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedPayment === 'wallet' 
              ? 'border-emerald-400/60 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 shadow-lg shadow-emerald-500/30' 
              : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-lg">💳 Campus Wallet</p>
              <p className="text-sm text-slate-400">Balance: ₹{total.wallet}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 transition-all ${selectedPayment === 'wallet' ? 'bg-gradient-to-r from-emerald-500/70 to-teal-500/70 border-emerald-400/60 shadow-lg shadow-emerald-500/30' : 'border-slate-600/50'}`}></div>
          </div>
        </div>

        <div 
          onClick={() => setSelectedPayment('stripe')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedPayment === 'stripe' 
              ? 'border-indigo-400/60 bg-gradient-to-r from-indigo-500/15 to-blue-500/15 shadow-lg shadow-indigo-500/30' 
              : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-lg">💳 Stripe Payment</p>
              <p className="text-sm text-slate-400">Pay securely with Stripe</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 transition-all ${selectedPayment === 'stripe' ? 'bg-gradient-to-r from-indigo-500/70 to-blue-500/70 border-indigo-400/60 shadow-lg shadow-indigo-500/30' : 'border-slate-600/50'}`}></div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-4 rounded-xl mb-4 shadow-xl">
        <div className="flex justify-between items-center text-white text-lg">
          <span>Total Amount:</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400/80 to-teal-400/80 bg-clip-text text-transparent">₹{total.amount.toFixed(2)}</span>
        </div>
      </div>

      <button 
        onClick={() => confirmPayment(selectedPayment)}
        className="w-full bg-gradient-to-r from-emerald-500/80 via-teal-500/80 to-cyan-500/80 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-600/80 hover:via-teal-600/80 hover:to-cyan-600/80 transition-all shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30"
      >
        Confirm Order ✓
      </button>
    </div>
  );
};

const CartDrawerContent = ({ cart, removeFromCart, proceedToPayment }) => {
  const total = cart.reduce((sum, item) => sum + item.p, 0);

  return (
    <div className="p-6">
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-xl mb-4">🛒 Your cart is empty</p>
          <p className="text-slate-500">Add items from restaurants to get started!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/40 hover:border-slate-500/50 hover:shadow-lg transition-all">
                <div>
                  <p className="font-semibold text-white text-lg notranslate">{item.n}</p>
                  <p className="text-sm font-bold bg-gradient-to-r from-emerald-400/80 to-teal-400/80 bg-clip-text text-transparent">₹{item.p}</p>
                </div>
                <button onClick={() => removeFromCart(idx)} className="text-red-400/80 hover:text-red-300/80 font-bold px-3 py-1 rounded-lg hover:bg-red-500/15 transition">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-slate-700/50 pt-4 mb-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-white">Total</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400/80 to-teal-400/80 bg-clip-text text-transparent">₹{total.toFixed(2)}</span>
            </div>
            <button onClick={proceedToPayment} className="w-full bg-gradient-to-r from-blue-500/80 via-cyan-500/80 to-teal-500/80 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600/80 hover:via-cyan-600/80 hover:to-teal-600/80 transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/30">
              Proceed to Payment →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function Hosteller() {
  const { state, showMessage, openDrawer, closeDrawer, updateCart, dispatch } = useAppContext();
  const { cart, isLightMode, user } = state;
  
  const [localRestaurants, setLocalRestaurants] = useState([]);
  const [userWallet, setUserWallet] = useState(2000);
  const [userOrders, setUserOrders] = useState([]);
  const [messBookings, setMessBookings] = useState([]);

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,pa,fr',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      );
    };

    addGoogleTranslateScript();
  }, []);

  useEffect(() => {
    if (user?.email) {
      // Load user data
      fetch(`http://localhost:5000/api/userdata/${user.email}`)
        .then(res => res.json())
        .then(data => {
          setUserWallet(data.wallet);
          setUserOrders(data.orders);
        })
        .catch(err => console.log('Error loading user data:', err));

      // Load mess bookings
      fetch(`http://localhost:5000/api/messbookings/${user.email}`)
        .then(res => res.json())
        .then(data => setMessBookings(data))
        .catch(err => console.log('Error loading mess bookings:', err));
    }
  }, [user]);

  useEffect(() => {
    fetch('/data/restaurants.json')
      .then(response => response.json())
      .then(data => setLocalRestaurants(data))
      .catch(error => console.log('Error loading restaurants:', error));
  }, []);

  const restaurants = state.restaurants?.length > 0 ? state.restaurants : localRestaurants;

  const addToCart = (item) => {
    const newCart = [...cart, item];
    updateCart(newCart);
    showMessage(`${item.n} added to cart!`, 'success');
  };

  const removeFromCart = (idx) => {
    const newCart = cart.filter((_, i) => i !== idx);
    updateCart(newCart);
    showMessage('Item removed from cart', 'info');
  };

  const proceedToPayment = () => {
    const total = cart.reduce((sum, item) => sum + item.p, 0);
    openDrawer(
      'Payment Method',
      <PaymentDrawerContent cart={cart} total={{ amount: total, wallet: userWallet }} confirmPayment={confirmPayment} />,
      null
    );
  };

  const confirmPayment = async (paymentMethod) => {
    if (cart.length === 0) {
      showMessage('Cart is empty!', 'error');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.p, 0);
    const newOrder = {
      id: Date.now().toString(),
      items: cart,
      total,
      mode: paymentMethod === 'counter' ? 'Pay at Counter' : paymentMethod === 'wallet' ? 'Campus Wallet' : 'Stripe Payment',
      timestamp: new Date().toISOString(),
      userName: user?.email || 'Guest'
    };

    try {
      if (paymentMethod === 'wallet') {
        if (userWallet < total) {
          showMessage(`Insufficient balance! You need ₹${(total - userWallet).toFixed(2)} more.`, 'error');
          return;
        }
        
        const newBalance = userWallet - total;
        setUserWallet(newBalance);
        
        await fetch(`http://localhost:5000/api/wallet/${user.email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: newBalance })
        });
        
        await fetch(`http://localhost:5000/api/order/${user.email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        
        setUserOrders([...userOrders, newOrder]);
        showMessage(`Order placed! New balance: ₹${newBalance.toFixed(2)}`, 'success');
        updateCart([]);
        closeDrawer();
      } else if (paymentMethod === 'stripe') {
        await fetch(`http://localhost:5000/api/order/${user.email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        
        setUserOrders([...userOrders, newOrder]);
        window.open('https://buy.stripe.com/test_3cIdR97bu6QX9Pm5vt1Nu00', '_blank');
        showMessage(`Redirecting to Stripe for ₹${total.toFixed(2)}...`, 'success');
        updateCart([]);
        closeDrawer();
      } else {
        await fetch(`http://localhost:5000/api/order/${user.email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        
        setUserOrders([...userOrders, newOrder]);
        showMessage(`Order placed! Pay ₹${total.toFixed(2)} at counter.`, 'success');
        updateCart([]);
        closeDrawer();
      }
    } catch (error) {
      console.error('Payment error:', error);
      showMessage('Failed to process order. Check if backend is running!', 'error');
    }
  };

  const openMessBooking = () => {
    openDrawer(
      'Book Mess Meals',
      <MessBookingDrawerContent confirmMessBooking={confirmMessBooking} />,
      null
    );
  };

  const confirmMessBooking = async (selectedMeals, bookingDate, total) => {
    if (total === 0) {
      showMessage('Please select at least one meal!', 'error');
      return;
    }

    if (userWallet < total) {
      showMessage(`Insufficient balance! You need ₹${(total - userWallet).toFixed(2)} more.`, 'error');
      return;
    }

    const meals = Object.keys(selectedMeals).filter(meal => selectedMeals[meal]);
    const newBooking = {
      id: Date.now().toString(),
      date: bookingDate,
      meals: meals,
      total: total,
      timestamp: new Date().toISOString(),
      userName: user?.email || 'Guest'
    };

    try {
      const newBalance = userWallet - total;
      setUserWallet(newBalance);

      await fetch(`http://localhost:5000/api/wallet/${user.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance })
      });

      await fetch(`http://localhost:5000/api/messbooking/${user.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });

      setMessBookings([...messBookings, newBooking]);
      showMessage(`Mess booked for ${bookingDate}! New balance: ₹${newBalance.toFixed(2)}`, 'success');
      closeDrawer();
    } catch (error) {
      console.error('Booking error:', error);
      showMessage('Failed to book mess. Check if backend is running!', 'error');
    }
  };

  const openMenu = (restaurant) => {
    openDrawer(
      `${restaurant.name} - Menu`,
      <MenuDrawerContent rest={restaurant} addToCart={addToCart} />,
      null
    );
  };

  const openCart = () => {
    openDrawer(
      `Shopping Cart (${cart.length})`,
      <CartDrawerContent cart={cart} removeFromCart={removeFromCart} proceedToPayment={proceedToPayment} />,
      null
    );
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_MODE' });
  };

  const openRestaurants = restaurants.filter(r => r.isOpen);
  
  const bgClass = isLightMode 
    ? 'bg-gradient-to-br from-orange-50/60 via-rose-50/60 to-amber-50/60' 
    : 'bg-gradient-to-br from-slate-950 via-blue-950/60 to-indigo-950/60';
  const textClass = isLightMode ? 'text-gray-800' : 'text-slate-100';
  const cardClass = isLightMode 
    ? 'bg-white/70 backdrop-blur-sm border-orange-100/40' 
    : 'bg-slate-900/60 backdrop-blur-sm border-blue-900/30';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-all duration-500`}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b shadow-xl transition-all duration-300" 
        style={{ 
          backgroundColor: isLightMode ? 'rgba(255,251,247,0.85)' : 'rgba(15,23,42,0.85)',
          borderColor: isLightMode ? 'rgba(251,207,232,0.2)' : 'rgba(59,130,246,0.2)'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className={`text-2xl font-extrabold ${isLightMode ? 'bg-gradient-to-r from-orange-500/80 via-rose-500/80 to-amber-500/80' : 'bg-gradient-to-r from-blue-400/80 via-cyan-400/80 to-teal-400/80'} bg-clip-text text-transparent hover:scale-105 transition-transform`}>
                Campus Eats
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <span className={`text-sm ${isLightMode ? 'text-orange-500/70' : 'text-blue-400/70'}`}>Hosteller</span>
                {user?.email && (
                  <>
                    <span className="text-slate-400/60">•</span>
                    <span className={`text-sm font-semibold ${isLightMode ? 'bg-gradient-to-r from-orange-500/70 to-rose-500/70' : 'bg-gradient-to-r from-blue-400/70 to-cyan-400/70'} bg-clip-text text-transparent notranslate`}>{user.email}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div id="google_translate_element" className="hidden sm:block"></div>
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all ${
                  isLightMode 
                    ? 'bg-gradient-to-r from-orange-100/60 to-rose-100/60 hover:from-orange-200/60 hover:to-rose-200/60 shadow-md' 
                    : 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/60 hover:to-indigo-800/60 shadow-lg shadow-blue-900/30'
                }`}
                title="Toggle Theme"
              >
                {isLightMode ? '🌙' : '☀️'}
              </button>

              <button onClick={openCart} className={`${isLightMode ? 'bg-gradient-to-r from-orange-400/70 via-rose-400/70 to-amber-400/70 hover:from-orange-500/70 hover:via-rose-500/70 hover:to-amber-500/70' : 'bg-gradient-to-r from-blue-500/70 via-cyan-500/70 to-teal-500/70 hover:from-blue-600/70 hover:via-cyan-600/70 hover:to-teal-600/70'} text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl`}>
                🛒 <span className="hidden sm:inline">Cart</span> ({cart.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`lg:col-span-2 ${cardClass} border rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300`}>
            <p className={`text-sm font-bold mb-2 ${isLightMode ? 'bg-gradient-to-r from-orange-500/70 to-rose-500/70' : 'bg-gradient-to-r from-blue-400/70 to-cyan-400/70'} bg-clip-text text-transparent`}>👋 Welcome, <span className="notranslate">{user?.email?.split('@')[0] || 'Guest'}</span>!</p>
            <h1 className={`text-5xl font-extrabold mb-4 ${isLightMode ? 'bg-gradient-to-r from-orange-500/80 via-rose-500/80 to-amber-500/80' : 'bg-gradient-to-r from-blue-500/80 via-cyan-500/80 to-teal-500/80'} bg-clip-text text-transparent`}>Hostel Life Made Easy</h1>
            <p className={`text-lg mb-6 ${isLightMode ? 'text-gray-600' : 'text-slate-300'}`}>
              Book mess meals and order from campus restaurants - all in one place!
            </p>
            <div className="flex gap-4">
              <button onClick={openMessBooking} className={`flex-1 ${isLightMode ? 'bg-gradient-to-r from-amber-400/80 to-orange-400/80 hover:from-amber-500/80 hover:to-orange-500/80' : 'bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-600/80 hover:to-orange-600/80'} text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl`}>
                🍽️ Book Mess
              </button>
              <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className={`flex-1 ${isLightMode ? 'bg-gradient-to-r from-orange-400/80 via-rose-400/80 to-amber-400/80 hover:from-orange-500/80 hover:via-rose-500/80 hover:to-amber-500/80' : 'bg-gradient-to-r from-blue-500/80 via-cyan-500/80 to-teal-500/80 hover:from-blue-600/80 hover:via-cyan-600/80 hover:to-teal-600/80'} text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl`}>
                🍔 Browse Food
              </button>
            </div>
          </div>

          {/* Wallet Card */}
          <div className={`${cardClass} border rounded-3xl p-8 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-orange-300/60 via-rose-300/60 to-amber-300/60' : 'bg-gradient-to-br from-blue-500/60 via-cyan-500/60 to-teal-500/60'} hover:shadow-2xl transition-all duration-300`}>
            <h3 className="text-white font-bold text-lg mb-3">Campus Wallet Balance</h3>
            <p className="text-6xl font-extrabold text-white mb-6">₹{userWallet.toFixed(0)}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/15 text-white px-4 py-3 rounded-xl font-bold hover:bg-white/25 transition-all text-sm backdrop-blur-sm shadow-md">
                💰 Coupons
              </button>
              <button 
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="flex-1 bg-white/15 text-white px-4 py-3 rounded-xl font-bold hover:bg-white/25 transition-all text-sm backdrop-blur-sm shadow-md"
              >
                📜 History
              </button>
            </div>
          </div>
        </div>

        {/* Mess Bookings Summary */}
        <div className={`${cardClass} border rounded-3xl p-6 mb-8 shadow-xl`}>
          <h2 className={`text-2xl font-extrabold mb-4 flex items-center gap-2`}>
            <span className={`${isLightMode ? 'bg-gradient-to-r from-amber-500/80 to-orange-500/80' : 'bg-gradient-to-r from-amber-500/80 to-orange-500/80'} bg-clip-text text-transparent`}>🍽️ Upcoming Mess Bookings</span>
            <span className="text-lg opacity-70">({messBookings.length})</span>
          </h2>
          {messBookings.length === 0 ? (
            <p className="text-slate-400/70 text-center py-6">No mess bookings yet. Click "Book Mess" to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messBookings.slice(-6).reverse().map((booking) => (
                <div key={booking.id} className={`p-4 rounded-xl ${isLightMode ? 'bg-orange-50/60' : 'bg-blue-900/20'} border ${isLightMode ? 'border-orange-200/40' : 'border-blue-800/30'}`}>
                  <p className="font-bold text-lg mb-2">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {booking.meals.map((meal) => (
                      <span key={meal} className={`text-xs px-2 py-1 rounded-full ${isLightMode ? 'bg-orange-200/60 text-orange-800' : 'bg-blue-800/60 text-blue-200'}`}>
                        {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '🍛' : '🌙'} {meal}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-bold bg-gradient-to-r from-emerald-500/80 to-teal-500/80 bg-clip-text text-transparent">₹{booking.total}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Spots */}
        <h2 className={`text-4xl font-extrabold mb-8 ${textClass} flex items-center gap-3`}>
          <span className={`${isLightMode ? 'bg-gradient-to-r from-orange-500/80 via-rose-500/80 to-amber-500/80' : 'bg-gradient-to-r from-blue-500/80 via-cyan-500/80 to-teal-500/80'} bg-clip-text text-transparent`}>🍔 Today's Spots</span> 
          <span className="text-2xl opacity-70">({openRestaurants.length})</span>
        </h2>

        {openRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-slate-400/70">Loading restaurants...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {openRestaurants.map((restaurant) => (
              <div key={restaurant.id} className={`${cardClass} border rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group`} onClick={() => openMenu(restaurant)}>
                <div className={`w-full h-36 ${isLightMode ? 'bg-gradient-to-br from-orange-300/70 via-rose-300/70 to-amber-300/70' : 'bg-gradient-to-br from-blue-400/70 via-cyan-400/70 to-teal-400/70'} rounded-2xl mb-5 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  🍽️
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isLightMode ? 'bg-gradient-to-r from-orange-500/80 to-rose-500/80' : 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80'} bg-clip-text text-transparent notranslate`}>{restaurant.name}</h2>
                <p className={`text-sm mb-4 ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>{restaurant.type}</p>
                {restaurant.description && <p className={`text-sm mb-5 ${isLightMode ? 'text-gray-600' : 'text-slate-300'}`}>{restaurant.description}</p>}
                <button className={`w-full ${isLightMode ? 'bg-gradient-to-r from-orange-400/80 to-rose-400/80 hover:from-orange-500/80 hover:to-rose-500/80' : 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-600/80 hover:to-cyan-600/80'} text-white py-3 rounded-xl font-bold transition-all shadow-md group-hover:shadow-lg`}>
                  View Menu
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Order History */}
        <section className="mt-16">
          <h2 className={`text-4xl font-bold mb-8 flex items-center gap-3 ${textClass}`}>
            <span className="bg-gradient-to-r from-emerald-500/80 via-teal-500/80 to-cyan-500/80 bg-clip-text text-transparent">📦 Order History</span>
            <span className="text-2xl opacity-70">({userOrders.length})</span>
          </h2>
          {userOrders.length === 0 ? (
            <div className={`${cardClass} border rounded-3xl p-12 text-center shadow-lg`}>
              <p className="text-slate-400/70 text-lg">No orders placed yet.</p>
            </div>
          ) : (
            <div className={`${cardClass} border rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className={isLightMode ? 'bg-gradient-to-r from-orange-50/60 to-rose-50/60' : 'bg-gradient-to-r from-blue-900/40 to-cyan-900/40'}>
                    <tr>
                      <th className="p-5 text-left font-bold">#</th>
                      <th className="p-5 text-left font-bold">When</th>
                      <th className="p-5 text-left font-bold">Payment</th>
                      <th className="p-5 text-left font-bold">Total</th>
                      <th className="p-5 text-left font-bold">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order, idx) => (
                      <tr key={order.id} className={`border-t ${isLightMode ? 'border-orange-100/30 hover:bg-orange-50/40' : 'border-blue-900/20 hover:bg-blue-900/20'} transition-all`}>
                        <td className="p-5 font-semibold">{idx + 1}</td>
                        <td className="p-5 text-sm opacity-90">{new Date(order.timestamp).toLocaleString()}</td>
                        <td className={`p-5 font-bold ${isLightMode ? 'bg-gradient-to-r from-orange-500/70 to-rose-500/70' : 'bg-gradient-to-r from-blue-400/70 to-cyan-400/70'} bg-clip-text text-transparent`}>{order.mode}</td>
                        <td className="p-5 font-bold text-xl bg-gradient-to-r from-emerald-500/80 to-teal-500/80 bg-clip-text text-transparent">₹{order.total.toFixed(2)}</td>
                        <td className="p-5 text-sm text-slate-500">{order.items?.length || 0} items</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Hosteller;
