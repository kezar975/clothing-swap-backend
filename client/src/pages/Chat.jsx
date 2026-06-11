import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { swapAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Form, Button, ListGroup, Alert } from 'react-bootstrap';

export default function Chat() {
  const { swapId } = useParams();
  const [swap, setSwap] = useState(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      const res = await swapAPI.getAll();
      setSwap(res.data.find(s => s._id === swapId));
    };
    fetch();
  }, [swapId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await swapAPI.sendMessage(swapId, text);
      setText('');
      const res = await swapAPI.getAll();
      setSwap(res.data.find(s => s._id === swapId));
    } catch { setMsg('Failed to send message'); }
  };

  if (!swap) return <div className="text-center mt-5">Loading chat...</div>;

  return (
    <Container style={{ maxWidth: '600px' }}>
      <h4 className="mb-3"> Negotiation: {swap.item1.title} ↔ {swap.item2.title}</h4>
      {msg && <Alert variant="danger">{msg}</Alert>}
      <Card className="mb-3" style={{ height: '400px', overflowY: 'auto' }}>
        <ListGroup variant="flush">
          {swap.messages.map((m, i) => (
            <ListGroup.Item key={i} className={m.sender === user._id ? 'text-end bg-light' : ''}>
              <strong>{m.sender === user._id ? 'You' : 'Other'}:</strong> {m.text}
              <div className="text-muted small">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
      <Form onSubmit={handleSend} className="d-flex gap-2">
        <Form.Control placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} />
        <Button type="submit">Send</Button>
      </Form>
    </Container>
  );
}