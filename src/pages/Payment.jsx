import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, CreditCard, Loader2, TrainFront, Wallet } from 'lucide-react';
import { createBooking, fetchTrainById } from '../services/apiService.js';

function getLoggedInUser() {
	try {
		return JSON.parse(localStorage.getItem('irctcLoggedInUser') || 'null');
	} catch {
		return null;
	}
}

function Payment({ navigate, loggedInUser: activeUser }) {
	const loggedInUser = activeUser || getLoggedInUser();
	const searchParams = new URLSearchParams(window.location.search);
	const trainId = searchParams.get('trainId') || '';
	const selectedClass = searchParams.get('class') || '';
	const selectedQuota = searchParams.get('quota') || '';
	const journeyDate = searchParams.get('date') || '';
	const [passengers, setPassengers] = useState([]);
	const [train, setTrain] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState('Mock UPI');
	const [loading, setLoading] = useState(Boolean(trainId));
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		try {
			const savedPassengers = JSON.parse(searchParams.get('passengers') || '[]');
			setPassengers(Array.isArray(savedPassengers) ? savedPassengers : []);
		} catch {
			setError('The passenger information is invalid. Please start the booking again.');
		}

		if (!trainId) {
			setLoading(false);
			setError('Booking information is incomplete. Please select a train again.');
			return;
		}

		async function loadTrain() {
			try {
				setLoading(true);
				const selectedTrain = await fetchTrainById(trainId);
				if (!selectedTrain?.id || !selectedClass || !selectedTrain.classes?.[selectedClass] || !selectedQuota || !selectedTrain.quotas?.[selectedQuota]) {
					throw new Error('Invalid booking information');
				}
				setTrain(selectedTrain);
			} catch {
				setError('We could not load the booking details. Please return to Passenger Details.');
			} finally {
				setLoading(false);
			}
		}

		loadTrain();
	}, [trainId, selectedClass, selectedQuota]);

	const totalFare = train && passengers.length > 0 ? train.classes[selectedClass].price * passengers.length : 0;

	async function handlePayment() {
		if (!loggedInUser || !train || passengers.length === 0) {
			setError('Booking information is incomplete. Please start the booking again.');
			return;
		}

		setProcessing(true);
		setError('');
		try {
			await new Promise((resolve) => window.setTimeout(resolve, 700));
			const bookingId = `BK${Date.now().toString().slice(-10)}`;
			const booking = {
				id: bookingId,
				userEmail: loggedInUser.email,
				trainId: train.id,
				trainNumber: train.trainNumber,
				trainName: train.trainName,
				source: train.source,
				sourceName: train.sourceName,
				destination: train.destination,
				destinationName: train.destinationName,
				journeyDate,
				classType: selectedClass,
				quota: selectedQuota,
				passengers,
				totalFare,
				paymentMethod,
				status: 'BOOKED',
			};
			await createBooking(booking);
			const confirmationParams = new URLSearchParams({ bookingId, booking: JSON.stringify(booking) });
			navigate(`/booking-confirmation?${confirmationParams.toString()}`);
		} catch {
			setError('Payment simulation failed because the booking service is unavailable. Please try again.');
			setProcessing(false);
		}
	}

	if (!loggedInUser) {
		return (
			<section className="profile-page profile-empty">
				<div className="profile-empty-icon" aria-hidden="true"><Wallet size={26} /></div>
				<p className="eyebrow">PAYMENT</p>
				<h1>Please log in</h1>
				<p>Log in before continuing with your simulated payment.</p>
				<button className="primary-button" onClick={() => navigate('/login')}>Go to Login</button>
			</section>
		);
	}

	if (loading) return <p className="results-status">Loading payment summary...</p>;

	if (error || !train || passengers.length === 0) {
		return (
			<section className="availability-empty">
				<TrainFront size={30} />
				<p className="eyebrow">PAYMENT</p>
				<h1>{error || 'No passengers selected'}</h1>
				<p>Return to Passenger Details and select at least one passenger.</p>
				<button className="primary-button" onClick={() => navigate('/passenger-details')}><ArrowLeft size={17} /> Back to Passenger Details</button>
			</section>
		);
	}

	return (
		<section className="mock-payment-page">
			<div className="mock-payment-heading">
				<div><p className="eyebrow">BOOKING STEP 4</p><h1>Payment</h1><p>Choose a payment method to complete this booking.</p></div>
				<span className="panel-icon" aria-hidden="true"><Wallet size={22} /></span>
			</div>
			<div className="mock-payment-layout">
				<div className="payment-summary-card auth-card">
					<p className="eyebrow">BOOKING SUMMARY</p>
					<h2>{train.trainName} <small>#{train.trainNumber}</small></h2>
					<p className="summary-route-text">{train.sourceName} to {train.destinationName}</p>
					<div className="mock-summary-details">
						<span><strong>Journey Date</strong>{journeyDate || 'Not provided'}</span>
						<span><strong>Class</strong>{selectedClass}</span>
						<span><strong>Quota</strong>{selectedQuota}</span>
						<span><strong>Passengers</strong>{passengers.map((passenger) => passenger.fullName).join(', ')}</span>
					</div>
					<div className="total-fare"><span>Total fare</span><strong>Rs. {totalFare}</strong></div>
				</div>
				<div className="mock-payment-card auth-card">
					<h2>Choose payment method</h2>
					<div className="mock-payment-options">
						<label className={paymentMethod === 'Mock UPI' ? 'mock-payment-option selected' : 'mock-payment-option'}><input type="radio" name="paymentMethod" value="Mock UPI" checked={paymentMethod === 'Mock UPI'} onChange={(event) => setPaymentMethod(event.target.value)} /><Wallet size={19} /><span><strong>UPI</strong><small>Secure payment option</small></span></label>
						<label className={paymentMethod === 'Mock Card' ? 'mock-payment-option selected' : 'mock-payment-option'}><input type="radio" name="paymentMethod" value="Mock Card" checked={paymentMethod === 'Mock Card'} onChange={(event) => setPaymentMethod(event.target.value)} /><CreditCard size={19} /><span><strong>Card</strong><small>No card details required</small></span></label>
						<label className={paymentMethod === 'Mock Net Banking' ? 'mock-payment-option selected' : 'mock-payment-option'}><input type="radio" name="paymentMethod" value="Mock Net Banking" checked={paymentMethod === 'Mock Net Banking'} onChange={(event) => setPaymentMethod(event.target.value)} /><TrainFront size={19} /><span><strong>Net Banking</strong><small>No bank credentials required</small></span></label>
					</div>
					<p className="payment-safety-note">This is a simulated payment. Never enter card numbers, CVV, PINs, passwords, OTPs, or UPI PINs.</p>
					{error && <p className="form-message error" role="alert">{error}</p>}
					<button className="primary-button auth-button" onClick={handlePayment} disabled={processing}>{processing ? <><Loader2 className="spin-icon" size={18} /> Processing...</> : <><CheckCircle size={18} /> Pay Now</>}</button>
				</div>
			</div>
		</section>
	);
}

export default Payment;
