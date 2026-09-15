import { useState } from 'react';
import { CheckCircle, CreditCard, Pencil, Plus, Trash2, Wallet } from 'lucide-react';

const emptyPayment = {
	type: 'UPI',
	upiId: '',
	cardHolder: '',
	last4: '',
};

function getLoggedInUser() {
	try {
		return JSON.parse(localStorage.getItem('irctcLoggedInUser') || 'null');
	} catch {
		return null;
	}
}

function getPaymentKey(email) {
	return `irctcPaymentMethods_${email.toLowerCase()}`;
}

function getSavedPayments(email) {
	try {
		const savedPayments = JSON.parse(localStorage.getItem(getPaymentKey(email)) || '[]');
		return Array.isArray(savedPayments) ? savedPayments : [];
	} catch {
		return [];
	}
}

function PaymentDetails({ navigate }) {
	const loggedInUser = getLoggedInUser();
	const [payments, setPayments] = useState(() => loggedInUser ? getSavedPayments(loggedInUser.email) : []);
	const [formData, setFormData] = useState(emptyPayment);
	const [editingId, setEditingId] = useState(null);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	if (!loggedInUser) {
		return (
			<section className="profile-page profile-empty">
				<div className="profile-empty-icon" aria-hidden="true"><Wallet size={26} /></div>
				<p className="eyebrow">PAYMENT DETAILS</p>
				<h1>Login to manage payments</h1>
				<p>Save payment methods here after you log in. No real banking information is needed.</p>
				<button className="primary-button" onClick={() => navigate('/login')}>Go to Login</button>
			</section>
		);
	}

	function savePayments(nextPayments) {
		setPayments(nextPayments);
		localStorage.setItem(getPaymentKey(loggedInUser.email), JSON.stringify(nextPayments));
	}

	function handleChange(event) {
		setFormData({ ...formData, [event.target.name]: event.target.value });
		setError('');
		setMessage('');
	}

	function handleTypeChange(event) {
		setFormData({ ...emptyPayment, type: event.target.value });
		setError('');
		setMessage('');
	}

	function handleSubmit(event) {
		event.preventDefault();
		const payment = {
			id: editingId || Date.now(),
			type: formData.type,
			...(formData.type === 'UPI'
				? { upiId: formData.upiId.trim() }
				: { cardHolder: formData.cardHolder.trim(), last4: formData.last4 }),
		};

		if (formData.type === 'UPI' && (!payment.upiId || !payment.upiId.includes('@') || /\s/.test(payment.upiId))) {
			setError('Enter a valid UPI ID, such as user@example.');
			return;
		}

		if (formData.type !== 'UPI' && (!payment.cardHolder || !/^\d{4}$/.test(payment.last4))) {
			setError('Enter a card holder name and exactly 4 digits for the last 4 digits.');
			return;
		}

		const nextPayments = editingId
			? payments.map((item) => item.id === editingId ? { ...item, ...payment } : item)
			: [...payments, { ...payment, preferred: payments.length === 0 }];
		savePayments(nextPayments);
		setFormData(emptyPayment);
		setEditingId(null);
		setError('');
		setMessage(editingId ? 'Payment method updated successfully.' : 'Payment method added successfully.');
	}

	function editPayment(payment) {
		setFormData({
			type: payment.type,
			upiId: payment.upiId || '',
			cardHolder: payment.cardHolder || '',
			last4: payment.last4 || '',
		});
		setEditingId(payment.id);
		setMessage('');
		setError('');
	}

	function deletePayment(id) {
		const paymentToDelete = payments.find((payment) => payment.id === id);
		const remainingPayments = payments.filter((payment) => payment.id !== id);
		if (paymentToDelete?.preferred && remainingPayments.length > 0) {
			remainingPayments[0].preferred = true;
		}
		savePayments(remainingPayments);
		if (editingId === id) {
			setFormData(emptyPayment);
			setEditingId(null);
		}
		setMessage('Payment method deleted successfully.');
		setError('');
	}

	function selectPreferred(id) {
		savePayments(payments.map((payment) => ({ ...payment, preferred: payment.id === id })));
		setMessage('Preferred payment method updated.');
		setError('');
	}

	function cancelEdit() {
		setFormData(emptyPayment);
		setEditingId(null);
		setMessage('');
		setError('');
	}

	return (
		<section className="payment-page">
			<div className="payment-page-heading">
				<div>
					<p className="eyebrow">YOUR ACCOUNT</p>
					<h1>Payment Details</h1>
					<p>Manage safe payment methods for this simulation.</p>
				</div>
				<span className="panel-icon" aria-hidden="true"><Wallet size={22} /></span>
			</div>

			<div className="payment-layout">
				<form className="payment-form auth-card" onSubmit={handleSubmit} noValidate>
					<h2>{editingId ? 'Edit payment method' : 'Add payment method'}</h2>
					<label>
						<span>Payment Type</span>
						<select value={formData.type} onChange={handleTypeChange}>
							<option value="UPI">UPI</option>
							<option value="Debit Card">Debit Card</option>
							<option value="Credit Card">Credit Card</option>
						</select>
					</label>
					{formData.type === 'UPI' ? (
						<label>
							<span>UPI ID</span>
							<input name="upiId" type="text" value={formData.upiId} onChange={handleChange} placeholder="user@example" />
						</label>
					) : (
						<>
							<label>
								<span>Card Holder Name</span>
								<input name="cardHolder" type="text" value={formData.cardHolder} onChange={handleChange} placeholder="Card holder" />
							</label>
							<label>
								<span>Last 4 Digits Only</span>
								<input name="last4" type="text" inputMode="numeric" maxLength="4" value={formData.last4} onChange={handleChange} placeholder="1234" />
							</label>
						</>
					)}
					<p className="payment-safety-note">Simulation only. Never enter a full card number, CVV, PIN, password, or OTP.</p>
					{error && <p className="form-message error" role="alert">{error}</p>}
					{message && <p className="form-message success" role="status"><CheckCircle size={16} /> {message}</p>}
					<div className="payment-form-actions">
						<button className="primary-button auth-button" type="submit"><Plus size={18} /> {editingId ? 'Save changes' : 'Add method'}</button>
						{editingId && <button className="secondary-button" type="button" onClick={cancelEdit}>Cancel</button>}
					</div>
				</form>

				<div className="payment-list-section">
					<div className="list-heading">
						<div>
							<h2>Saved methods</h2>
							<p>{payments.length} {payments.length === 1 ? 'method' : 'methods'} saved</p>
						</div>
					</div>
					{payments.length === 0 ? (
						<div className="empty-passenger-list"><p>No payment methods saved yet.</p><span>Add a safe payment method using the form.</span></div>
					) : (
						<div className="payment-method-list">
							{payments.map((payment) => (
								<article className="payment-method-card" key={payment.id}>
									<div className="payment-method-icon" aria-hidden="true">{payment.type === 'UPI' ? <Wallet size={19} /> : <CreditCard size={19} />}</div>
									<div className="payment-method-info">
										<div className="payment-method-title"><h3>{payment.type}</h3>{payment.preferred && <span className="preferred-badge">Preferred</span>}</div>
										<p>{payment.type === 'UPI' ? payment.upiId : `${payment.cardHolder} · •••• ${payment.last4}`}</p>
									</div>
									<div className="payment-method-actions">
										<label className="preferred-control"><input type="radio" name="preferredPayment" checked={Boolean(payment.preferred)} onChange={() => selectPreferred(payment.id)} /> Preferred</label>
										<button className="icon-button" type="button" onClick={() => editPayment(payment)} aria-label={`Edit ${payment.type}`} title="Edit"><Pencil size={16} /></button>
										<button className="icon-button delete" type="button" onClick={() => deletePayment(payment.id)} aria-label={`Delete ${payment.type}`} title="Delete"><Trash2 size={16} /></button>
									</div>
								</article>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

export default PaymentDetails;
