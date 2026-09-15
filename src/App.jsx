import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle, LockKeyhole, LogOut, Mail, MapPin, TrainFront, UserRound } from 'lucide-react';
import PassengerMaster from './pages/PassengerMaster.jsx';
import Profile from './pages/Profile.jsx';
import SearchResults from './pages/SearchResults.jsx';
import TrainAvailability from './pages/TrainAvailability.jsx';
import PaymentDetails from './pages/user/PaymentDetails.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import PassengerDetails from './pages/PassengerDetails.jsx';
import Payment from './pages/Payment.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';
import MyBookings from './pages/user/MyBookings.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

const stationOptions = [
	{ code: 'NDLS', name: 'New Delhi' },
	{ code: 'BCT', name: 'Mumbai Central' },
	{ code: 'CSMT', name: 'Mumbai CSMT' },
	{ code: 'HWH', name: 'Howrah Junction' },
	{ code: 'MAS', name: 'Chennai Central' },
	{ code: 'SBC', name: 'KSR Bengaluru' },
	{ code: 'ADI', name: 'Ahmedabad Junction' },
	{ code: 'BSB', name: 'Varanasi Junction' },
	{ code: 'PUNE', name: 'Pune Junction' },
	{ code: 'HYB', name: 'Hyderabad Deccan' },
	{ code: 'VIJ', name: 'Vijayawada' },
];

function getLoggedInUser() {
	try {
		return JSON.parse(localStorage.getItem('irctcLoggedInUser') || 'null');
	} catch {
		return null;
	}
}

function isAdminLoggedIn() {
	return localStorage.getItem('irctcAdminLoggedIn') === 'true';
}

