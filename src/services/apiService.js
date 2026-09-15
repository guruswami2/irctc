const API_BASE_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
	const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	return response.json();
}

export async function fetchTrains() {
	return request('/trains');
}

export async function fetchTrainById(trainId) {
	return request(`/trains/${trainId}`);
}

export async function createTrain(trainData) {
	return request('/trains', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(trainData),
	});
}

export async function deleteTrain(trainId) {
	return request(`/trains/${trainId}`, {
		method: 'DELETE',
	});
}

export async function createBooking(bookingData) {
	return request('/bookings', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(bookingData),
	});
}

export async function fetchBookings() {
	return request('/bookings');
}

export async function updateBooking(bookingId, data) {
	return request(`/bookings/${bookingId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
}

export const apiService = {
	fetchTrains,
	fetchTrainById,
	createTrain,
	deleteTrain,
	createBooking,
	fetchBookings,
	updateBooking,
};
