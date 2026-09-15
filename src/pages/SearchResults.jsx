import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MapPin, TrainFront } from 'lucide-react';
import { fetchTrains } from '../services/apiService.js';

function normalizeValue(value) {
	return String(value || '').trim().toLowerCase();
}

function getJourneyDay(date) {
	const parsedDate = new Date(`${date}T00:00:00`);
	if (Number.isNaN(parsedDate.getTime())) return '';
	return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parsedDate.getDay()];
}

function matchesJourneyDate(train, journeyDate) {
	if (train.journeyDate) return String(train.journeyDate).trim() === journeyDate.trim();
	return Array.isArray(train.runningDays) && train.runningDays.includes(getJourneyDay(journeyDate));
}

function SearchResults({ navigate }) {
	const [trains, setTrains] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const searchParams = new URLSearchParams(window.location.search);
	const source = searchParams.get('source') || '';
	const destination = searchParams.get('destination') || '';
	const journeyDate = searchParams.get('date') || '';

	useEffect(() => {
		async function loadTrains() {
			try {
				setLoading(true);
				setError('');
				const allTrains = await fetchTrains();
				const normalizedSource = normalizeValue(source);
				const normalizedDestination = normalizeValue(destination);
				const matchingTrains = allTrains.filter((train) => (
					[train.source, train.sourceName].some((value) => normalizeValue(value) === normalizedSource)
					&& [train.destination, train.destinationName].some((value) => normalizeValue(value) === normalizedDestination)
					&& matchesJourneyDate(train, journeyDate)
				));
				setTrains(matchingTrains);
			} catch {
				setError('Unable to load trains. Please make sure the server is running.');
			} finally {
				setLoading(false);
			}
		}

		if (!journeyDate) {
			setError('Please select a travel date.');
			setLoading(false);
		} else if (!source || !destination) {
			setError('Please select a source and destination.');
			setLoading(false);
		} else if (normalizeValue(source) === normalizeValue(destination)) {
			setError('Source and destination cannot be the same.');
			setLoading(false);
		} else {
			loadTrains();
		}
	}, [source, destination, journeyDate]);

	function formatDate(date) {
		if (!date) return 'No date selected';
		return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	}

	return (
		<section className="results-page">
			<div className="results-heading">
				<div>
					<p className="eyebrow">TRAIN SEARCH</p>
					<h1>Available trains</h1>
					<div className="journey-summary">
						<span><MapPin size={15} /> {source || 'Any station'} to {destination || 'Any station'}</span>
						<span><CalendarDays size={15} /> {formatDate(journeyDate)}</span>
					</div>
				</div>
				<span className="panel-icon" aria-hidden="true"><TrainFront size={22} /></span>
			</div>

			{loading && <p className="results-status">Loading trains...</p>}
			{error && <p className="results-status error" role="alert">{error}</p>}
			{!loading && !error && trains.length === 0 && (
				<div className="results-empty">
					<TrainFront size={28} />
					<h2>Train not available for this route.</h2>
					<p>No trains are available from {source} to {destination} on {journeyDate}.</p>
					<button className="secondary-button" onClick={() => navigate('/')}>Modify Search</button>
				</div>
			)}
			{!loading && !error && trains.length > 0 && (
				<div className="train-results">
					{trains.map((train) => (
						<article className="train-card" key={train.id}>
							<div className="train-card-heading">
								<div>
									<p className="train-number">#{train.trainNumber}</p>
									<h2>{train.trainName}</h2>
								</div>
								<div className="train-times">
									<strong>{train.departureTime}</strong>
									<Clock3 size={15} />
									<strong>{train.arrivalTime}</strong>
								</div>
							</div>
							<div className="train-route">
								<span>{train.source} <small>{train.sourceName}</small></span>
								<ArrowRight size={17} />
								<span>{train.destination} <small>{train.destinationName}</small></span>
							</div>
							<div className="train-card-details">
								<div><span>Classes</span><strong>{Object.keys(train.classes).join(', ')}</strong></div>
								<div><span>Quotas</span><strong>{Object.keys(train.quotas).join(', ')}</strong></div>
								<button className="primary-button" onClick={() => navigate(`/availability?trainId=${encodeURIComponent(train.id)}&date=${encodeURIComponent(journeyDate)}`)}>
									Check Availability <ArrowRight size={17} />
								</button>
							</div>
						</article>
					))}
				</div>
			)}

			<button className="back-button" onClick={() => navigate('/')}><ArrowLeft size={17} /> New search</button>
		</section>
	);
}

export default SearchResults;
