import UserService from '../services/user.service';
import OfferService from '../services/offer.service';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Phone, Camera, Save, Settings, MessageSquare, Check, X } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        address: '',
        phone: '',
        profilePicture: ''
    });
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const isArtist = user?.roles?.includes('ROLE_ARTIST');

    useEffect(() => {
        if (user && user.id) {
            fetchProfile();
            if (isArtist) {
                fetchOffers();
            }
        }
    }, [user, isArtist]);

    const fetchProfile = async () => {
        try {
            const res = await UserService.getUserProfile(user.id);
            setProfile(res.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Could not load profile data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        try {
            const res = await OfferService.getArtistOffers(user.id);
            setOffers(res.data);
        } catch (err) {
            console.error('Error fetching offers:', err);
        }
    };

    const handleOfferStatus = async (id, status) => {
        try {
            await OfferService.updateOfferStatus(id, status);
            setOffers(offers.map(o => o.id === id ? { ...o, status } : o));
        } catch (err) {
            alert('Failed to update offer status.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await UserService.updateUserProfile(user.id, profile);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Profile...</div>;

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="glass" style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.1)', overflow: 'hidden', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={50} color="var(--primary)" />
                            )}
                        </div>
                        <button style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', border: 'none', borderRadius: '50%', p: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Camera size={16} color="black" />
                        </button>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{profile.username}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            {user?.roles?.map(role => (
                                <span key={role} style={{ fontSize: '0.75rem', background: 'rgba(197, 160, 89, 0.2)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                                    {role.replace('ROLE_', '')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {message && <div style={{ color: 'var(--accent-green)', background: 'rgba(80, 227, 194, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '2rem' }}>{message}</div>}
                {error && <div style={{ color: 'var(--error)', background: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input name="phone" value={profile.phone || ''} onChange={handleChange} className="glass" style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Address</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input name="address" value={profile.address || ''} onChange={handleChange} className="glass" style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Profile Picture URL</label>
                            <input name="profilePicture" value={profile.profilePicture || ''} onChange={handleChange} placeholder="https://example.com/avatar.jpg" className="glass" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                        <Save size={20} /> Save Changes
                    </button>
                </form>

                {isArtist && offers.length > 0 && (
                    <div style={{ marginTop: '4rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <MessageSquare /> Offers Received
                        </h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {offers.map(o => (
                                <div key={o.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem' }}>{o.artwork.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            From Customer: {o.customer.username} • <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Offer: ${o.offeringPrice}</span>
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {o.status === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => handleOfferStatus(o.id, 'ACCEPTED')}
                                                    className="btn btn-outline"
                                                    style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)', padding: '8px 16px' }}
                                                >
                                                    <Check size={18} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleOfferStatus(o.id, 'REJECTED')}
                                                    className="btn btn-outline"
                                                    style={{ color: 'var(--error)', borderColor: 'var(--error)', padding: '8px 16px' }}
                                                >
                                                    <X size={18} /> Reject
                                                </button>
                                            </>
                                        ) : (
                                            <span style={{
                                                color: o.status === 'ACCEPTED' ? 'var(--accent-green)' : 'var(--error)',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                fontSize: '0.8rem',
                                                letterSpacing: '1px'
                                            }}>
                                                {o.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
