// Central API helper with automatic fallback between Vite proxy (/api) and direct JSON Server (http://localhost:5000)

const DEFAULT_STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad' }
];

async function fetchWithFallback(endpoint, options = {}) {
  const primaryUrl = `/api${endpoint}`;
  const fallbackUrl = `http://localhost:5000${endpoint}`;

  try {
    const res = await fetch(primaryUrl, options);
    if (res.ok) return await res.json();
  } catch (e) {
    // Primary failed, try fallback
  }

  try {
    const res = await fetch(fallbackUrl, options);
    if (res.ok) return await res.json();
    throw new Error(`HTTP Error ${res.status}`);
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const apiService = {
  // Stations
  async getStations() {
    try {
      const res = await fetchWithFallback('/stations');
      if (res && Array.isArray(res) && res.length > 0) return res;
    } catch (err) {}
    return DEFAULT_STATIONS;
  },

  // Trains
  async getTrains() {
    try {
      return await fetchWithFallback('/trains');
    } catch (err) {
      return [];
    }
  },

  async addTrain(trainData) {
    return await fetchWithFallback('/trains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainData)
    });
  },

  async updateTrain(id, trainData) {
    return await fetchWithFallback(`/trains/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainData)
    });
  },

  async deleteTrain(id) {
    return await fetchWithFallback(`/trains/${id}`, {
      method: 'DELETE'
    });
  },

  // Users & Auth
  async getUsers() {
    try {
      return await fetchWithFallback('/users');
    } catch (err) {
      return [];
    }
  },

  async createUser(userData) {
    return await fetchWithFallback('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  },

  async updateUserProfile(userId, updatedUserData) {
    return await fetchWithFallback(`/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUserData)
    });
  },

  // Bookings
  async getBookings(userId) {
    try {
      const endpoint = userId ? `/bookings?userId=${userId}` : '/bookings';
      return await fetchWithFallback(endpoint);
    } catch (err) {
      return [];
    }
  },

  async createBooking(bookingData) {
    return await fetchWithFallback('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
  },

  async cancelBooking(bookingId, refundDetails) {
    return await fetchWithFallback(`/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'CANCELLED',
        cancellationRefund: refundDetails,
        cancelledAt: new Date().toISOString()
      })
    });
  }
};
