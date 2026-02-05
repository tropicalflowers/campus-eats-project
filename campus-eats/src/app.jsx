import React, { useState, useEffect, createContext, useReducer, useCallback, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from 'firebase/auth';
import {
    getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, onSnapshot, collection
} from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

setLogLevel('debug');

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const initialState = {
    user: null,
    userId: null,
    role: null,
    isAuthReady: false,
    db: null,
    auth: null,
    restaurants: [],
    employees: [],
    cart: [],
    orders: [],
    messHistory: [],
    allOrders: [],
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
        case 'SET_EMPLOYEES':
            return { ...state, employees: action.payload };
        case 'SET_CART':
            return { ...state, cart: action.payload };
        case 'SET_ORDERS':
            return { ...state, orders: action.payload };
        case 'SET_ALL_ORDERS':
            return { ...state, allOrders: action.payload };
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

// Drawer Component
const Drawer = () => {
  const { state, closeDrawer } = useAppContext();
  const { isDrawerOpen, drawerContent } = state;

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50" onClick={closeDrawer}>
      <div className="bg-slate-900 w-full sm:max-w-2xl sm:rounded-t-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">{drawerContent.title}</h2>
          <button onClick={closeDrawer} className="text-slate-400 hover:text-white text-2xl">
            ×
          </button>
        </div>
        <div className="text-white">
          {drawerContent.body}
        </div>
        {drawerContent.footer && (
          <div className={drawerContent.footerClass}>
            {drawerContent.footer}
          </div>
        )}
      </div>
    </div>
  );
};

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const showMessage = useCallback((text, type = 'success', duration = 3000) => {
        dispatch({ type: 'SET_MESSAGE', payload: { text, type } });
        setTimeout(() => dispatch({ type: 'CLEAR_MESSAGE' }), duration);
    }, []);

    useEffect(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyCmTAAir5m1TrgbkiWf6mM1bQIbzj3pQCs",
            authDomain: "campus-eats-556e0.firebaseapp.com",
            projectId: "campus-eats-556e0",
            storageBucket: "campus-eats-556e0.firebasestorage.app",
            messagingSenderId: "269572970926",
            appId: "1:269572970926:web:b7c0201ea7e170910d903f",
        };

        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            dispatch({ type: 'SET_DB_AUTH', payload: { db, auth } });

            const unsubscribe = onAuthStateChanged(auth, (user) => {
                const userId = user?.uid || (window.crypto ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9));
                dispatch({ type: 'SET_AUTH_READY', payload: true });
                dispatch({ type: 'SET_USER', payload: { user: user, userId, role: user ? 'student' : null } });
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
            showMessage("Failed to initialize Firebase.", 'error');
        }
    }, [showMessage]);

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                const response = await fetch('/data/restaurants.json');
                if (response.ok) {
                    const restaurantsFromJSON = await response.json();
                    dispatch({ type: 'SET_RESTAURANTS', payload: restaurantsFromJSON });
                    console.log('Loaded restaurants from JSON:', restaurantsFromJSON);
                }
            } catch (error) {
                console.error('Error loading restaurants from JSON:', error);
            }

            if (state.db && state.isAuthReady) {
                const qRestaurants = collection(state.db, `/public/data/restaurants`);
                const unsubRestaurants = onSnapshot(qRestaurants, (snapshot) => {
                    if (!snapshot.empty) {
                        const restaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        dispatch({ type: 'SET_RESTAURANTS', payload: restaurants });
                        console.log('Loaded restaurants from Firestore:', restaurants);
                    }
                });
                return () => unsubRestaurants();
            }
        };

        loadRestaurants();
    }, [state.db, state.isAuthReady]);

    useEffect(() => {
        if (!state.db || !state.userId || !state.isAuthReady) return;

        const qOrders = collection(state.db, `/users/${state.userId}/orders`);
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SET_ORDERS', payload: orders });
        });

        const qMess = collection(state.db, `/users/${state.userId}/messHistory`);
        const unsubMess = onSnapshot(qMess, (snapshot) => {
            const messHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SET_MESS_HISTORY', payload: messHistory });
        });

        const qEmployees = collection(state.db, `/public/data/employees`);
        const unsubEmployees = onSnapshot(qEmployees, (snapshot) => {
            const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SET_EMPLOYEES', payload: employees });
        });

        const qAllOrders = collection(state.db, `/public/data/allOrders`);
        const unsubAllOrders = onSnapshot(qAllOrders, (snapshot) => {
            const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SET_ALL_ORDERS', payload: allOrders });
        });

        return () => {
            unsubOrders();
            unsubMess();
            unsubEmployees();
            unsubAllOrders();
        };
    }, [state.db, state.userId, state.isAuthReady]);

    const authFunctions = {
        signUp: async (email, password) => {
            if (!state.auth) return;
            try {
                const userCredential = await createUserWithEmailAndPassword(state.auth, email, password);
                showMessage('Account created successfully!', 'success');
                return userCredential.user;
            } catch (error) {
                showMessage(error.message, 'error');
                throw error;
            }
        },
        signIn: async (email, password) => {
            if (!state.auth) return;
            try {
                const userCredential = await signInWithEmailAndPassword(state.auth, email, password);
                showMessage('Logged in successfully!', 'success');
                dispatch({ type: 'SET_LOGIN_MODAL_OPEN', payload: false });
                return userCredential.user;
            } catch (error) {
                showMessage(error.message, 'error');
                throw error;
            }
        },
        signOut: async () => {
            if (!state.auth) return;
            await signOut(state.auth);
            dispatch({ type: 'SET_USER', payload: { user: null, userId: null, role: null } });
            dispatch({ type: 'SET_CART', payload: [] });
            dispatch({ type: 'SET_LOGIN_MODAL_OPEN', payload: true });
            showMessage("Logged out successfully.", 'info');
        },
    };

    /*const dbFunctions = {
        addCredential: async (credential) => {
            if (!state.db) return;
            await addDoc(collection(state.db, '/public/data/credentials'), credential);
        },
        addEmployee: async (employee) => {
            if (!state.db) return;
            await addDoc(collection(state.db, '/public/data/employees'), employee);
        },
        addRestaurant: async (restaurant) => {
            if (!state.db) return;
            await setDoc(doc(state.db, '/public/data/restaurants', restaurant.id), restaurant);
        },
        toggleRestaurantStatus: async (id, currentStatus) => {
            if (!state.db) return;
            await updateDoc(doc(state.db, '/public/data/restaurants', id), { isOpen: !currentStatus });
        },
        addDishToMenu: async (restaurantId, dish, section) => {
            if (!state.db) return;
            const restRef = doc(state.db, '/public/data/restaurants', restaurantId);
            const restDoc = await getDoc(restRef);
            if (restDoc.exists()) {
                const menu = restDoc.data().menu || {};
                menu[section] = [...(menu[section] || []), dish];
                await updateDoc(restRef, { menu });
            }
        },
    };*/
    // Inside app.jsx, update the dbFunctions object:

