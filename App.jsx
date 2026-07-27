import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import BookingHistory from './pages/BookingHistory';
import ProfilePage from './pages/ProfilePage';
import TrainManager from './components/Admin/TrainManager';
import { apiService } from './api/apiService';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('search');
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stRes, trRes] = await Promise.all([
        apiService.getStations(),
        apiService.getTrains()
      ]);
      setStations(stRes);
      if (trRes && trRes.length > 0) {
        setTrains(trRes);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const bRes = await apiService.getBookings(user ? user.id : null);
      setBookings(bRes);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [user]);

  // Local state updaters for instant UI response
  const handleAddTrainLocal = (newTrain) => {
    setTrains(prev => [newTrain, ...prev]);
  };

  const handleDeleteTrainLocal = (trainId) => {
    setTrains(prev => prev.filter(t => t.id !== trainId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      <main style={{ flex: 1, padding: '20px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666' }}>
            Loading Railway Portal Data...
          </div>
        ) : (
          <>
            {currentTab === 'search' && (
              <HomePage
                stations={stations}
                trains={trains}
                onRefreshBookings={loadBookings}
                onNavigateToBookings={() => setCurrentTab('bookings')}
              />
            )}

            {currentTab === 'bookings' && (
              <BookingHistory
                bookings={bookings}
                onRefreshBookings={loadBookings}
              />
            )}

            {currentTab === 'profile' && (
              <ProfilePage />
            )}

            {currentTab === 'admin' && (
              <TrainManager
                trains={trains}
                stations={stations}
                onRefreshTrains={loadData}
                onAddTrainLocal={handleAddTrainLocal}
                onDeleteTrainLocal={handleDeleteTrainLocal}
              />
            )}
          </>
        )}
      </main>

      <Footer />
      <Toast />

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
