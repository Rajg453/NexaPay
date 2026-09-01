import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { Footer } from './components/Footer'
import { Dashboard } from './pages/Dashboard'
import { AddMoney } from './pages/AddMoney'
import { Recharge } from './pages/Recharge'
import { Rewards } from './pages/Rewards';
import { Transactions } from './pages/Transactions';
import { ScanAndPay } from './pages/ScanAndPay';
import { Transfer } from './pages/Transfer';
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column' }}>
      {!isAuthPage && <Header />}
      
      <main style={{ marginTop: isAuthPage ? '0' : '24px', flex: 1, display: 'flex' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-money" element={<AddMoney />} />
            <Route path="/recharge/:type" element={<Recharge />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/scan" element={<ScanAndPay />} />
            <Route path="/transfer/:receiverId" element={<Transfer />} />
          </Route>
        </Routes>
      </main>

      {!isAuthPage && (
        <>
          <div className="desktop-only">
            <Footer />
          </div>
          <BottomNav />
        </>
      )}
    </div>
  )
}

export default App
