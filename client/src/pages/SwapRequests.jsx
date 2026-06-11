import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { swapAPI } from '../services/api';
import { Container, Card, Row, Col, Button, Badge, Alert, Spinner } from 'react-bootstrap';

export default function SwapRequests() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await swapAPI.getAll();
        setSwaps(res.data || []);
      } catch {
        setMsg('Failed to load swaps');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await swapAPI.updateStatus(id, status);
      setMsg(`Swap ${status.toLowerCase()} successfully`);
      const res = await swapAPI.getAll();
      setSwaps(res.data || []);
    } catch {
      setMsg('Action failed');
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2 text-muted">Loading swaps...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h3 className="mb-4">My Swap Requests</h3>
      {msg && <Alert variant={msg.includes('failed') ? 'danger' : 'success'}>{msg}</Alert>}
      
      {swaps.length === 0 ? (
        <p className="text-center text-muted">No swap requests yet.</p>
      ) : (
        <Row className="g-3">
          {swaps.map(s => {
            const item1 = s.item1 || { title: 'Unknown Item', estimatedValue: 0 };
            const item2 = s.item2 || { title: 'Unknown Item', estimatedValue: 0 };
            const sender = s.sender || { name: 'Unknown' };
            const receiver = s.receiver || { name: 'Unknown' };

            return (
              <Col key={s._id}>
                <Card className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <Badge bg={
                      s.status === 'Pending' ? 'warning' : 
                      s.status === 'Accepted' ? 'success' : 
                      s.status === 'Completed' ? 'info' : 'secondary'
                    }>
                      {s.status || 'Unknown'}
                    </Badge>
                    <small className="text-muted">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                    </small>
                  </div>
                  
                  <p className="mb-2">
                    <strong>Item 1:</strong> {item1.title} (₹{item1.estimatedValue}) ↔ 
                    <strong> Item 2:</strong> {item2.title} (₹{item2.estimatedValue})
                  </p>
                  
                  <p className="mb-3 text-muted small">
                    Owner: {sender.name} ↔ {receiver.name}
                  </p>
                  
                  <div className="d-flex gap-2 flex-wrap">
                    {s.status === 'Pending' && (
                      <>
                        <Button size="sm" variant="success" onClick={() => handleAction(s._id, 'Accepted')}>
                          Accept
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleAction(s._id, 'Rejected')}>
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {s.status === 'Accepted' && (
                      <>
                        <Button size="sm" variant="primary" onClick={() => navigate(`/chat/${s._id}`)}>
                          Open Chat
                        </Button>
                        <Button size="sm" variant="success" onClick={() => handleAction(s._id, 'Completed')}>
                          Mark Completed
                        </Button>
                        <Link to={`/courier/${s._id}`} className="btn btn-sm btn-info">
                          Courier
                        </Link>
                      </>
                    )}
                    
                    {s.status === 'Completed' && (
                      <Badge bg="success">Completed</Badge>
                    )}
                    
                    {s.status === 'Rejected' && (
                      <Badge bg="secondary">Rejected</Badge>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}