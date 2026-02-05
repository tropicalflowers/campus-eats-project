import React, { useState, useEffect, useContext, createContext, useReducer, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut
} from 'firebase/auth';
import { 
    getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, onSnapshot, collection, query, where, getDocs
} from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

// Set Firebase log level for debugging
setLogLevel('debug');

// --- Global Context for State Management ---
const AppContext = createContext();

// Reducer for complex state updates
const initialState = {
    user: null,
    userId: null,
    role: null,
    isAuthReady: false,
    db: null,
    auth: null,
    restaurants: [],
    cart: [],
    orders: [],
    messHistory: [],
    wallet: 500,
    isDrawerOpen: false,
    drawerContent: { title: '', body: null, footer: null, footerClass: 'pt-4 border-t border-slate-700/50' },
    isLightMode: true,
    isLoginModalOpen: true,
    message: null,
};

const appReducer = (state, action) => {
    switch (action.type) {
        case 'SET_AUTH_READY':
            return { ...state, isAuthReady: action.payload };
        case 'SET_DB_AUTH':
            return { ...state, db: action.payload.db, auth: action.payload.auth };
        case 'SET_USER':
            return { ...state, user: action.payload.user, userId: action.payload.userId, role: action.payload.role };
        case 'SET_RESTAURANTS':
            return { ...state, restaurants: action.payload };
        case 'SET_CART':
            return { ...state, cart: action.payload };
        case 'SET_ORDERS':
            return { ...state, orders: action.payload };
        case 'SET_MESS_HISTORY':
            return { ...state, messHistory: action.payload };
        case 'UPDATE_WALLET':
            return { ...state, wallet: action.payload };
        case 'OPEN_DRAWER':
            return { 
                ...state, 
                isDrawerOpen: true, 
                drawerContent: { 
                    ...action.payload, 
                    footerClass: action.payload.footerClass || 'pt-4 border-t border-slate-700/50'
                } 
            };
        case 'CLOSE_DRAWER':
            return { ...state, isDrawerOpen: false, drawerContent: initialState.drawerContent };
        case 'TOGGLE_MODE':
            return { ...state, isLightMode: !state.isLightMode };
        case 'SET_LOGIN_MODAL_OPEN':
            return { ...state, isLoginModalOpen: action.payload };
        case 'SET_MESSAGE':
            return { ...state, message: action.payload };
        case 'CLEAR_MESSAGE':
            return { ...state, message: null };
        default:
            return state;
    }
};

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    
    // Global toast/message utility
    const showMessage = useCallback((text, type = 'success', duration = 3000) => {
        dispatch({ type: 'SET_MESSAGE', payload: { text, type } });
        setTimeout(() => dispatch({ type: 'CLEAR_MESSAGE' }), duration);
    }, [dispatch]);

    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        // --- START: CUSTOM FIREBASE CONFIG INJECTION ---
        // Replacing the default sandbox config with the user's external project config.
        const firebaseConfigJSON = {
            apiKey: "AIzaSyCmTAAir5m1TrgbkiWf6mM1bQIbzj3pQCs",
            authDomain: "campus-eats-556e0.firebaseapp.com",
            projectId: "campus-eats-556e0",
            storageBucket: "campus-eats-556e0.firebasestorage.app",
            messagingSenderId: "269572970926",
            appId: "1:269572970926:web:b7c0201ea7e170910d903f",
            // measurementId: "G-QM289KBXRM" // Measurement ID is not required for core functions
        }; 

        // Use the projectId as the identifier for Firestore paths
        const appId = firebaseConfigJSON.projectId; 
        const firebaseConfig = firebaseConfigJSON;
        const initialAuthToken = null; // Rely on Anonymous Sign-in and Firestore credential check
        // --- END: CUSTOM FIREBASE CONFIG INJECTION ---


        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing.");
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            dispatch({ type: 'SET_DB_AUTH', payload: { db, auth } });

            const authenticate = async () => {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Firebase authentication failed:", error);
                    showMessage("Authentication failed. Please check the console.", 'error');
                }
            };

            const unsubscribe = onAuthStateChanged(auth, (user) => {
                const userId = user?.uid || crypto.randomUUID();
                dispatch({ type: 'SET_AUTH_READY', payload: true });
                // Role is set upon successful database login
                dispatch({ type: 'SET_USER', payload: { user: user, userId, role: null } }); 
            });

            authenticate();
            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
            showMessage("Failed to initialize Firebase.", 'error');
        }
    }, [showMessage]);

    // --- Firestore Data Subscriptions ---
    useEffect(() => {
        if (!state.db || !state.userId || !state.isAuthReady) return;

        // Use the hardcoded Project ID for the app identifier
        const appId = "campus-eats-556e0"; 
        
        // 1. Restaurants Subscription (Public Data)
        // Path: public/data/restaurants
        const qRestaurants = collection(state.db, `/public/data/restaurants`);
        const unsubRestaurants = onSnapshot(qRestaurants, (snapshot) => {
            const restaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SET_RESTAURANTS', payload: restaurants });
        }, (error) => console.error("Error fetching restaurants:", error));

        // 2. Orders Subscription (Private Data)
        // Path: users/{userId}/orders
        const qOrders = collection(state.db, `/users/${state.userId}/orders`);
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SET_ORDERS', payload: orders });
        }, (error) => console.error("Error fetching orders:", error));
        
        // 3. Mess History Subscription (Simulated Private Data for Hosteller)
        // Path: users/{userId}/messHistory
        const qMess = collection(state.db, `/users/${state.userId}/messHistory`);
        const unsubMess = onSnapshot(qMess, (snapshot) => {
            const messHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SET_MESS_HISTORY', payload: messHistory });
        }, (error) => console.error("Error fetching mess history:", error));


        return () => {
            unsubRestaurants();
            unsubOrders();
            unsubMess();
        };
    }, [state.db, state.userId, state.isAuthReady]);

    // --- Exposed Utility Functions ---
    const closeDrawer = () => dispatch({ type: 'CLOSE_DRAWER' });
    
    const openDrawer = (title, body, footer, footerClass) => {
        dispatch({ type: 'OPEN_DRAWER', payload: { title, body, footer, footerClass } });
    };

    const logout = async () => {
        if (state.auth) {
            await signOut(state.auth);
        }
        dispatch({ type: 'SET_USER', payload: { user: null, userId: null, role: null } });
        dispatch({ type: 'SET_CART', payload: [] });
        dispatch({ type: 'SET_LOGIN_MODAL_OPEN', payload: true });
        showMessage("Logged out successfully.", 'info');
    };

    const updateCart = (newCart) => dispatch({ type: 'SET_CART', payload: newCart });
    const updateWallet = (newWallet) => dispatch({ type: 'UPDATE_WALLET', payload: newWallet });

    const value = { state, dispatch, showMessage, closeDrawer, openDrawer, logout, updateCart, updateWallet };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hooks ---
