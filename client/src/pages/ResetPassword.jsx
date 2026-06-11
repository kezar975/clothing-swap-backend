import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (password !== confirm) return setMsg('Passwords do not match');
    if (password.length < 6) return setMsg('Min 6 characters required');

    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      setMsg('Password reset successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <Card className="p-4">
        <h3 className="text-center mb-4">Reset Password</h3>
        {msg && <Alert variant={msg.includes('successful') ? 'success' : 'danger'}>{msg}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </Form.Group>
          <Button type="submit" className="w-100">Update Password</Button>
        </Form>
        <p className="text-center mt-3"><Link to="/login">Back to Login</Link></p>
      </Card>
    </Container>
  );
}