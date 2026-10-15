import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { AuthProvider } from '../context/AuthContext';

export const AppShell: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default AppShell;
