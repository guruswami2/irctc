import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock3, MapPin, TrainFront } from 'lucide-react';
import { fetchTrainById } from '../services/apiService.js';

function TrainAvailability({ navigate, loggedInUser }) {
	const trainId = new URLSearchParams(window.location.search).get('trainId');
	const [train, setTrain] = useState(null);
	const [selectedClass, setSelectedClass] = useState('');
	const [selectedQuota, setSelectedQuota] = useState('');
	const [loading, setLoading] = useState(Boolean(trainId));
	const [error, setError] = useState(trainId ? '' : 'No train was selected.');

	useEffect(() => {
		if (!trainId) return;

		async function loadTrain() {
			try {
				setLoading(true);
				setError('');
				const selectedTrain = await fetchTrainById(trainId);
				if (!selectedTrain || !selectedTrain.id) {
					throw new Error('Train not found');
				}
				setTrain(selectedTrain);
			} catch {
				setError('We could not find that train. Please return to Search Results and try again.');
			} finally {
				setLoading(false);
			}
		}

		loadTrain();
	}, [trainId]);

	function handleContinue() {
		if (!selectedClass || !selectedQuota || !train) return;
		const params = new URLSearchParams({
			trainId: train.id,
			class: selectedClass,
			quota: selectedQuota,
			date: new URLSearchParams(window.location.search).get('date') || '',
		});
		const passengerDetailsPath = `/passenger-details?${params.toString()}`;
		navigate(loggedInUser ? passengerDetailsPath : `/login?returnTo=${encodeURIComponent(passengerDetailsPath)}&message=${encodeURIComponent('Please login to continue booking.')}`);
	}

	if (loading) {
		return <p className="results-status">Loading train availability...</p>;
	}

	if (error || !train) {
		return (
			<section className="availability-empty">
				<TrainFront size={30} />
				<p className="eyebrow">TRAIN AVAILABILITY</p>
				<h1>{error || 'Train not found'}</h1>
				<p>Go back to your search to select a valid train.</p>
				<button className="primary-button" onClick={() => navigate('/search-results')}><ArrowLeft size={17} /> Back to Results</button>
			</section>
		);
	}

	const classOptions = Object.entries(train.classes || {});
	const quotaOptions = Object.entries(train.quotas || {});
	const selectedClassData = train.classes?.[selectedClass];
	const selectedQuotaData = train.quotas?.[selectedQuota];
	const hasSeats = selectedClassData && selectedQuotaData?.available !== false && selectedClassData.available > 0;
	const waitingListStatus = selectedClassData?.status?.startsWith('WL') ? selectedClassData.status : hasSeats ? 'Not applicable' : 'WL-Available soon';

	return (
		<section className="availability-page">
			<div className="availability-heading">
				<div>
					<p className="eyebrow">TRAIN AVAILABILITY</p>
					<h1>Check your options</h1>
					<p>Select a class and quota to see simulated availability.</p>
				</div>
				<span className="panel-icon" aria-hidden="true"><TrainFront size={22} /></span>
			</div>

			<div className="availability-train-card">
				<div className="availability-train-title">
					<div>
						<p className="train-number">#{train.trainNumber}</p>
						<h2>{train.trainName}</h2>
					</div>
					<div className="availability-times"><strong>{train.departureTime}</strong><Clock3 size={15} /><strong>{train.arrivalTime}</strong></div>
				</div>
				<div className="train-route">
					<span>{train.source} <small>{train.sourceName}</small></span>
					<ArrowRight size={17} />
					<span>{train.destination} <small>{train.destinationName}</small></span>
				</div>
			</div>

			<div className="availability-layout">
				<div className="availability-selector auth-card">
					<h2>Select class and quota</h2>
					<label>
						<span>Class</span>
						<select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
							<option value="">Select class</option>
							{classOptions.map(([className]) => <option key={className} value={className}>{className}</option>)}
						</select>
					</label>
					<label>
						<span>Quota</span>
						<select value={selectedQuota} onChange={(event) => setSelectedQuota(event.target.value)}>
							<option value="">Select quota</option>
							{quotaOptions.map(([quotaName]) => <option key={quotaName} value={quotaName}>{quotaName}</option>)}
						</select>
					</label>
					<button className="primary-button auth-button" disabled={!selectedClass || !selectedQuota} onClick={handleContinue}>
						Continue <ArrowRight size={18} />
					</button>
				</div>

				<div className="availability-result">
					<p className="eyebrow">SIMULATED STATUS</p>
					{!selectedClass || !selectedQuota ? (
						<div className="availability-prompt"><MapPin size={24} /><p>Select a class and quota to view availability.</p></div>
					) : (
						<div className="availability-details">
							<div className={hasSeats ? 'status-badge available' : 'status-badge waiting'}><CheckCircle size={17} /> {hasSeats ? 'AVAILABLE' : 'WAITLIST'}</div>
							<div className="availability-stat"><span>Available seats</span><strong>{selectedClassData.available}</strong></div>
							<div className="availability-stat"><span>Waiting list status</span><strong>{waitingListStatus}</strong></div>
							<p className="availability-note">This is simulated availability for the booking simulation.</p>
						</div>
					)}
				</div>
			</div>
			<button className="back-button" onClick={() => navigate('/search-results')}><ArrowLeft size={17} /> Back to Results</button>
		</section>
	);
}

export default TrainAvailability;
