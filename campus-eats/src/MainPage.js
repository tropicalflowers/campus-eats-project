// src/MainPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './app.jsx';

function MainPage() {
  const { dispatch } = useAppContext();
  const [isLightMode, setIsLightMode] = useState(false);
  const howToUseRef = useRef(null);
  const conceptRef = useRef(null);

  // Initialize Google Translate
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

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    dispatch({ type: 'TOGGLE_MODE' });
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const bgClass = isLightMode 
    ? 'bg-gradient-to-br from-slate-50/80 via-gray-50/80 to-stone-50/80' 
    : 'bg-gradient-to-br from-slate-950 via-gray-950/80 to-zinc-950/80';
  const textClass = isLightMode ? 'text-gray-900' : 'text-slate-100';
  const cardClass = isLightMode 
    ? 'bg-white/60 backdrop-blur-sm border-gray-200/40' 
    : 'bg-slate-900/50 backdrop-blur-sm border-slate-800/30';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-all duration-500`}>
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b shadow-lg transition-all duration-300"
        style={{ 
          backgroundColor: isLightMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
          borderColor: isLightMode ? 'rgba(229,231,235,0.3)' : 'rgba(51,65,85,0.3)'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className={`text-2xl font-extrabold ${isLightMode ? 'bg-gradient-to-r from-slate-700/80 to-gray-700/80' : 'bg-gradient-to-r from-slate-300/80 to-gray-300/80'} bg-clip-text text-transparent`}>
                Campus Eats
              </h1>
              <div className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => scrollToSection(howToUseRef)}
                  className={`text-sm font-semibold hover:opacity-70 transition ${isLightMode ? 'text-gray-700' : 'text-slate-300'}`}
                >
                  How to Use
                </button>
                <button 
                  onClick={() => scrollToSection(conceptRef)}
                  className={`text-sm font-semibold hover:opacity-70 transition ${isLightMode ? 'text-gray-700' : 'text-slate-300'}`}
                >
                  The Concept
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Google Translate */}
              <div id="google_translate_element" className="hidden sm:block"></div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all ${
                  isLightMode 
                    ? 'bg-gradient-to-r from-gray-200/60 to-slate-200/60 hover:from-gray-300/60 hover:to-slate-300/60 shadow-md' 
                    : 'bg-gradient-to-r from-slate-800/60 to-gray-800/60 hover:from-slate-700/60 hover:to-gray-700/60 shadow-lg shadow-slate-900/30'
                }`}
                title="Toggle Theme"
              >
                {isLightMode ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-6xl md:text-7xl font-extrabold mb-6 ${isLightMode ? 'bg-gradient-to-r from-slate-800/80 via-gray-800/80 to-zinc-800/80' : 'bg-gradient-to-r from-slate-200/80 via-gray-200/80 to-zinc-200/80'} bg-clip-text text-transparent`}>
            Campus Food,
            <br />
            Simplified
          </h2>
          <p className={`text-xl md:text-2xl mb-4 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
            Order meals, book mess slots, and manage everything in one place
          </p>
          <p className={`text-lg ${isLightMode ? 'text-gray-500' : 'text-slate-500'}`}>
            Choose your role to get started
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Day Scholar Card */}
          <Link to="/dayscholar">
            <div className={`${cardClass} border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer`}>
              <div className={`w-20 h-20 ${isLightMode ? 'bg-gradient-to-br from-orange-300/50 to-amber-300/50' : 'bg-gradient-to-br from-orange-400/50 to-amber-400/50'} rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                🎒
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Day Scholar</h3>
              <p className={`text-base mb-6 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                Quick ordering for day students
              </p>
              <div className={`inline-flex items-center gap-2 ${isLightMode ? 'text-orange-600' : 'text-orange-400'} font-semibold group-hover:gap-3 transition-all`}>
                Enter Now <span>→</span>
              </div>
            </div>
          </Link>

          {/* Hosteller Card */}
          <Link to="/hosteller">
            <div className={`${cardClass} border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer`}>
              <div className={`w-20 h-20 ${isLightMode ? 'bg-gradient-to-br from-blue-300/50 to-cyan-300/50' : 'bg-gradient-to-br from-blue-400/50 to-cyan-400/50'} rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                🏠
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Hosteller</h3>
              <p className={`text-base mb-6 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                Mess booking & food ordering
              </p>
              <div className={`inline-flex items-center gap-2 ${isLightMode ? 'text-blue-600' : 'text-blue-400'} font-semibold group-hover:gap-3 transition-all`}>
                Enter Now <span>→</span>
              </div>
            </div>
          </Link>

          {/* Manager Card */}
          <Link to="/manager">
            <div className={`${cardClass} border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer`}>
              <div className={`w-20 h-20 ${isLightMode ? 'bg-gradient-to-br from-purple-300/50 to-violet-300/50' : 'bg-gradient-to-br from-purple-400/50 to-violet-400/50'} rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                👔
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Manager</h3>
              <p className={`text-base mb-6 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                Restaurant & staff management
              </p>
              <div className={`inline-flex items-center gap-2 ${isLightMode ? 'text-purple-600' : 'text-purple-400'} font-semibold group-hover:gap-3 transition-all`}>
                Enter Now <span>→</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* The Concept Section */}
      <section ref={conceptRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 ${isLightMode ? 'bg-gradient-to-r from-slate-700/80 to-gray-700/80' : 'bg-gradient-to-r from-slate-300/80 to-gray-300/80'} bg-clip-text text-transparent`}>
            The Concept
          </h2>
          <p className={`text-lg ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
            One platform for all your campus food needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`${cardClass} border rounded-2xl p-8 text-center`}>
            <div className={`w-16 h-16 ${isLightMode ? 'bg-gradient-to-br from-emerald-200/50 to-teal-200/50' : 'bg-gradient-to-br from-emerald-400/50 to-teal-400/50'} rounded-full flex items-center justify-center text-3xl mx-auto mb-6`}>
              🚀
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Lightning Fast</h3>
            <p className={`${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
              Order from multiple campus restaurants in seconds. Fast, efficient, and hassle-free!
            </p>
          </div>

          <div className={`${cardClass} border rounded-2xl p-8 text-center`}>
            <div className={`w-16 h-16 ${isLightMode ? 'bg-gradient-to-br from-indigo-200/50 to-blue-200/50' : 'bg-gradient-to-br from-indigo-400/50 to-blue-400/50'} rounded-full flex items-center justify-center text-3xl mx-auto mb-6`}>
              💳
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Secure Payments</h3>
            <p className={`${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
              Multiple secure payment options including campus wallet integration. Pay with ease!
            </p>
          </div>

          <div className={`${cardClass} border rounded-2xl p-8 text-center`}>
            <div className={`w-16 h-16 ${isLightMode ? 'bg-gradient-to-br from-amber-200/50 to-orange-200/50' : 'bg-gradient-to-br from-amber-400/50 to-orange-400/50'} rounded-full flex items-center justify-center text-3xl mx-auto mb-6`}>
              📍
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Real-time Tracking</h3>
            <p className={`${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
              Track your order status instantly. Get notifications at every step of the process!
            </p>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section ref={howToUseRef} className={`py-20 ${isLightMode ? 'bg-gray-100/40' : 'bg-slate-900/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 ${isLightMode ? 'bg-gradient-to-r from-slate-700/80 to-gray-700/80' : 'bg-gradient-to-r from-slate-300/80 to-gray-300/80'} bg-clip-text text-transparent`}>
              How to Use
            </h2>
            <p className={`text-lg ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
              Getting started is simple and quick
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className={`w-16 h-16 ${isLightMode ? 'bg-gradient-to-br from-blue-300/60 to-cyan-300/60' : 'bg-gradient-to-br from-blue-500/60 to-cyan-500/60'} rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4`}>
                1
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Choose Your Role</h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                Select Day Scholar, Hosteller, or Manager based on your needs
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className={`w-16 h-16 ${isLightMode ? 'bg-gradient-to-br from-emerald-300/60 to-teal-300/60' : 'bg-gradient-to-br from-emerald-500/60 to-teal-500/60'} rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4`}>
                2
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Browse & Select</h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                Explore available restaurants and their delicious menus
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className={`w-16 h-16 ${isLightMode ? 'bg-gradient-to-br from-amber-300/60 to-orange-300/60' : 'bg-gradient-to-br from-amber-500/60 to-orange-500/60'} rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4`}>
                3
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Add to Cart</h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                Add your favorite items to cart and review your order
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className={`w-16 h-16 ${isLightMode ? 'bg-gradient-to-br from-purple-300/60 to-violet-300/60' : 'bg-gradient-to-br from-purple-500/60 to-violet-500/60'} rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4`}>
                4
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>Pay & Enjoy</h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                Choose your payment method and enjoy your meal!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${isLightMode ? 'border-gray-200/40' : 'border-slate-800/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-slate-500'}`}>
            © 2025 Campus Eats. Making campus dining effortless.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;
