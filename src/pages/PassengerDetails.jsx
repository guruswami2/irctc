import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle, MapPin, TrainFront, UserRound } from 'lucide-react';
import { fetchTrainById } from '../services/apiService.js';

function getLoggedInUser() {
	try {
		return JSON.parse(localStorage.getItem('irctcLoggedInUser') || 'null');
	} catch {
		return null;
	}
}

function getSavedPassengers(email) {
	try {
		return JSON.parse(localStorage.getItem(`irctcPassengerMaster_${email.toLowerCase()}`) || '[]');
	} catch {
		return [];
	}
}

function PassengerDetails({ navigate, loggedInUser: activeUser }) {
	const loggedInUser = activeUser || getLoggedInUser();
	const searchParams = new URLSearchParams(window.location.search);
	const trainId = searchParams.get('trainId') || '';
	const selectedClass = searchParams.get('class') || '';
	const selectedQuota = searchParams.get('quota') || '';
	const journeyDate = searchParams.get('date') || '';
	const [train, setTrain] = useState(null);
	const [passengers, setPassengers] = useState([]);
	const [selectedPassengerIds, setSelectedPassengerIds] = useState([]);
	const [loading, setLoading] = useState(Boolean(trainId));
	const [error, setError] = useState('');
	const [selectionError, setSelectionError] = useState('');

	useEffect(() => {
		if (loggedInUser) {
			setPassengers(getSavedPassengers(loggedInUser.email));
		}
	}, [loggedInUser]);

	useEffect(() => {
		if (!trainId) {
			setLoading(false);
			setError('A train was not selected.');
			return;
		}

		async function loadTrain() {
			try {
				setLoading(true);
				setError('');
				const selectedTrain = await fetchTrainById(trainId);
				if (!selectedTrain?.id) throw new Error('Train not found');
				if (!selectedClass || !selectedTrain.classes?.[selectedClass]) throw new Error('Invalid class');
				if (!selectedQuota || !selectedTrain.quotas?.[selectedQuota]) throw new Error('Invalid quota');
				setTrain(selectedTrain);
			} catch {
				setError('The train, class, or quota selection is invalid. Please return to Train Availability.');
			} finally {
				setLoading(false);
			}
		}

		loadTrain();
	}, [trainId, selectedClass, selectedQuota]);

	function togglePassenger(passengerId) {
		setSelectionError('');
		setSelectedPassengerIds((currentIds) => currentIds.includes(passengerId)
			? currentIds.filter((id) => id !== passengerId)
			: [...currentIds, passengerId]);
	}

	function removeSelectedPassenger(passengerId) {
		setSelectedPassengerIds((currentIds) => currentIds.filter((id) => id !== passengerId));
	}

	function handleContinue() {
		if (selectedPassengerIds.length === 0) {
			setSelectionError('Please select at least one passenger to continue.');
			return;
		}

		const selectedPassengers = passengers.filter((passenger) => selectedPassengerIds.includes(passenger.id));
		const params = new URLSearchParams({
			trainId,
			class: selectedClass,
			quota: selectedQuota,
			date: journeyDate,
			passengers: JSON.stringify(selectedPassengers),
		});
		navigate(`/payment?${params.toString()}`);
	}

	if (!loggedInUser) {
		return (
			<section className="profile-page profile-empty">
				<div className="profile-empty-icon" aria-hidden="true"><UserRound size={26} /></div>
				<p className="eyebrow">PASSENGER DETAILS</p>
				<h1>Please log in</h1>
				<p>Log in to select passengers for your train journey.</p>
				<button className="primary-button" onClick={() => navigate('/login')}>Go to Login</button>
			</section>
		);
	}

	if (loading) return <p className="results-status">Loading passenger details...</p>;

	if (error || !train) {
		return (
			<section className="availability-empty">
				<TrainFront size={30} />
				<p className="eyebrow">PASSENGER DETAILS</p>
				<h1>{error || 'Selection not found'}</h1>
				<button className="primary-button" onClick={() => navigate(trainId ? `/availability?trainId=${encodeURIComponent(trainId)}` : '/search-results')}><ArrowLeft size={17} /> Back to Availability</button>
			</section>
		);
	}

	return (
		<section className="passenger-details-page">
			<div className="passenger-details-heading">
				<div>
					<p className="eyebrow">BOOKING STEP 3</p>
					<h1>Select passengers</h1>
					<p>Choose one or more passengers from your Passenger Master list.</p>
				</div>
				<span className="panel-icon" aria-hidden="true"><UserRound size={22} /></span>
			</div>

			<div className="passenger-details-layout">
				<div className="saved-passengers-card auth-card">
					<h2>Passenger Master</h2>
					{passengers.length === 0 ? (
						<div className="passenger-details-empty">
							<p>No passengers found. Please add a passenger in Passenger Master.</p>
							<button className="secondary-button" onClick={() => navigate('/passenger-master')}>Open Passenger Master</button>
						</div>
					) : (
						<div className="selectable-passenger-list">
							{passengers.map((passenger) => (
								<label className={selectedPassengerIds.includes(passenger.id) ? 'selectable-passenger selected' : 'selectable-passenger'} key={passenger.id}>
									<input type="checkbox" checked={selectedPassengerIds.includes(passenger.id)} onChange={() => togglePassenger(passenger.id)} />
									<span><strong>{passenger.fullName}</strong><small>{passenger.age} years · {passenger.gender} · {passenger.berthPreference}</small></span>
								</label>
							))}
						</div>
					)}
				</div>

				<div className="passenger-booking-summary">
					<p className="eyebrow">BOOKING SUMMARY</p>
					<h2>{train.trainName}</h2>
					<div className="summary-route"><span><MapPin size={15} /> {train.sourceName}</span><ArrowRight size={15} /><span>{train.destinationName}</span></div>
					<div className="summary-details">
						<span><strong>Train</strong> #{train.trainNumber}</span>
						<span><strong>Journey Date</strong> {journeyDate || 'Date not provided'}</span>
						<span><strong>Class</strong> {selectedClass}</span>
						<span><strong>Quota</strong> {selectedQuota}</span>
					</div>
					<div className="summary-passengers">
						<h3>Selected passengers</h3>
						{selectedPassengerIds.length === 0 ? <p>No passengers selected yet.</p> : selectedPassengerIds.map((id) => {
							const passenger = passengers.find((item) => item.id === id);
							return <div className="selected-passenger" key={id}><span>{passenger.fullName}</span><button type="button" onClick={() => removeSelectedPassenger(id)}>Remove</button></div>;
						})}
					</div>
					{selectionError && <p className="form-message error" role="alert">{selectionError}</p>}
					<button className="primary-button auth-button" onClick={handleContinue}><CheckCircle size={18} /> Continue to Payment</button>
				</div>
			</div>
		</section>
	);
}

export default PassengerDetails;
