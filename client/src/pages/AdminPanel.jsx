import { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { clothingAPI, swapAPI } from '../services/api';

export default function AdminPanel() {
  const [listings, setListings] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [l, s] = await Promise.all([clothingAPI.getAll(), swapAPI.getAll()]);
        setListings(l.data.clothes);
        setSwaps(s.data);
      } catch { setMsg('Failed to load data'); }
    };
    fetch();
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this listing permanently?')) return;
    try {
      await clothingAPI.delete(id);
      setListings(prev => prev.filter(i => i._id !== id));
      setMsg('Listing removed successfully');
    } catch { setMsg('Failed to remove'); }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      {msg && <Alert variant="success">{msg}</Alert>}

      {/* Platform Stats */}
      <Row className="mb-4 g-3">
        <Col md={3}><Card className="p-3 text-center"><h3>{listings.length}</h3><p>Total Listings</p></Card></Col>
        <Col md={3}><Card className="p-3 text-center"><h3>{swaps.length}</h3><p>Total Swaps</p></Card></Col>
        <Col md={3}><Card className="p-3 text-center"><h3>{swaps.filter(s => s.status === 'Completed').length}</h3><p>Completed</p></Card></Col>
        <Col md={3}><Card className="p-3 text-center"><h3>{swaps.filter(s => s.status === 'Pending').length}</h3><p>Pending</p></Card></Col>
      </Row>

      <h5 className="mb-3"> Active Listings</h5>
      <Table striped bordered hover responsive>
        <thead><tr><th>Title</th><th>Owner</th><th>City</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {listings.map(i => (
            <tr key={i._id}>
              <td>{i.title}</td>
              <td>{i.owner?.name || 'N/A'}</td>
              <td>{i.location?.city || 'N/A'}</td>
              <td><Badge bg={i.status === 'Available' ? 'success' : 'secondary'}>{i.status}</Badge></td>
              <td><Button size="sm" variant="danger" onClick={() => handleRemove(i._id)}>Remove</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h5 className="mt-4 mb-3">🔄Swap Activity</h5>
      <Table striped bordered hover responsive>
        <thead><tr><th>Items Exchanged</th><th>Users</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {swaps.map(s => (
            <tr key={s._id}>
              <td>{s.item1?.title} ↔ {s.item2?.title}</td>
              <td>{s.sender?.name} ↔ {s.receiver?.name}</td>
              <td><Badge bg={s.status === 'Completed' ? 'success' : s.status === 'Pending' ? 'warning' : 'info'}>{s.status}</Badge></td>
              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="mt-4 p-3 bg-light rounded">
        <h6>Admin Notes (Phase 1)</h6>
        <ul className="mb-0 small">
          <li>Disputes resolve manually by checking chat logs in `/chat/:swapId`</li>
          <li>"Remove" deletes listing from DB instantly</li>
          <li>Analytics based on real-time swap/listing counts</li>
        </ul>
      </div>
    </Container>
  );
}