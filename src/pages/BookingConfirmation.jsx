import { CheckCircle, Home, Ticket, Wallet } from 'lucide-react';

function BookingConfirmation({ navigate }) {
	const searchParams = new URLSearchParams(window.location.search);
	const bookingId = searchParams.get('bookingId') || '';
	let booking = null;

	try {
		booking = JSON.parse(searchParams.get('booking') || 'null');
	} catch {
		booking = null;
	}

	if (!bookingId || !booking) {
		return (
			<section className="confirmation-empty">
				<Ticket size={32} />
				<h1>Booking details unavailable</h1>
				<p>Please return Home and start a new booking.</p>
				<button className="primary-button" onClick={() => navigate('/')}><Home size={17} /> Go to Home</button>
			</section>
		);
	}

	return (
		<section className="confirmation-page">
			<div className="confirmation-header">
				<div className="confirmation-icon"><CheckCircle size={30} /></div>
				<p className="eyebrow">BOOKING COMPLETE</p>
				<h1>Booking Confirmed</h1>
				<p>Your booking has been created successfully.</p>
			</div>
			<div className="confirmation-card">
				<div className="booking-id"><span>Booking ID</span><strong>{bookingId}</strong></div>
				<div className="confirmation-train"><div><p className="train-number">#{booking.trainNumber}</p><h2>{booking.trainName}</h2></div><Wallet size={22} /></div>
				<div className="confirmation-route"><span>{booking.sourceName}</span><span>to</span><span>{booking.destinationName}</span></div>
				<div className="confirmation-details">
					<span><strong>Journey Date</strong>{booking.journeyDate || 'Not provided'}</span>
					<span><strong>Class</strong>{booking.classType}</span>
					<span><strong>Quota</strong>{booking.quota}</span>
					<span><strong>Total Fare</strong>Rs. {booking.totalFare}</span>
				</div>
				<div className="confirmation-passengers">
					<h3>Passengers</h3>
					{booking.passengers.map((passenger) => <div key={`${passenger.id}-${passenger.fullName}`}><span>{passenger.fullName}</span><small>{passenger.age} years · {passenger.gender} · {passenger.berthPreference}</small></div>)}
				</div>
			</div>
			<div className="confirmation-actions">
				<button className="primary-button" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
				<button className="secondary-button" onClick={() => navigate('/')}><Home size={17} /> Go to Home</button>
			</div>
		</section>
	);
}

export default BookingConfirmation;