function App() {
	const [currentPath, setCurrentPath] = useState(window.location.pathname);
	const [loggedInUser, setLoggedInUser] = useState(getLoggedInUser);
	const [adminLoggedIn, setAdminLoggedIn] = useState(isAdminLoggedIn);

	useEffect(() => {
		const handleBackOrForward = () => setCurrentPath(window.location.pathname);
		window.addEventListener('popstate', handleBackOrForward);
		return () => window.removeEventListener('popstate', handleBackOrForward);
	}, []);

	function navigate(path) {
		window.history.pushState({}, '', path);
		setCurrentPath(new URL(path, window.location.origin).pathname);
	}

	function handleLogout() {
		localStorage.removeItem('irctcLoggedInUser');
		setLoggedInUser(null);
		navigate('/');
	}

	function handleAdminLogout() {
		localStorage.removeItem('irctcAdminLoggedIn');
		setAdminLoggedIn(false);
		navigate('/admin-login');
	}

	const activeRoute = routes.find((route) => route.path === currentPath) || routes[0];
	const Page = activeRoute.component;

	return (
		<div className="app">
			<Navbar currentPath={currentPath} navigate={navigate} isLoggedIn={Boolean(loggedInUser)} adminLoggedIn={adminLoggedIn} onLogout={handleLogout} onAdminLogout={handleAdminLogout} />

			<main className="page-content">
				<Page
					navigate={navigate}
					loggedInUser={loggedInUser}
					onLogin={(user) => setLoggedInUser(user)}
					onUserUpdate={(user) => setLoggedInUser(user)}
					adminLoggedIn={adminLoggedIn}
					onAdminLogin={() => setAdminLoggedIn(true)}
					onAdminLogout={handleAdminLogout}
				/>
			</main>
		</div>
	);
}

	function Navbar({ currentPath, navigate, isLoggedIn, adminLoggedIn, onLogout, onAdminLogout }) {
		if (adminLoggedIn && currentPath === '/admin-dashboard') {
			return (
				<header className="app-header admin-navbar">
					<button className="brand" onClick={() => navigate('/admin-dashboard')}>
						<span className="brand-mark" aria-hidden="true"><TrainFront size={20} /></span>
						<span>IRCTC Booking</span>
					</button>
					<button className="nav-link admin-navbar-logout" onClick={onAdminLogout}>
						<LogOut size={17} />
						<span>Admin Logout</span>
					</button>
				</header>
			);
		}

	return (
		<header className="app-header">
			<button className="brand" onClick={() => navigate('/')}>
				<span className="brand-mark" aria-hidden="true"><TrainFront size={20} /></span>
				<span>IRCTC Booking</span>
			</button>
			<nav className="main-nav" aria-label="Main navigation">
				{!isLoggedIn && publicRoutes.map((route) => (
					<button
						className={currentPath === route.path ? 'nav-link active' : 'nav-link'}
						key={route.path}
						onClick={() => navigate(route.path)}
					>
						{route.label}
					</button>
				))}
				{isLoggedIn && (
					<button className={currentPath === '/dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('/dashboard')}>Dashboard</button>
				)}
				{isLoggedIn && <button className={currentPath === '/my-bookings' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('/my-bookings')}>My Bookings</button>}
				{isLoggedIn && <button className="nav-link logout-link" onClick={onLogout}>Logout</button>}
			</nav>
			{!isLoggedIn && <button className="admin-entry" onClick={() => navigate('/admin-login')}>Admin Login</button>}
		</header>
	);
}

function Home({ navigate }) {
	const [searchData, setSearchData] = useState({ source: '', destination: '', journeyDate: '' });
	const [searchError, setSearchError] = useState('');

	function handleSearchChange(event) {
		setSearchData({ ...searchData, [event.target.name]: event.target.value });
		setSearchError('');
	}

	function handleSearchSubmit(event) {
		event.preventDefault();
		const source = searchData.source.trim().toLowerCase();
		const destination = searchData.destination.trim().toLowerCase();

		if (!searchData.source || !searchData.destination || !searchData.journeyDate) {
			setSearchError('Please select a travel date.');
			return;
		}
		if (source === destination) {
			setSearchError('Source and destination cannot be the same.');
			return;
		}

		const params = new URLSearchParams({
			source: searchData.source,
			destination: searchData.destination,
			date: searchData.journeyDate,
		});
		navigate(`/search-results?${params.toString()}`);
	}

	return (
		<section className="home-page">
			<div className="home-intro">
				<p className="eyebrow">TRAVEL MADE SIMPLE</p>
				<h1>Every journey starts with a ticket.</h1>
				<p className="intro-copy">Plan your next train journey with a simple, clear booking experience.</p>
			</div>

			<form className="search-panel" onSubmit={handleSearchSubmit} noValidate>
				<div className="search-panel-heading">
					<div>
						<p className="eyebrow">PLAN YOUR JOURNEY</p>
						<h2>Find a train</h2>
					</div>
					<span className="panel-icon" aria-hidden="true"><TrainFront size={22} /></span>
				</div>
				<div className="search-fields">
					<label>
						<span><MapPin size={16} /> From</span>
						<select name="source" value={searchData.source} onChange={handleSearchChange}>
							<option value="">Departure station</option>
							{stationOptions.map((station) => <option key={station.code} value={station.code}>{station.name} ({station.code})</option>)}
						</select>
					</label>
					<label>
						<span><MapPin size={16} /> To</span>
						<select name="destination" value={searchData.destination} onChange={handleSearchChange}>
							<option value="">Arrival station</option>
							{stationOptions.map((station) => <option key={station.code} value={station.code}>{station.name} ({station.code})</option>)}
						</select>
					</label>
					<label>
						<span><CalendarDays size={16} /> Date</span>
						<input name="journeyDate" type="date" value={searchData.journeyDate} onChange={handleSearchChange} />
					</label>
				</div>
				{searchError && <p className="form-message error" role="alert">{searchError}</p>}
				<button className="primary-button" type="submit">
					Search trains <ArrowRight size={18} />
				</button>
			</form>
		</section>
	);
}

function AuthLayout({ title, description, children }) {
	return (
		<section className="auth-page">
			<div className="auth-intro">
				<p className="eyebrow">IRCTC BOOKING</p>
				<h1>{title}</h1>
				<p>{description}</p>
			</div>
			<div className="auth-card">{children}</div>
		</section>
	);
}

function AuthMessage({ message, type }) {
	if (!message) return null;

	return <p className={`form-message ${type}`} role="alert">{message}</p>;
}

function Login({ navigate, onLogin }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState(() => new URLSearchParams(window.location.search).get('message') || '');
	const [messageType, setMessageType] = useState('error');

	function handleSubmit(event) {
		event.preventDefault();
		const registeredUser = JSON.parse(localStorage.getItem('irctcRegisteredUser') || 'null');

		if (!email.trim() || !password) {
			setMessage('Please enter your email and password.');
			setMessageType('error');
			return;
		}

		if (!registeredUser || registeredUser.email !== email.trim().toLowerCase() || registeredUser.password !== password) {
			setMessage('The email or password is incorrect.');
			setMessageType('error');
			return;
		}

		const loggedInUser = {
			fullName: registeredUser.fullName,
			email: registeredUser.email,
		};
		localStorage.setItem('irctcLoggedInUser', JSON.stringify(loggedInUser));
		onLogin(loggedInUser);
		const returnTo = new URLSearchParams(window.location.search).get('returnTo');
		navigate(returnTo ? decodeURIComponent(returnTo) : '/dashboard');
		setMessage('Login successful. Welcome back!');
		setMessageType('success');
	}

	return (
		<AuthLayout title="Welcome back" description="Sign in to continue planning your next journey.">
			<form className="auth-form" onSubmit={handleSubmit} noValidate>
				<label>
					<span><Mail size={16} /> Email</span>
					<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
				</label>
				<label>
					<span><LockKeyhole size={16} /> Password</span>
					<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
				</label>
				<AuthMessage message={message} type={messageType} />
				<button className="primary-button auth-button" type="submit">Login <ArrowRight size={18} /></button>
				<p className="auth-switch">New to IRCTC? <button type="button" onClick={() => navigate('/signup')}>Create an account</button></p>
			</form>
		</AuthLayout>
	);
}

function Signup({ navigate }) {
	const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('error');

	function handleChange(event) {
		setFormData({ ...formData, [event.target.name]: event.target.value });
	}

	function handleSubmit(event) {
		event.preventDefault();
		const { fullName, email, password, confirmPassword } = formData;
		const normalizedEmail = email.trim().toLowerCase();

		if (!fullName.trim() || !normalizedEmail || !password || !confirmPassword) {
			setMessage('Please complete all fields.');
			setMessageType('error');
			return;
		}

		if (!normalizedEmail.includes('@')) {
			setMessage('Please enter a valid email address.');
			setMessageType('error');
			return;
		}

		if (password.length < 6) {
			setMessage('Password must be at least 6 characters.');
			setMessageType('error');
			return;
		}

		if (password !== confirmPassword) {
			setMessage('Passwords do not match.');
			setMessageType('error');
			return;
		}

		const existingUser = JSON.parse(localStorage.getItem('irctcRegisteredUser') || 'null');
		if (existingUser?.email === normalizedEmail) {
			setMessage('An account with this email already exists.');
			setMessageType('error');
			return;
		}

		localStorage.setItem('irctcRegisteredUser', JSON.stringify({
			fullName: fullName.trim(),
			email: normalizedEmail,
			password,
		}));
		setMessage('Signup successful. You can now log in.');
		setMessageType('success');
		setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
	}

	return (
		<AuthLayout title="Create your account" description="Save your details once and make future bookings easier.">
			<form className="auth-form" onSubmit={handleSubmit} noValidate>
				<label>
					<span><UserRound size={16} /> Full Name</span>
					<input name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Your full name" />
				</label>
				<label>
					<span><Mail size={16} /> Email</span>
					<input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
				</label>
				<label>
					<span><LockKeyhole size={16} /> Password</span>
					<input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" />
				</label>
				<label>
					<span><CheckCircle size={16} /> Confirm Password</span>
					<input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" />
				</label>
				<AuthMessage message={message} type={messageType} />
				<button className="primary-button auth-button" type="submit">Create account <ArrowRight size={18} /></button>
				<p className="auth-switch">Already registered? <button type="button" onClick={() => navigate('/login')}>Log in</button></p>
			</form>
		</AuthLayout>
	);
}

function PlaceholderPage({ title }) {
	return (
		<section>
			<h1>{title}</h1>
			<p>This page is ready for the next part of the booking simulation.</p>
		</section>
	);
}

function AdminProtectedDashboard({ navigate, adminLoggedIn, onAdminLogout }) {
	useEffect(() => {
		if (!adminLoggedIn) navigate('/admin-login');
	}, [adminLoggedIn, navigate]);

	if (!adminLoggedIn) return <p className="results-status">Redirecting to Admin Login...</p>;
	return <AdminDashboard onAdminLogout={onAdminLogout} />;
}

const publicRoutes = [
	{ path: '/', label: 'Home', component: Home },
	{ path: '/login', label: 'Login', component: Login },
	{ path: '/signup', label: 'Signup', component: Signup },
	];

const userRoutes = [
	{ path: '/dashboard', label: 'Dashboard', component: Dashboard },
	{ path: '/profile', label: 'Profile', component: Profile },
	{ path: '/payment-details', label: 'Payment Details', component: PaymentDetails },
	{ path: '/passenger-master', label: 'Passenger Master', component: PassengerMaster },
	{ path: '/my-bookings', label: 'My Bookings', component: MyBookings },
];

const bookingRoutes = [
	{ path: '/search-results', label: 'Search Results', component: SearchResults },
	{ path: '/availability', label: 'Availability', component: TrainAvailability },
	{ path: '/passenger-details', label: 'Passenger Details', component: PassengerDetails },
	{ path: '/payment', label: 'Payment', component: Payment },
	{ path: '/booking-confirmation', label: 'Booking Confirmation', component: BookingConfirmation },
];

const adminRoutes = [
	{ path: '/admin-login', label: 'Admin Login', component: AdminLogin },
	{ path: '/admin-dashboard', label: 'Admin Dashboard', component: AdminProtectedDashboard },
];

const routes = [...publicRoutes, ...userRoutes, ...bookingRoutes, ...adminRoutes]
	.filter((route, index, allRoutes) => allRoutes.findIndex((item) => item.path === route.path) === index);

export default App;
