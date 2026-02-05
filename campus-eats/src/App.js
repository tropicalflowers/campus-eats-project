import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppProvider from './app.jsx';
import LoginModal from './LoginModal';
import MainPage from './MainPage';
import Hosteller from './Hosteller';
import DayScholar from './DayScholar';
import Manager from './Manager';
import './index.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <LoginModal />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/hosteller" element={<Hosteller />} />
          <Route path="/dayscholar" element={<DayScholar />} />
          <Route path="/manager" element={<Manager />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
