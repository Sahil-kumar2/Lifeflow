import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'donor', city: '', bloodType: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { name, email, password, phone, role, city, bloodType } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { longitude, latitude } = position.coords;
            try {
                const newUser = { ...formData, longitude, latitude };
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, newUser);
                localStorage.setItem('token', res.data.token);
                
                alert('Registration successful!');
                
                if (role === 'donor') navigate('/donor-dashboard');
                else if (role === 'patient') navigate('/patient-dashboard');
                else if (role === 'hospital') navigate('/hospital-dashboard');
                else navigate('/');

            } catch (err) {
                alert(err.response ? err.response.data.msg : 'Registration failed. Server may be down.');
                setIsLoading(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Could not get your location. Please enable location services to register.");
            setIsLoading(false);
        });
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center font-sans py-12">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
                    Create Your LiveFlow Account
                </h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" name="name" value={name} onChange={onChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} minLength="6" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <input type="text" placeholder="Phone Number" name="phone" value={phone} onChange={onChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <input type="text" placeholder="City" name="city" value={city} onChange={onChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <select name="role" value={role} onChange={onChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="donor">I am a Donor</option>
                        <option value="patient">I am a Patient</option>
                        <option value="hospital">I am a Hospital</option>
                    </select>
                    {role === 'donor' && (
                        <select name="bloodType" value={bloodType} onChange={onChange} required={role === 'donor'} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="">-- Select Blood Type --</option>
                            <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                        </select>
                    )}
                    <button type="submit" disabled={isLoading} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-red-300">
                        {isLoading ? 'Getting Location...' : 'Register'}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-red-600 hover:underline font-semibold">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;