const useAppContext = () => useContext(AppContext);

// --- Component Utilities ---
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --- Database Operations ---

// 1. Authentication
/*
const authenticateUser = async (db, name, roll) => {
    // Note: Since we are using an external Firebase project, we simplify the path 
    // from /artifacts/{appId}/public/data/credentials to just /public/data/credentials
    const credentialsRef = collection(db, `/public/data/credentials`);
    const q = query(credentialsRef, where("name", "==", name), where("roll", "==", roll));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return { success: false, role: null, message: "Invalid credentials." };
        }
        const userDoc = querySnapshot.docs[0].data();
        return { success: true, role: userDoc.role, message: `Welcome, ${name}!` };
    } catch (error) {
        console.error("Error authenticating:", error);
        return { success: false, role: null, message: "Database error during login." };
    }
};
*/
// Replace existing authenticateUser with this (in app.jsx):

const authenticateUser = async (db, name, roll) => {
  try {
    const credentialsRef = collection(db, "publicdata", "credentials");
    const q = query(credentialsRef, where("name", "==", name), where("roll", "==", roll));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return {
        success: false,
        role: null,
        message: "Invalid credentials.",
      };
    }
    const userDoc = querySnapshot.docs[0].data();
    return {
      success: true,
      role: userDoc.role,
      message: `Welcome, ${name}!`,
    };
  } catch (error) {
    console.error("Error authenticating:", error);
    return {
      success: false,
      role: null,
      message: "Database error during login.",
    };
  }
};

// 2. Manager Actions
const toggleRestaurantStatus = async (db, restaurantId, isOpen, showMessage) => {
    const docRef = doc(db, `/public/data/restaurants`, restaurantId);
    try {
        await updateDoc(docRef, { isOpen: !isOpen });
        showMessage(`Restaurant ${isOpen ? 'closed' : 'opened'} successfully.`, 'success');
    } catch (error) {
        console.error("Error toggling status:", error);
        showMessage("Failed to update status.", 'error');
    }
};

const addDishToMenu = async (db, restaurantId, newDish, dishType, showMessage) => {
    const docRef = doc(db, `/public/data/restaurants`, restaurantId);
    
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentMenu = data.menu || {};
            const currentDishes = currentMenu[dishType] || [];
            
            const newMenu = {
                ...currentMenu,
                [dishType]: [...currentDishes, newDish]
            };
            
            await updateDoc(docRef, { menu: newMenu });
            showMessage(`New dish "${newDish.n}" added to ${capitalize(dishType)}!`, 'success');
            return true;
        } else {
            showMessage("Restaurant not found.", 'error');
            return false;
        }
    } catch (error) {
        console.error("Error adding dish:", error);
        showMessage("Failed to add dish.", 'error');
        return false;
    }
};

const addCredential = async (db, newCredential, showMessage) => {
    const credentialsRef = collection(db, `/public/data/credentials`);
    
    try {
        // Check for existing credential (to avoid duplicates)
        const q = query(credentialsRef, where("name", "==", newCredential.name), where("roll", "==", newCredential.roll));
        const existingDocs = await getDocs(q);
        
        if (!existingDocs.empty) {
            showMessage("Credential already exists.", 'info');
            return false;
        }
        
        await addDoc(credentialsRef, newCredential);
        showMessage(`${capitalize(newCredential.role)} credential added successfully!`, 'success');
        return true;
    } catch (error) {
        console.error("Error adding credential:", error);
        showMessage("Failed to add credential.", 'error');
        return false;
    }
};