const dbFunctions = {
  addCredential: async (credential) => {
    if (!state.db) return;
    await addDoc(collection(state.db, '/public/data/credentials'), credential);
  },
  addEmployee: async (employee) => {
    if (!state.db) return;
    await addDoc(collection(state.db, '/public/data/employees'), employee);
  },
  addRestaurant: async (restaurant) => {
    if (!state.db) return;
    await setDoc(doc(state.db, '/public/data/restaurants', restaurant.id), restaurant);
  },
  toggleRestaurantStatus: async (id, currentStatus) => {
    if (!state.db) return;
    await updateDoc(doc(state.db, '/public/data/restaurants', id), { isOpen: !currentStatus });
  },
  addDishToMenu: async (restaurantId, dish, section) => {
    if (!state.db) return;
    const restRef = doc(state.db, '/public/data/restaurants', restaurantId);
    const restDoc = await getDoc(restRef);
    if (restDoc.exists()) {
      const menu = restDoc.data().menu || {};
      menu[section] = [...(menu[section] || []), dish];
      await updateDoc(restRef, { menu });
    }
  },
  // NEW: Add order to Firestore
  addOrder: async (userId, order) => {
    if (!state.db || !userId) return;
    await addDoc(collection(state.db, `/users/${userId}/orders`), order);
  },
  // NEW: Update wallet balance
  updateWallet: async (userId, newBalance) => {
    if (!state.db || !userId) return;
    await setDoc(doc(state.db, `/users/${userId}/wallet`), { balance: newBalance });
  }
};


    const value = {
        state,
        dispatch,
        showMessage,
        closeDrawer: () => dispatch({ type: 'CLOSE_DRAWER' }),
        openDrawer: (title, body, footer, footerClass) =>
            dispatch({ type: 'OPEN_DRAWER', payload: { title, body, footer, footerClass } }),
        logout: authFunctions.signOut,
        updateCart: (newCart) => dispatch({ type: 'SET_CART', payload: newCart }),
        updateWallet: (newWallet) => dispatch({ type: 'UPDATE_WALLET', payload: newWallet }),
        clearMessage: () => dispatch({ type: 'CLEAR_MESSAGE' }),
        dbFunctions,
        authFunctions,
    };

    return (
      <AppContext.Provider value={value}>
        {children}
        <Drawer />
        {state.message && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            state.message.type === 'success' ? 'bg-green-600' :
            state.message.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          } text-white font-bold`}>
            {state.message.text}
          </div>
        )}
      </AppContext.Provider>
    );
};

export { AppContext };
export default AppProvider;
