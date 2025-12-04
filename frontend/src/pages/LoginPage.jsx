import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const token = loginRes.data.token;
            localStorage.setItem('token', token);

            const config = { headers: { 'x-auth-token': token } };
            const userRes = await axios.get('http://localhost:5000/api/auth', config);
            const userRole = userRes.data.role;

            alert('Login successful!');

            if (userRole === 'donor') navigate('/donor-dashboard');
            else if (userRole === 'patient') navigate('/patient-dashboard');
            else if (userRole === 'hospital') navigate('/hospital-dashboard');
            else navigate('/');

        } catch (err) {
            console.error(err);
            localStorage.removeItem('token');
            if (err.response) {
                alert(`Login failed: ${err.response.data.msg}`);
            } else {
                alert('Login failed: Cannot connect to the server.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center font-sans">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
                    Sign In to LiveFlow 🩸
                </h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-red-300"
                    >
                        {isLoading ? 'Logging In...' : 'Login'}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-red-600 hover:underline font-semibold">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;