// 3. Order Placement (Shared)
const placeOrder = async (db, userId, orderDetails, showMessage, updateWallet) => {
    const ordersRef = collection(db, `/users/${userId}/orders`);
    
    try {
        await addDoc(ordersRef, orderDetails);
        
        // Mock wallet deduction
        if (orderDetails.mode === 'Wallet') {
             // In a real app, this would be handled server-side to prevent fraud.
             updateWallet(prevWallet => prevWallet - orderDetails.total);
        }

        showMessage(`✅ Order placed! Payment via ${orderDetails.mode}. Total: ₹${orderDetails.total.toFixed(0)}.`, 'success', 5000);
        return true;
    } catch (error) {
        console.error("Error placing order:", error);
        showMessage("Order failed to save to database.", 'error');
        return false;
    }
};

// 4. Mess Booking (Hosteller)
const bookMessMeal = async (db, userId, bookingDetails, showMessage) => {
    const messRef = collection(db, `/users/${userId}/messHistory`);

    try {
        await addDoc(messRef, bookingDetails);
        showMessage(`✅ Mess booking confirmed for ${bookingDetails.meal.split(' ')[0]}!`, 'success', 3000);
        return true;
    } catch (error) {
        console.error("Error booking mess meal:", error);
        showMessage("Failed to save mess booking.", 'error');
        return false;
    }
};


// --- UI Components ---

// Global Message / Toast Component
const MessageToast = React.memo(({ message, clearMessage }) => {
    if (!message) return null;
    
    const baseClass = "fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl z-[150] transition-opacity duration-300 transform";
    let colorClass = "";
    
    if (message.type === 'success') {
        colorClass = "bg-green-600 text-white";
    } else if (message.type === 'error') {
        colorClass = "bg-red-600 text-white";
    } else {
        colorClass = "bg-indigo-600 text-white";
    }

    return (
        <div 
            className={`${baseClass} ${colorClass} opacity-100 scale-100`}
            role="alert"
        >
            {message.text}
        </div>
    );
});


