import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMsg('If this email is registered, you will receive a password reset link.');
    } catch (err) {
      setMsg('If this email is registered, you will receive a password reset link.');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <Card className="p-4">
        <h3 className="text-center mb-4">Forgot Password</h3>
        
        {msg && (
          <Alert variant="info" className="text-center">
            {msg}<br/>
            <small className="text-muted">Check your email inbox (or spam folder)</small>
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Enter Registered Email</Form.Label>
            <Form.Control 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
              placeholder="you@example.com"
            />
          </Form.Group>
          
          <Button 
            type="submit" 
            className="w-100" 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Form>
        
        <p className="text-center mt-3">
          <Link to="/login">Back to Login</Link>
        </p>
      </Card>
    </Container>
  );
}