import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

export default function Register() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const cityCoordinates = {
        'mumbai': { latitude: 19.0760, longitude: 72.8777 },
        'delhi': { latitude: 28.7041, longitude: 77.1025 },
        'bangalore': { latitude: 12.9716, longitude: 77.5946 },
        'chennai': { latitude: 13.0827, longitude: 80.2707 },
        'kolkata': { latitude: 22.5726, longitude: 88.3639 },
        'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
        'pune': { latitude: 18.5204, longitude: 73.8567 },
        'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
        'jaipur': { latitude: 26.9124, longitude: 75.7873 },
        'surat': { latitude: 21.1702, longitude: 72.8311 },
      };

      const cityName = form.city.toLowerCase().trim();
      const coords = cityCoordinates[cityName] || { latitude: 19.0760, longitude: 72.8777 };

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        city: form.city,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <Card className="p-4">
        <h3 className="text-center mb-4">Create Account</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control 
              type="text" 
              name="name" 
              placeholder="John Doe"
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control 
              type="email" 
              name="email" 
              placeholder="you@example.com"
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              name="password" 
              placeholder="Min. 6 characters"
              value={form.password} 
              onChange={handleChange} 
              required 
            />
            <Form.Text className="text-muted">
              Must be at least 6 characters long
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control 
              type="password" 
              name="confirmPassword" 
              placeholder="Re-enter password"
              value={form.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>City</Form.Label>
            <Form.Control 
              type="text" 
              name="city" 
              placeholder="Mumbai, Delhi, Bangalore, etc."
              value={form.city} 
              onChange={handleChange} 
              required 
            />
            <Form.Text className="text-muted">
              Location will be auto-detected based on your city
            </Form.Text>
          </Form.Group>

          <Button 
            type="submit" 
            className="w-100" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>
        <p className="text-center mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </Card>
    </Container>
  );
}