import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle, MapPin, Ticket, XCircle } from 'lucide-react';
import { fetchBookings, updateBooking } from '../../services/apiService.js';

function getLoggedInUser() {
	try {
		return JSON.parse(localStorage.getItem('irctcLoggedInUser') || 'null');
	} catch {
		return null;
	}
}

function MyBookings({ navigate, loggedInUser: activeUser }) {
	const loggedInUser = activeUser || getLoggedInUser();
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(Boolean(loggedInUser));
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const [cancellingId, setCancellingId] = useState(null);

	useEffect(() => {
		if (!loggedInUser) {
			setLoading(false);
			return;
		}

		async function loadBookings() {
			try {
				setLoading(true);
				setError('');
				const allBookings = await fetchBookings();
				const userBookings = allBookings.filter((booking) => booking?.userEmail?.toLowerCase() === loggedInUser.email.toLowerCase());
				setBookings(userBookings);
			} catch {
				setError('We could not load your bookings. Please try again.');
			} finally {
				setLoading(false);
			}
		}

		loadBookings();
	}, [loggedInUser]);

	async function handleCancel(booking) {
		if (!window.confirm(`Cancel booking ${booking.id}?`)) return;

		try {
			setCancellingId(booking.id);
			setError('');
			setMessage('');
			const updatedBooking = await updateBooking(booking.id, {
				status: 'Cancelled',
				cancelledAt: new Date().toISOString(),
			});
			setBookings((currentBookings) => currentBookings.map((item) => item.id === booking.id ? { ...item, ...updatedBooking } : item));
			setMessage(`Booking ${booking.id} was cancelled successfully.`);
		} catch {
			setError('We could not cancel this booking. Please try again.');
		} finally {
			setCancellingId(null);
		}
	}

	if (!loggedInUser) {
		return (
			<section className="profile-page profile-empty">
				<div className="profile-empty-icon" aria-hidden="true"><Ticket size={26} /></div>
				<p className="eyebrow">MY BOOKINGS</p>
				<h1>Please log in</h1>
				<p>Log in to view and manage your bookings.</p>
				<button className="primary-button" onClick={() => navigate('/login')}>Go to Login</button>
			</section>
		);
	}

	if (loading) return <p className="results-status">Loading your bookings...</p>;

	return (
		<section className="bookings-page">
			<div className="bookings-heading">
				<div>
					<p className="eyebrow">YOUR ACCOUNT</p>
					<h1>My Bookings</h1>
					<p>View your confirmed and cancelled train bookings.</p>
				</div>
				<span className="panel-icon" aria-hidden="true"><Ticket size={22} /></span>
			</div>
			{error && <p className="results-status error" role="alert">{error}</p>}
			{message && <p className="form-message success booking-message" role="status"><CheckCircle size={16} /> {message}</p>}
			{!error && bookings.length === 0 && (
				<div className="results-empty"><Ticket size={28} /><h2>No bookings found</h2><p>Your completed bookings will appear here.</p></div>
			)}
			<div className="booking-list">
				{bookings.map((booking) => {
					const isCancelled = String(booking.status).toLowerCase() === 'cancelled';
					const passengers = Array.isArray(booking.passengers) ? booking.passengers : [];
					return (
						<article className="booking-card" key={booking.id}>
							<div className="booking-card-top">
								<div><p className="booking-card-id">Booking ID: {booking.id}</p><h2>{booking.trainName || 'Train details unavailable'} <small>#{booking.trainNumber || 'N/A'}</small></h2></div>
								<span className={isCancelled ? 'booking-status cancelled' : 'booking-status confirmed'}>{isCancelled ? <XCircle size={15} /> : <CheckCircle size={15} />} {isCancelled ? 'Cancelled' : 'Confirmed'}</span>
							</div>
							<div className="booking-route"><span><MapPin size={15} /> {booking.sourceName || booking.source || 'Unknown source'}</span><span>to</span><span>{booking.destinationName || booking.destination || 'Unknown destination'}</span></div>
							<div className="booking-details-grid">
								<span><strong><CalendarDays size={14} /> Journey Date</strong>{booking.journeyDate || 'Not provided'}</span>
								<span><strong>Class</strong>{booking.classType || 'Not provided'}</span>
								<span><strong>Quota</strong>{booking.quota || 'Not provided'}</span>
								<span><strong>Total Fare</strong>Rs. {booking.totalFare ?? 'N/A'}</span>
							</div>
							<div className="booking-passengers"><strong>Passengers</strong><span>{passengers.length > 0 ? passengers.map((passenger) => passenger.fullName || passenger.name || 'Unnamed passenger').join(', ') : 'Passenger details unavailable'}</span></div>
							{!isCancelled && <button className="cancel-booking-button" disabled={cancellingId === booking.id} onClick={() => handleCancel(booking)}>{cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}</button>}
						</article>
					);
				})}
			</div>
		</section>
	);
}

export default MyBookings;
