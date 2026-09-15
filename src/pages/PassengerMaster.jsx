import { useState } from 'react';
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react';

const emptyPassenger = {
	fullName: '',
	age: '',
	gender: '',
	berthPreference: '',
};

function getLoggedInUser() {
	try {
		return JSON.parse(localStorage.getItem('irctcLoggedInUser') || 'null');
	} catch {
		return null;
	}
}

function getPassengerKey(email) {
	return `irctcPassengerMaster_${email.toLowerCase()}`;
}

function getSavedPassengers(email) {
	try {
		return JSON.parse(localStorage.getItem(getPassengerKey(email)) || '[]');
	} catch {
		return [];
	}
}

function PassengerMaster({ navigate }) {
	const loggedInUser = getLoggedInUser();
	const [passengers, setPassengers] = useState(() => loggedInUser ? getSavedPassengers(loggedInUser.email) : []);
	const [formData, setFormData] = useState(emptyPassenger);
	const [editingId, setEditingId] = useState(null);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	if (!loggedInUser) {
		return (
			<section className="profile-page profile-empty">
				<div className="profile-empty-icon" aria-hidden="true"><UserRound size={26} /></div>
				<p className="eyebrow">PASSENGER MASTER</p>
				<h1>Login to manage passengers</h1>
				<p>Save passenger details here after you log in to make booking easier.</p>
				<button className="primary-button" onClick={() => navigate('/login')}>Go to Login</button>
			</section>
		);
	}

	function updatePassengers(nextPassengers) {
		setPassengers(nextPassengers);
		localStorage.setItem(getPassengerKey(loggedInUser.email), JSON.stringify(nextPassengers));
	}

	function handleChange(event) {
		setFormData({ ...formData, [event.target.name]: event.target.value });
		setError('');
		setMessage('');
	}

	function handleSubmit(event) {
		event.preventDefault();
		const age = Number(formData.age);

		if (!formData.fullName.trim() || !formData.age || !formData.gender || !formData.berthPreference) {
			setError('Please complete all passenger details.');
			setMessage('');
			return;
		}

		if (!Number.isInteger(age) || age < 1 || age > 120) {
			setError('Age must be a whole number between 1 and 120.');
			setMessage('');
			return;
		}

		const passenger = {
			id: editingId || Date.now(),
			fullName: formData.fullName.trim(),
			age,
			gender: formData.gender,
			berthPreference: formData.berthPreference,
		};
		const nextPassengers = editingId
			? passengers.map((item) => item.id === editingId ? passenger : item)
			: [...passengers, passenger];

		updatePassengers(nextPassengers);
		setFormData(emptyPassenger);
		setEditingId(null);
		setError('');
		setMessage(editingId ? 'Passenger updated successfully.' : 'Passenger added successfully.');
	}

	function editPassenger(passenger) {
		setFormData({
			fullName: passenger.fullName,
			age: String(passenger.age),
			gender: passenger.gender,
			berthPreference: passenger.berthPreference,
		});
		setEditingId(passenger.id);
		setMessage('');
		setError('');
	}

	function deletePassenger(id) {
		updatePassengers(passengers.filter((passenger) => passenger.id !== id));
		if (editingId === id) {
			setFormData(emptyPassenger);
			setEditingId(null);
		}
		setMessage('Passenger deleted successfully.');
		setError('');
	}

	function cancelEdit() {
		setFormData(emptyPassenger);
		setEditingId(null);
		setError('');
		setMessage('');
	}

	return (
		<section className="passenger-page">
			<div className="passenger-page-heading">
				<div>
					<p className="eyebrow">YOUR ACCOUNT</p>
					<h1>Passenger Master</h1>
					<p>Save your regular passengers for quicker bookings later.</p>
				</div>
				<span className="panel-icon" aria-hidden="true"><UserRound size={22} /></span>
			</div>

			<div className="passenger-layout">
				<form className="passenger-form auth-card" onSubmit={handleSubmit} noValidate>
					<h2>{editingId ? 'Edit passenger' : 'Add passenger'}</h2>
					<label>
						<span>Full Name</span>
						<input name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Passenger full name" />
					</label>
					<label>
						<span>Age</span>
						<input name="age" type="number" min="1" max="120" value={formData.age} onChange={handleChange} placeholder="Age" />
					</label>
					<label>
						<span>Gender</span>
						<select name="gender" value={formData.gender} onChange={handleChange}>
							<option value="">Select gender</option>
							<option value="Female">Female</option>
							<option value="Male">Male</option>
							<option value="Other">Other</option>
						</select>
					</label>
					<label>
						<span>Berth Preference</span>
						<select name="berthPreference" value={formData.berthPreference} onChange={handleChange}>
							<option value="">Select preference</option>
							<option value="Lower">Lower</option>
							<option value="Middle">Middle</option>
							<option value="Upper">Upper</option>
							<option value="Side Lower">Side Lower</option>
							<option value="Side Upper">Side Upper</option>
							<option value="No Preference">No Preference</option>
						</select>
					</label>
					{error && <p className="form-message error" role="alert">{error}</p>}
					{message && <p className="form-message success" role="status">{message}</p>}
					<div className="passenger-form-actions">
						<button className="primary-button auth-button" type="submit">
							{editingId ? 'Save changes' : <><Plus size={18} /> Add passenger</>}
						</button>
						{editingId && <button className="secondary-button" type="button" onClick={cancelEdit}>Cancel</button>}
					</div>
				</form>

				<div className="passenger-list-section">
					<div className="list-heading">
						<div>
							<h2>Saved passengers</h2>
							<p>{passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'} saved</p>
						</div>
					</div>
					{passengers.length === 0 ? (
						<div className="empty-passenger-list"><p>No passengers saved yet.</p><span>Add a passenger using the form.</span></div>
					) : (
						<div className="passenger-table-wrap">
							<table className="passenger-table">
								<thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Berth</th><th>Actions</th></tr></thead>
								<tbody>
									{passengers.map((passenger) => (
										<tr key={passenger.id}>
											<td data-label="Name">{passenger.fullName}</td>
											<td data-label="Age">{passenger.age}</td>
											<td data-label="Gender">{passenger.gender}</td>
											<td data-label="Berth">{passenger.berthPreference}</td>
											<td data-label="Actions" className="passenger-actions">
												<button className="icon-button" type="button" onClick={() => editPassenger(passenger)} aria-label={`Edit ${passenger.fullName}`} title="Edit"><Pencil size={16} /></button>
												<button className="icon-button delete" type="button" onClick={() => deletePassenger(passenger.id)} aria-label={`Delete ${passenger.fullName}`} title="Delete"><Trash2 size={16} /></button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

export default PassengerMaster;
