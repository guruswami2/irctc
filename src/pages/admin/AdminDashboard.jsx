import { useEffect, useState } from 'react';
import { CheckCircle, Clock3, MapPin, Plus, Route, ShieldCheck, Trash2 } from 'lucide-react';
import { createTrain, deleteTrain, fetchTrains } from '../../services/apiService.js';

const initialForm = {
	trainNumber: '', trainName: '', source: '', destination: '', journeyDate: '', departureTime: '', arrivalTime: '', duration: '', classes: '', quota: '', seats: '', fare: '',
};

const runningDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const stationAliases = {
	NDLS: 'New Delhi',
	BCT: 'Mumbai Central',
	CSMT: 'Chhatrapati Shivaji Maharaj Terminus',
	HWH: 'Howrah Junction',
	MAS: 'Chennai Central',
	SBC: 'KSR Bengaluru City',
	ADI: 'Ahmedabad Junction',
	BSB: 'Varanasi Junction',
	PUNE: 'Pune Junction',
	HYB: 'Hyderabad Deccan',
	VIJ: 'Vijayawada',
};

function normalizeStation(value) {
	const trimmedValue = value.trim();
	if (trimmedValue.toLowerCase() === 'hyderabad') {
		return { code: 'HYB', name: stationAliases.HYB };
	}
	const matchingCode = Object.keys(stationAliases).find((code) => (
		code.toLowerCase() === trimmedValue.toLowerCase()
		|| stationAliases[code].toLowerCase() === trimmedValue.toLowerCase()
	));

	return matchingCode
		? { code: matchingCode, name: stationAliases[matchingCode] }
		: { code: trimmedValue.toUpperCase(), name: trimmedValue };
}