// Global Drawer Component
const Drawer = React.memo(({ isOpen, content, closeDrawer }) => {
    return (
        <div 
            id="appDrawer" 
            className={`fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
            onClick={(e) => e.target.id === 'appDrawer' && closeDrawer()}
        >
            <div 
                id="drawerContent" 
                className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-slate-900 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                        <h2 id="drawerTitle" className="text-2xl font-bold text-white">{content.title}</h2>
                        <button onClick={closeDrawer} className="p-2 rounded-full text-slate-400 hover:bg-slate-800/50 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div id="drawerBody" className="flex-grow overflow-y-auto py-4">
                        {content.body}
                    </div>
                    <div id="drawerFooter" className={content.footerClass}>
                        {content.footer}
                    </div>
                </div>
            </div>
        </div>
    );
});


// Login Modal Component
const LoginModal = ({ isModalOpen, onLogin }) => {
    const [name, setName] = useState('');
    const [roll, setRoll] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin(name, roll);
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Welcome • Campus Eats Login</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Enter your credentials to continue. Try **Manager / MG-001** or **Alice Johnson / 23CS001**.</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="inpName" className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</label>
                        <input 
                            type="text" 
                            id="inpName" 
                            className="w-full mt-1 p-3 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                            placeholder="Your full name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="inpRoll" className="text-sm font-medium text-slate-500 dark:text-slate-400">Roll Number/Staff ID</label>
                        <input 
                            type="text" 
                            id="inpRoll" 
                            className="w-full mt-1 p-3 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                            placeholder="e.g. 23CS001 or MG-001" 
                            value={roll}
                            onChange={(e) => setRoll(e.target.value)}
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Payment Drawer Content ---
const PaymentDrawerContent = ({ amount, closeDrawer, showMessage, placeOrder, userId, updateWallet, wallet, cart, updateCart }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async (mode) => {
        setIsProcessing(true);
        const orderDetails = {
            when: new Date().toISOString(),
            mode,
            total: amount,
            items: cart,
        };

        if (mode === 'Wallet' && wallet < amount) {
            showMessage("Payment failed: Insufficient wallet balance.", 'error');
            setIsProcessing(false);
            return;
        }

        if (mode === 'PayPal (Test)') {
             // Simulate PayPal API call
             showMessage("Initiating PayPal payment...", 'info', 2000);
             await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const success = await placeOrder(orderDetails);
        
        if (success) {
            updateCart([]);
            closeDrawer();
        }
        setIsProcessing(false);
    };

    return (
        <>
            <p className="text-slate-400 mb-6 text-lg">
                Amount Payable: <span className="text-2xl font-bold text-yellow-400">₹{amount.toFixed(0)}</span>
            </p>
            <div className="grid grid-cols-1 gap-4">
                <button 
                    className="bg-indigo-600 text-white p-4 rounded-xl text-left hover:bg-indigo-700 transition ring-1 ring-indigo-500/20 disabled:opacity-50" 
                    onClick={() => handlePayment('PayPal (Test)')}
                    disabled={isProcessing}
                >
                    <h3 className="font-bold">PayPal (Simulated API)</h3>
                    <p className="text-sm text-indigo-200">The most secure way to pay.</p>
                </button>
                <button 
                    className="bg-green-600 text-white p-4 rounded-xl text-left hover:bg-green-700 transition ring-1 ring-yellow-500/20 disabled:opacity-50" 
                    onClick={() => handlePayment('Wallet')}
                    disabled={isProcessing || wallet < amount}
                >
                    <h3 className="font-bold">Campus Wallet (₹{wallet.toFixed(0)})</h3>
                    <p className="text-sm text-green-200">
                        {wallet >= amount ? 'Deduct from wallet.' : 'Insufficient balance.'}
                    </p>
                </button>
                <button 
                    className="bg-slate-700 text-white p-4 rounded-xl text-left hover:bg-slate-600 transition ring-1 ring-slate-500/20 disabled:opacity-50" 
                    onClick={() => handlePayment('Cash')}
                    disabled={isProcessing}
                >
                    <h3 className="font-bold">Cash at Counter</h3>
                    <p className="text-sm text-slate-300">Pay when you pick up your order.</p>
                </button>
            </div>
            {isProcessing && <div className="text-center mt-4 text-indigo-400">Processing payment...</div>}
        </>
    );
};


// --- Manager Components ---

const ManagerDashboard = ({ restaurants, role, showMessage, db, closeDrawer, openDrawer }) => {
    const [selectedRest, setSelectedRest] = useState(restaurants[0]?.id || null);

    // Filter restaurants to only show open ones for consistency
    const openRestaurants = restaurants.filter(r => r.isOpen);
    const selectedRestaurant = restaurants.find(r => r.id === selectedRest);

    const handleToggleStatus = (id, isOpen) => {
        toggleRestaurantStatus(db, id, isOpen, showMessage);
    };
    
    // Hardcoded staff roster for display (since we are not managing staff dynamically in Firestore yet)
    const staffRoster = [
        { name: "Charlie Brown", role: "Chef", shift: "Morning" },
        { name: "Dale Cooper", role: "Server", shift: "Evening" },
    ];
    
    // Manager Credential Management Content
    const CredentialManager = () => {
        const [name, setName] = useState('');
        const [roll, setRoll] = useState('');
        const [newRole, setNewRole] = useState('student');

        const handleSubmit = async () => {
            if (!name || !roll || !newRole) return showMessage("Fill all fields.", 'error');
            await addCredential(db, { name, roll, role: newRole }, showMessage);
            setName('');
            setRoll('');
            setNewRole('student');
        };

        return (
            <div className="p-4 bg-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-yellow-400">Add New Credential</h4>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white text-sm" />
                <input type="text" placeholder="Roll/Staff ID (e.g., 23CS001, MG-002)" value={roll} onChange={e => setRoll(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white text-sm" />
                <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white text-sm">
                    <option value="student">Student (Day Scholar/Hosteller)</option>
                    <option value="manager">Manager/Admin</option>
                </select>
                <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                    Add Credential
                </button>
            </div>
        );
    };

    // Manager Dish/Menu Management Content
    const MenuManager = () => {
        const [dishName, setDishName] = useState('');
        const [dishDesc, setDishDesc] = useState('');
        const [dishPrice, setDishPrice] = useState('');
        const [dishType, setDishType] = useState('main');

        const handleAddDish = async () => {
            if (!dishName || !dishPrice || !selectedRestaurant) return showMessage("Fill dish name and price.", 'error');
            
            const newDish = { 
                n: dishName, 
                d: dishDesc || 'No description provided', 
                p: parseInt(dishPrice, 10) 
            };

            const success = await addDishToMenu(db, selectedRestaurant.id, newDish, dishType, showMessage);

            if (success) {
                setDishName('');
                setDishDesc('');
                setDishPrice('');
            }
        };

        return (
            <div className="p-4 bg-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-yellow-400">Add New Dish to {selectedRestaurant?.name || '...'}</h4>
                <select value={dishType} onChange={e => setDishType(e.target.value)} className="w-full p-3 rounded-lg bg-slate-700 text-white text-sm">
                    <option value="main">Main Course</option>
                    <option value="starters">Starters/Snacks</option>
                    <option value="drinks">Drinks</option>
                </select>
                <input type="text" placeholder="Dish Name" value={dishName} onChange={e => setDishName(e.target.value)} className="w-full p-3 rounded-lg bg-slate-700 text-white text-sm" />
                <input type="text" placeholder="Description (Optional)" value={dishDesc} onChange={e => setDishDesc(e.target.value)} className="w-full p-3 rounded-lg bg-slate-700 text-white text-sm" />
                <input type="number" placeholder="Price (INR)" value={dishPrice} onChange={e => setDishPrice(e.target.value)} className="w-full p-3 rounded-lg bg-slate-700 text-white text-sm" />
                <button onClick={handleAddDish} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                    Add Dish
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold mb-6 text-white">Manager Portal</h1>
            
            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400 border-b border-slate-700 pb-2">Operational Control</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {restaurants.map(r => (
                        <div key={r.id} className={`p-4 rounded-xl ${r.isOpen ? 'bg-green-900/40 border-green-500' : 'bg-red-900/40 border-red-500'} border transition`}>
                            <h3 className="font-bold text-white mb-2">{r.name}</h3>
                            <p className="text-sm mb-3">{r.type}</p>
                            <button 
                                onClick={() => handleToggleStatus(r.id, r.isOpen)}
                                className={`text-sm py-1 px-3 rounded-full font-semibold transition ${r.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                                {r.isOpen ? 'Close Now' : 'Open Store'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Menu Management */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-indigo-400 border-b border-slate-700 pb-2">Menu Management</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Select Restaurant to Edit</label>
                        <select 
                            value={selectedRest} 
                            onChange={e => setSelectedRest(e.target.value)}
                            className="w-full p-3 rounded-lg bg-slate-700 text-white border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                        </select>
                    </div>
                    {selectedRestaurant && <MenuManager />}
                </section>

                {/* Staff and Credential Management */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-indigo-400 border-b border-slate-700 pb-2">Access Control</h2>
                    <CredentialManager />
                    
                    <h3 className="text-xl font-bold mt-8 mb-3 text-slate-300">Staff Roster (Mock)</h3>
                    <div className="bg-slate-800 p-4 rounded-xl">
                        {staffRoster.map((s, i) => (
                            <div key={i} className="flex justify-between py-2 border-b border-slate-700 last:border-b-0">
                                <span className="text-white">{s.name}</span>
                                <span className="text-sm text-yellow-400">{s.role} / {s.shift}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="mt-8">
                <button onClick={logout} className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition">
                    Logout
                </button>
            </section>
        </div>
    );
};


// --- Customer Components (Shared Logic) ---

// Cart Drawer Content
const CartDrawerContent = ({ closeDrawer, openPaymentDrawer, state, removeFromCart }) => {
    const total = state.cart.reduce((a, c) => a + c.price, 0);

    if (state.cart.length === 0) {
        return <div className="text-center py-10 text-slate-400">Your cart is empty. Start adding items!</div>;
    }

    const itemsHtml = state.cart.map((it, i) => (
        <div key={i} className='flex items-center justify-between py-3 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-800/50 px-2 -mx-2 rounded-md transition'>
            <div className='flex-grow pr-4'>
                <div className='font-semibold text-white'>{it.item}</div>
                <div className='text-xs text-slate-500'>from {it.rest}</div>
            </div>
            <div className='font-bold text-yellow-400'>₹{it.price}</div>
            <button 
                className='ml-3 text-sm font-medium text-red-400 hover:text-red-500 transition' 
                onClick={() => removeFromCart(i)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
    ));

    const footer = (
        <>
            <div className="flex justify-between items-center text-2xl font-bold mb-4">
                <span>Total:</span>
                <span className="text-yellow-400">₹{total.toFixed(0)}</span>
            </div>
            <button 
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition" 
                onClick={() => openPaymentDrawer(total)}
            >
                Proceed to Payment
            </button>
        </>
    );

    return { title: `🛒 Your Cart (${state.cart.length})`, body: itemsHtml, footer };
};


// Menu Drawer Content
const MenuDrawerContent = ({ rest, addToCart }) => {
    const itemsBlock = (section, items) => (
        <section className="mb-6">
            <h3 className="text-xl font-bold mb-3 border-b border-slate-700 pb-1 text-indigo-400">{capitalize(section)}</h3>
            {items?.map((it, i) => (
                <div key={i} className='flex items-center justify-between py-2 border-b border-slate-800/50 last:border-b-0'>
                    <div className='flex-grow pr-4'>
                        <div className='font-semibold text-white'>{it.n}</div>
                        <div className='text-xs text-slate-400'>{it.d}</div>
                    </div>
                    <div className='font-bold text-yellow-400 min-w-[70px] text-right'>₹{it.p}</div>
                    <button 
                        className='ml-3 text-xs font-medium text-slate-900 bg-indigo-500 hover:bg-indigo-600 py-1 px-3 rounded-lg transition' 
                        onClick={() => addToCart({ id: rest.id, rest: rest.name, item: it.n, price: it.p })}
                    >
                        Add
                    </button>
                </div>
            ))}
        </section>
    );

    const body = (
        <>
            <p className="text-slate-400 mb-4 font-medium">{rest.type} • Tap 'Add' to place items in your cart (🛒).</p>
            <div className="space-y-6">
                {itemsBlock("starters", rest.menu?.starters)}
                {itemsBlock("drinks", rest.menu?.drinks)}
                {itemsBlock("main", rest.menu?.main)}
            </div>
        </>
    );
    
    return { title: `${rest.name} Menu`, body };
};


// Previous Orders Drawer Content
const OrdersDrawerContent = ({ orders, closeDrawer, title }) => {
    const rows = orders.map((o, i) => (
        <tr key={o.id || i} className="border-b border-slate-700/50">
            <td className="p-3 text-slate-400">{orders.length - i}</td>
            <td className="p-3 text-sm">{new Date(o.when).toLocaleString()}</td>
            <td className="p-3 text-indigo-400 font-semibold">{o.mode}</td>
            <td className="p-3 font-bold text-yellow-400">₹{o.total}</td>
            <td className="p-3 text-sm text-slate-500">{o.items?.length || 0} items</td>
        </tr>
    )).reverse().slice(0, 10); // Show up to 10 latest orders

    const body = (
        <div className="overflow-x-auto">
            <table className="w-full text-left bg-slate-800 rounded-xl overflow-hidden">
                <thead>
                    <tr className="bg-slate-700">
                        <th className="p-3 rounded-tl-lg">#</th>
                        <th className="p-3">When</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3">Total</th>
                        <th className="p-3 rounded-tr-lg">Details</th>
                    </tr>
                </thead>
                <tbody>{rows.length > 0 ? rows : <tr><td colSpan={5} className="text-center p-6 text-slate-500">No orders placed yet.</td></tr>}</tbody>
            </table>
        </div>
    );
    
    return { title: title || "🧾 Previous Orders", body, footer: null };
};


// Mess History Drawer Content
const MessHistoryDrawerContent = ({ messHistory, closeDrawer }) => {
    const rows = messHistory.map((m, i) => (
        <tr key={m.id || i} className="border-b border-slate-700/50">
            <td className="p-3 text-slate-400">{messHistory.length - i}</td>
            <td className="p-3 text-sm">{new Date(m.when).toLocaleDateString()}</td>
            <td className="p-3 text-indigo-400 font-semibold">{m.meal?.split(' ')[0]}</td>
            <td className="p-3 font-bold text-yellow-400">#{(m.seat)}</td>
            <td className="p-3 text-sm text-slate-500">{m.menu?.split(' ')[0]}</td>
        </tr>
    )).reverse(); // Show latest bookings first

    const body = (
        <>
            <p className="text-slate-400 mb-4">You have a total of <span className="font-bold text-white">{messHistory.length}</span> bookings recorded.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-left bg-slate-800 rounded-xl overflow-hidden">
                    <thead>
                        <tr className="bg-slate-700">
                            <th className="p-3 rounded-tl-lg">#</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Meal</th>
                            <th className="p-3">Seat</th>
                            <th className="p-3 rounded-tr-lg">Type</th>
                        </tr>
                    </thead>
                    <tbody>{rows.length > 0 ? rows : <tr><td colSpan={5} className="text-center p-6 text-slate-500">No mess bookings yet.</td></tr>}</tbody>
                </table>
            </div>
        </>
    );

    return { title: "🧾 Mess Booking History", body, footer: null };
};


// Mess Booking Drawer Content
const MessBookingDrawerContent = ({ userId, db, showMessage, closeDrawer }) => {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [meal, setMeal] = useState("Breakfast (7:30 AM)");
    const [menu, setMenu] = useState("Standard Veg Thali");
    const [isBooking, setIsBooking] = useState(false);

    const handleBook = async () => {
        setIsBooking(true);
        const seat = Math.floor(Math.random() * 1000) + 1;
        const bookingDetails = { date, meal, menu, seat, when: new Date().toISOString() };
        
        const success = await bookMessMeal(db, userId, bookingDetails, showMessage);
        
        if (success) {
            closeDrawer();
        }
        setIsBooking(false);
    };

    const body = (
        <div className="space-y-4">
            <p className="text-slate-400">Select your meal options below.</p>
            <div>
                <label htmlFor="messDate" className="text-sm font-medium text-slate-400">Date</label>
                <input type="date" id="messDate" className="w-full mt-1 p-3 rounded-lg border bg-slate-700 text-white focus:ring-yellow-500 focus:border-yellow-500" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
                <label htmlFor="messMeal" className="text-sm font-medium text-slate-400">Meal Time</label>
                <select id="messMeal" className="w-full mt-1 p-3 rounded-lg border bg-slate-700 text-white focus:ring-yellow-500 focus:border-yellow-500" value={meal} onChange={e => setMeal(e.target.value)}>
                    <option>Breakfast (7:30 AM)</option>
                    <option>Lunch (1:00 PM)</option>
                    <option>Dinner (8:00 PM)</option>
                </select>
            </div>
            <div>
                <label htmlFor="messMenu" className="text-sm font-medium text-slate-400">Menu Option</label>
                <select id="messMenu" className="w-full mt-1 p-3 rounded-lg border bg-slate-700 text-white focus:ring-yellow-500 focus:border-yellow-500" value={menu} onChange={e => setMenu(e.target.value)}>
                    <option>Standard Veg Thali</option>
                    <option>Non-Veg Addition (+₹50)</option>
                    <option>Diet Meal</option>
                </select>
            </div>
        </div>
    );
    
    const footer = (
        <button 
            className="w-full bg-yellow-500 text-slate-900 font-bold py-3 rounded-xl hover:opacity-95 transition shadow-lg shadow-yellow-500/50 disabled:opacity-50" 
            onClick={handleBook}
            disabled={isBooking}
        >
            {isBooking ? 'Booking...' : 'Book Meal Slot'}
        </button>
    );

    return { title: "🏷️ Book Mess Meal", body, footer };
};


// --- Main Role Components ---

const StudentPortal = ({ role }) => {
    const { state, closeDrawer, openDrawer, showMessage, updateCart, updateWallet, logout } = useAppContext();
    
    const availableRestaurants = state.restaurants.filter(r => r.isOpen);
    
    const handleAddToCart = (item) => {
        updateCart([...state.cart, item]);
        showMessage(`Added ${item.item} to cart!`, 'info', 1500);
    };

    const handleRemoveFromCart = (index) => {
        const newCart = state.cart.filter((_, i) => i !== index);
        updateCart(newCart);
    };

    const handleOpenMenuDrawer = (rest) => {
        const { title, body } = MenuDrawerContent({ rest, addToCart: handleAddToCart });
        const footer = (
            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition" onClick={handleOpenCartDrawer}>
                View Cart ({state.cart.length} items)
            </button>
        );
        openDrawer(title, body, footer);
    };

    const handleOpenCartDrawer = () => {
        const { title, body, footer } = CartDrawerContent({ 
            closeDrawer, 
            openPaymentDrawer: handleOpenPaymentDrawer, 
            state, 
            removeFromCart: handleRemoveFromCart 
        });
        openDrawer(title, body, footer);
    };

    const handleOpenPaymentDrawer = (amount) => {
        const placeOrderWrapper = (orderDetails) => 
            placeOrder(state.db, state.userId, orderDetails, showMessage, (newWallet) => updateWallet(newWallet));

        const body = (
            <PaymentDrawerContent 
                amount={amount} 
                closeDrawer={closeDrawer} 
                showMessage={showMessage} 
                placeOrder={placeOrderWrapper} 
                userId={state.userId} 
                updateWallet={updateWallet} 
                wallet={state.wallet}
                cart={state.cart}
                updateCart={updateCart}
            />
        );

        openDrawer("💳 Select Payment", body, null);
    };
    
    const handleOpenOrdersDrawer = () => {
        const { title, body } = OrdersDrawerContent({ orders: state.orders, closeDrawer });
        openDrawer(title, body, null);
    };
    
    const handleOpenMessBookingDrawer = () => {
        const { title, body, footer } = MessBookingDrawerContent({ db: state.db, userId: state.userId, showMessage, closeDrawer });
        openDrawer(title, body, footer);
    };
    
    const handleOpenMessHistoryDrawer = () => {
        const { title, body } = MessHistoryDrawerContent({ messHistory: state.messHistory, closeDrawer });
        openDrawer(title, body, null);
    };


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold mb-3 text-white">
                {role === 'hosteller' ? 'Hosteller Portal' : 'Day Scholar Portal'}
            </h1>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-slate-800/70 p-8 rounded-2xl border-l-4 border-indigo-500">
                    <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-3">
                        👋 Welcome, {state.user?.displayName || 'Student'}!
                    </div>
                    <p className="text-slate-400 mb-6 text-lg">Order food from 
                        <span className="font-bold text-white"> {availableRestaurants.length}</span> open spots.
                    </p>
                    <button onClick={logout} className="bg-red-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-red-700 transition text-sm">
                        Logout
                    </button>
                </div>
                
                <div className="bg-slate-800/70 p-8 rounded-2xl border-r-4 border-yellow-500">
                    <h3 className="text-xl font-bold mb-3">Campus Wallet Balance</h3>
                    <div className="text-4xl md:text-5xl font-extrabold text-yellow-400 mb-4">
                        ₹<span id="walletBalance">{state.wallet.toFixed(0)}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-700">
                        <button onClick={handleOpenOrdersDrawer} className="text-sm font-medium text-indigo-400 hover:underline">
                            Previous Orders
                        </button>
                        {role === 'hosteller' && (
                            <button onClick={handleOpenMessBookingDrawer} className="text-sm font-medium text-yellow-400 hover:underline">
                                Book Mess Meal
                            </button>
                        )}
                        {role === 'hosteller' && (
                            <button onClick={handleOpenMessHistoryDrawer} className="text-sm font-medium text-indigo-400 hover:underline">
                                Mess History
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Restaurant Gallery */}
            <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 pt-4 border-b pb-2 border-slate-700">🍽️ Today's Open Spots ({availableRestaurants.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {availableRestaurants.map(r => (
                        <div key={r.id} className="bg-slate-800 p-3 rounded-xl hover:ring-2 ring-indigo-500/80 transition cursor-pointer" onClick={() => handleOpenMenuDrawer(r)}>
                            <img className="w-full h-28 object-cover rounded-lg mb-2" src={r.img} alt={`${r.name} placeholder`} loading="lazy"/>
                            <div className="font-bold text-lg text-white">{r.name}</div>
                            <div className="text-sm text-slate-400">{r.type}</div>
                        </div>
                    ))}
                    {availableRestaurants.length === 0 && <div className="text-slate-500 col-span-6 text-center py-10">All restaurants are currently closed.</div>}
                </div>
            </section>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    const { state, dispatch, showMessage } = useAppContext();
    const { 
        role, isAuthReady, isLoginModalOpen, message, isDrawerOpen, drawerContent, cart 
    } = state;
    
    // Check if the user is authenticated and has a defined role
    const isAuthenticated = isAuthReady && role;

    // --- Auth/Login Handler ---
    const handleLogin = async (name, roll) => {
        if (!state.db) {
            showMessage("Database is not ready. Please wait.", 'error');
            return;
        }

        const { success, role: userRole, message: msg } = await authenticateUser(state.db, name, roll);
        
        if (success) {
            // Update the user's display name and role upon successful database login
            dispatch({ 
                type: 'SET_USER', 
                payload: { user: { ...state.user, displayName: name }, userId: state.userId, role: userRole } 
            });
            dispatch({ type: 'SET_LOGIN_MODAL_OPEN', payload: false });
            showMessage(msg, 'success');
        } else {
            showMessage(msg, 'error');
        }
    };

    // --- Theme Toggle ---
    const toggleMode = () => {
        dispatch({ type: 'TOGGLE_MODE' });
    };

    // --- Render Logic ---
    let mainContent;
    if (!isAuthReady) {
        mainContent = <div className="text-center py-40 text-slate-400 text-xl">Initializing Application...</div>;
    } else if (isAuthenticated) {
        if (role === 'manager') {
            mainContent = <ManagerDashboard 
                restaurants={state.restaurants} 
                role={role} 
                showMessage={showMessage} 
                db={state.db}
                closeDrawer={state.closeDrawer}
                openDrawer={state.openDrawer}
            />;
        } else {
            mainContent = <StudentPortal role={role} />;
        }
    } else {
        // Show a placeholder while waiting for login
        mainContent = (
            <div className="text-center py-40 text-slate-400 text-xl">
                Please log in using your credentials to access the campus dining portal.
            </div>
        );
    }

    return (
        <div className={`${state.isLightMode ? 'light' : 'dark'} min-h-screen transition-colors duration-300`}>
            {/* Global Styles based on state */}
            <style>
                {`
                    :root {
                        --font-stack: 'Inter', system-ui, sans-serif;
                        --color-primary: #818cf8;
                        --color-accent: #facc15; /* Yellow for financial/manager highlights */
                        --color-bg-rgb: 15,23,42;
                    }
                    html { scroll-behavior: smooth; font-family: var(--font-stack); }
                    .dark {
                        --color-bg: #0f172a;
                        --color-card: #1e293b;
                        --color-text: #f1f5f9;
                        --color-bg-rgb: 15,23,42;
                    }
                    .light {
                        --color-bg: #f8fafc;
                        --color-card: #ffffff;
                        --color-text: #1e293b;
                        --color-bg-rgb: 248,250,252;
                    }
                    body {
                        background-color: var(--color-bg);
                        color: var(--color-text);
                        min-height: 100vh;
                        overflow-x: hidden;
                        transition: background-color 0.3s ease;
                    }
                    .card-base {
                      background-color: var(--color-card);
                      border: 1px solid rgba(255, 255, 255, 0.05);
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                      transition: background-color 0.3s ease, box-shadow 0.3s ease;
                    }
                    .light .card-base {
                      border: 1px solid rgba(0, 0, 0, 0.05);
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    }
                    .nav-gradient {
                        background: rgba(var(--color-bg-rgb), 0.9);
                        backdrop-filter: blur(10px);
                    }
                `}
            </style>
            
            {/* Navigation */}
            <nav className="sticky top-0 z-50 nav-gradient border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/80 shadow-lg"></div>
                            <span className="font-extrabold text-xl tracking-tight text-white">Campus Eats</span>
                            {role && (
                                <span className={`role-pill bg-indigo-500/20 text-indigo-400 text-xs font-mono px-2 py-0.5 rounded-full`}>
                                    <strong>{capitalize(role)}</strong>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button onClick={toggleMode} className="p-2 rounded-full hover:bg-slate-700/50 transition text-2xl">
                                {state.isLightMode ? '☀️' : '🌙'}
                            </button>
                            
                            {role !== 'manager' && isAuthenticated && (
                                <button onClick={state.openDrawer.bind(null, '🛒 Your Cart', <CartDrawerContent closeDrawer={state.closeDrawer} openPaymentDrawer={() => {}} state={state} removeFromCart={()=>{}} />, null)} className="p-2 rounded-full hover:bg-slate-700/50 transition relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{cart.length}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="min-h-[80vh]">
                {mainContent}
            </main>

            {/* Footer */}
            <footer className="mt-12 py-8 border-t border-slate-700">
                <p className="text-center text-sm text-slate-500">
                    © 2025 Campus Eats • Powered by React & Firestore • Secured by Firebase Auth
                </p>
            </footer>

            {/* Modals and Drawers */}
            <LoginModal 
                isModalOpen={isLoginModalOpen && isAuthReady && !isAuthenticated} 
                onLogin={handleLogin} 
            />
            <Drawer 
                isOpen={isDrawerOpen} 
                content={drawerContent} 
                closeDrawer={state.closeDrawer} 
            />
            <MessageToast 
                message={message} 
                clearMessage={state.clearMessage} 
            />
        </div>
    );
};

// Wrapper to provide context
const CampusEatsApp = () => (
    <AppProvider>
        <App />
    </AppProvider>
);

export default CampusEatsApp;