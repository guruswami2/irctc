import { useState } from 'react';
import { CheckCircle, Mail, UserRound } from 'lucide-react';

function getLoggedInUser() {
	try {
		return JSON.parse(localStorage.getItem('irctcLoggedInUser') || 'null');
	} catch {
		return null;
	}
}

function Profile({ navigate, loggedInUser: activeUser, onUserUpdate }) {
	const loggedInUser = activeUser || getLoggedInUser();
	const [fullName, setFullName] = useState(loggedInUser?.fullName || '');
	const [email, setEmail] = useState(loggedInUser?.email || '');
	const [message, setMessage] = useState('');

	if (!loggedInUser) {
		return (
			<section className="profile-page profile-empty">
				<div className="profile-empty-icon" aria-hidden="true"><UserRound size={26} /></div>
				<p className="eyebrow">ACCOUNT</p>
				<h1>Login to view your profile</h1>
				<p>Your profile details will appear here after you log in.</p>
				<button className="primary-button" onClick={() => navigate('/login')}>Go to Login</button>
			</section>
		);
	}

	function handleSubmit(event) {
		event.preventDefault();
		const updatedUser = {
			fullName: fullName.trim(),
			email: email.trim().toLowerCase(),
		};
		const registeredUser = JSON.parse(localStorage.getItem('irctcRegisteredUser') || 'null');

		localStorage.setItem('irctcLoggedInUser', JSON.stringify(updatedUser));
		if (registeredUser && registeredUser.email === loggedInUser.email) {
			localStorage.setItem('irctcRegisteredUser', JSON.stringify({
				...registeredUser,
				...updatedUser,
			}));
		}
		onUserUpdate?.(updatedUser);
		setMessage('Profile updated successfully.');
	}

	return (
		<section className="profile-page">
			<div className="profile-intro">
				<p className="eyebrow">YOUR ACCOUNT</p>
				<h1>Profile</h1>
				<p>Keep your basic information up to date for a smoother booking experience.</p>
			</div>
			<form className="profile-card auth-form" onSubmit={handleSubmit}>
				<div className="profile-card-heading">
					<div className="profile-avatar" aria-hidden="true">{fullName.charAt(0).toUpperCase()}</div>
					<div>
						<h2>Personal details</h2>
						<p>Update your name or email address below.</p>
					</div>
				</div>
				<label>
					<span><UserRound size={16} /> Full Name</span>
					<input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
				</label>
				<label>
					<span><Mail size={16} /> Email</span>
					<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
				</label>
				{message && <p className="form-message success" role="status"><CheckCircle size={16} /> {message}</p>}
				<button className="primary-button auth-button" type="submit">Save changes</button>
			</form>
		</section>
	);
}

export default Profile;
