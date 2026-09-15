import { CalendarSearch, CreditCard, ListChecks, Search, UserRound, Wallet } from 'lucide-react';

const dashboardLinks = [
	{ path: '/profile', label: 'Profile', description: 'Update your account details.', icon: UserRound },
	{ path: '/payment-details', label: 'Payment Details', description: 'Manage saved payment methods.', icon: CreditCard },
	{ path: '/passenger-master', label: 'Passenger Master', description: 'Save regular passenger details.', icon: ListChecks },
	{ path: '/', label: 'Search Trains', description: 'Find a train for your journey.', icon: Search },
	{ path: '/my-bookings', label: 'My Bookings', description: 'View your booking history.', icon: CalendarSearch },
];

function Dashboard({ navigate, loggedInUser }) {
	return (
		<section className="dashboard-page">
			<div className="dashboard-heading">
				<div>
					<p className="eyebrow">USER DASHBOARD</p>
					<h1>Welcome{loggedInUser?.fullName ? `, ${loggedInUser.fullName.split(' ')[0]}` : ''}.</h1>
					<p>Everything you need for your next train journey, in one place.</p>
				</div>
				<span className="panel-icon" aria-hidden="true"><Wallet size={22} /></span>
			</div>
			<div className="dashboard-grid">
				{dashboardLinks.map(({ path, label, description, icon: Icon }) => (
					<button className="dashboard-card" key={label} onClick={() => navigate(path)}>
						<span className="dashboard-card-icon" aria-hidden="true"><Icon size={21} /></span>
						<span className="dashboard-card-content"><strong>{label}</strong><small>{description}</small></span>
					</button>
				))}
			</div>
		</section>
	);
}

export default Dashboard;
