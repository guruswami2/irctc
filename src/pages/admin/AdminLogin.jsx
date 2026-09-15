import { useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';

const DEMO_ADMIN = {
	username: 'admin',
	password: 'admin123',
};

function AdminLogin({ navigate, onAdminLogin }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	function handleSubmit(event) {
		event.preventDefault();

		if (username.trim() !== DEMO_ADMIN.username || password !== DEMO_ADMIN.password) {
			setError('Invalid admin username or password.');
			return;
		}

		localStorage.setItem('irctcAdminLoggedIn', 'true');
		onAdminLogin();
		navigate('/admin-dashboard');
	}

	return (
		<section className="auth-page admin-auth-page">
			<div className="auth-intro">
				<p className="eyebrow">ADMIN AREA</p>
				<h1>Admin Login</h1>
				<p>Sign in to manage the train booking simulation.</p>
			</div>
			<form className="auth-card auth-form" onSubmit={handleSubmit} noValidate>
				<div className="admin-card-icon" aria-hidden="true"><ShieldCheck size={24} /></div>
				<label>
					<span><UserRound size={16} /> Username</span>
					<input type="text" value={username} onChange={(event) => { setUsername(event.target.value); setError(''); }} placeholder="Admin username" />
				</label>
				<label>
					<span><LockKeyhole size={16} /> Password</span>
					<input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="Admin password" />
				</label>
				{error && <p className="form-message error" role="alert">{error}</p>}
				<button className="primary-button auth-button" type="submit">Login <ArrowRight size={18} /></button>
				<p className="admin-demo-note">Demo admin access is for simulation only.</p>
			</form>
		</section>
	);
}

export default AdminLogin;