function AdminDashboard({ onAdminLogout }) {
	const [trains, setTrains] = useState([]);
	const [formData, setFormData] = useState(initialForm);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deletingId, setDeletingId] = useState(null);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	useEffect(() => { loadTrains(); }, []);

	async function loadTrains() {
		try {
			setLoading(true);
			setError('');
			setTrains(await fetchTrains());
		} catch {
			setError('We could not load the train list. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	function handleChange(event) {
		setFormData({ ...formData, [event.target.name]: event.target.value });
		setMessage('');
		setError('');
	}

	function createClassData() {
		const classNames = formData.classes.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
		return classNames.reduce((classes, className) => ({ ...classes, [className]: { price: Number(formData.fare), available: Number(formData.seats), status: Number(formData.seats) > 0 ? 'AVAILABLE' : 'WL-1' } }), {});
	}

	function createQuotaData() {
		const quotaNames = formData.quota.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
		return quotaNames.reduce((quotas, quotaName) => ({ ...quotas, [quotaName]: { available: true } }), {});
	}

	async function handleSubmit(event) {
		event.preventDefault();
		const requiredFields = Object.values(formData).every((value) => value.trim());
		const classData = createClassData();
		const quotaData = createQuotaData();
		const sourceStation = normalizeStation(formData.source);
		const destinationStation = normalizeStation(formData.destination);

		if (!requiredFields || Object.keys(classData).length === 0 || Object.keys(quotaData).length === 0) {
			setError('Please complete every field, including at least one class and quota.');
			setMessage('');
			return;
		}
		if (!/^\d+$/.test(formData.trainNumber) || Number(formData.seats) < 0 || Number(formData.fare) < 0) {
			setError('Train number, seats, and fare must contain valid non-negative numbers.');
			setMessage('');
			return;
		}

		const train = {
			id: `train_${Date.now()}`,
			trainNumber: formData.trainNumber.trim(),
			trainName: formData.trainName.trim(),
			source: sourceStation.code,
			destination: destinationStation.code,
			sourceName: sourceStation.name,
			destinationName: destinationStation.name,
			journeyDate: formData.journeyDate.trim(),
			departureTime: formData.departureTime.trim(),
			arrivalTime: formData.arrivalTime.trim(),
			duration: formData.duration.trim(),
			runningDays,
			classes: classData,
			quotas: quotaData,
		};

		try {
			setSaving(true);
			setError('');
			await createTrain(train);
			setFormData(initialForm);
			setMessage('Train added successfully.');
			await loadTrains();
		} catch {
			setError('We could not add this train. Please try again.');
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(train) {
		if (!window.confirm(`Delete ${train.trainName} (${train.trainNumber})?`)) return;
		try {
			setDeletingId(train.id);
			setError('');
			setMessage('');
			await deleteTrain(train.id);
			setMessage('Train deleted successfully.');
			await loadTrains();
		} catch {
			setError('We could not delete this train. Please try again.');
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<section className="admin-dashboard-page">
			<div className="admin-dashboard-heading"><div><p className="eyebrow">ADMIN AREA</p><h1>Admin Dashboard</h1><p>Welcome to the train route management area.</p></div><span className="panel-icon" aria-hidden="true"><ShieldCheck size={22} /></span></div>
			{message && <p className="form-message success admin-message" role="status"><CheckCircle size={16} /> {message}</p>}
			{error && <p className="form-message error admin-message" role="alert">{error}</p>}
			<div className="admin-dashboard-actions"><a className="admin-action-card" href="#add-train-form"><span className="dashboard-card-icon" aria-hidden="true"><Plus size={21} /></span><span><strong>Add Train</strong><small>Create a new train route.</small></span></a><a className="admin-action-card" href="#train-list"><span className="dashboard-card-icon" aria-hidden="true"><Route size={21} /></span><span><strong>Train List</strong><small>View and manage train routes.</small></span></a></div>
			<div className="admin-management-layout">
				<form className="admin-train-form auth-card" id="add-train-form" onSubmit={handleSubmit} noValidate>
					<h2>Add Train / Train Route</h2><p className="admin-form-help">Classes and quotas accept comma-separated values, for example: 3A, SL and GENERAL, TATKAL.</p>
					<label><span>Train Number</span><input name="trainNumber" value={formData.trainNumber} onChange={handleChange} placeholder="12952" /></label>
					<label><span>Train Name</span><input name="trainName" value={formData.trainName} onChange={handleChange} placeholder="Train name" /></label>
					<div className="admin-form-grid"><label><span>Source</span><input name="source" value={formData.source} onChange={handleChange} placeholder="NDLS" /></label><label><span>Destination</span><input name="destination" value={formData.destination} onChange={handleChange} placeholder="BCT" /></label></div>
					<div className="admin-form-grid"><label><span>Journey Date</span><input name="journeyDate" type="date" value={formData.journeyDate} onChange={handleChange} /></label><label><span>Departure Time</span><input name="departureTime" type="time" value={formData.departureTime} onChange={handleChange} /></label></div>
					<label><span>Arrival Time</span><input name="arrivalTime" type="time" value={formData.arrivalTime} onChange={handleChange} /></label>
					<label><span>Journey Duration</span><input name="duration" value={formData.duration} onChange={handleChange} placeholder="15h 40m" /></label>
					<label><span>Available Classes</span><input name="classes" value={formData.classes} onChange={handleChange} placeholder="1A, 2A, 3A, SL" /></label>
					<label><span>Quota</span><input name="quota" value={formData.quota} onChange={handleChange} placeholder="GENERAL, TATKAL" /></label>
					<div className="admin-form-grid"><label><span>Seat Availability</span><input name="seats" type="number" min="0" value={formData.seats} onChange={handleChange} placeholder="50" /></label><label><span>Fare</span><input name="fare" type="number" min="0" value={formData.fare} onChange={handleChange} placeholder="1200" /></label></div>
					<button className="primary-button auth-button" type="submit" disabled={saving}>{saving ? 'Saving...' : <><Plus size={18} /> Add Train</>}</button>
				</form>
				<div className="admin-train-list" id="train-list"><div className="admin-list-heading"><div><h2>Train List</h2><p>{trains.length} trains available</p></div><Route size={22} /></div>{loading ? <p className="results-status">Loading trains...</p> : trains.length === 0 ? <div className="results-empty"><Route size={28} /><h2>No trains found</h2><p>Add your first train route.</p></div> : <div className="admin-train-cards">{trains.map((train) => <TrainCard key={train.id} train={train} deletingId={deletingId} onDelete={handleDelete} />)}</div>}</div>
			</div>
			<button className="secondary-button admin-logout-button" onClick={onAdminLogout}>Admin Logout</button>
		</section>
	);
}

function TrainCard({ train, deletingId, onDelete }) {
	const classNames = Object.keys(train.classes || {});
	const quotaNames = Object.entries(train.quotas || {}).map(([quota, data]) => `${quota}${data.available === false ? ' (closed)' : ''}`);
	const seatSummary = classNames.map((className) => `${className}: ${train.classes[className].available}`).join(' | ');

	return <article className="admin-train-card"><div className="admin-train-card-heading"><div><p className="train-number">#{train.trainNumber}</p><h3>{train.trainName}</h3></div><button className="icon-button delete" type="button" onClick={() => onDelete(train)} disabled={deletingId === train.id} aria-label={`Delete ${train.trainName}`} title="Delete"><Trash2 size={17} /></button></div><div className="admin-train-route"><span><MapPin size={14} /> {train.source}</span><span>to</span><span>{train.destination}</span></div><div className="admin-train-meta"><span><strong><Clock3 size={14} /> Time</strong>{train.departureTime} - {train.arrivalTime}</span><span><strong>Classes</strong>{classNames.join(', ') || 'N/A'}</span><span><strong>Quota</strong>{quotaNames.join(', ') || 'N/A'}</span><span><strong>Seats</strong>{seatSummary || 'N/A'}</span></div></article>;
}

export default AdminDashboard;
