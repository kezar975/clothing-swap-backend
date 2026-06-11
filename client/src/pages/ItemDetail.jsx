import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clothingAPI, swapAPI } from '../services/api';
import { Container, Card, Row, Col, Button, Alert, Modal, Form } from 'react-bootstrap';

const API_BASE = 'http://localhost:5000';

const PLACEHOLDER_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400' viewBox='0 0 500 400'%3E%3Crect fill='%23e9ecef' width='500' height='400'/%3E%3Ctext fill='%236c757d' font-family='Arial, sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E`;

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await clothingAPI.getById(id);
        setItem(res.data.clothing || res.data);

        if (user) {
          const mine = await clothingAPI.getAll({ status: 'Available' });
          setMyItems(mine.data.clothes.filter(i => i.owner?._id === user._id));
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        setMsg({ type: 'danger', text: 'Item not found' });
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, user]);

  const handleSwap = async () => {
    if (!selectedItemId) return setMsg({ type: 'warning', text: 'Select your item to exchange' });

    try {
      const res = await swapAPI.create({
        receiverId: item.owner._id,
        item1Id: selectedItemId,
        item2Id: id
      });

      const fairnessMsg = res.data.isFair
        ? 'Fair Swap! Request sent.'
        : 'Value difference is large, but request sent anyway.';

      setMsg({ type: res.data.isFair ? 'success' : 'warning', text: fairnessMsg });
      setShowModal(false);

    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to send request' });
    }
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Loading item details...</p>
    </Container>
  );

  if (!item) return (
    <Container className="mt-5">
      <Alert variant="danger" className="text-center">
        {msg.text || 'Item not found'}
      </Alert>
      <div className="text-center">
        <Button variant="primary" onClick={() => navigate('/listings')}>
          Back to Listings
        </Button>
      </div>
    </Container>
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  return (
    <Container className="mt-4">
      {msg.text && <Alert variant={msg.type} dismissible onClose={() => setMsg({})}>{msg.text}</Alert>}

      <Card className="shadow-sm">
        <Row className="g-0">
          <Col md={5}>
            <div style={{
              height: '100%',
              minHeight: '400px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px 0 0 12px',
              overflow: 'hidden'
            }}>
              <Card.Img
                src={getImageUrl(item.images?.[0])}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
          </Col>
          <Col md={7}>
            <Card.Body className="p-4 p-md-5">
              <h2 className="mb-3">{item.title || 'Untitled Item'}</h2>

              <div className="mb-3">
                <p className="text-muted mb-2">
                  {item.brand && <span className="me-2">{item.brand} •</span>}
                  <span className="me-2">{item.size}</span>
                  <span>• {item.condition}</span>
                </p>

                <h3 className="text-primary mb-3">₹{item.estimatedValue || 'N/A'}</h3>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-2">Description:</h6>
                <p className="text-secondary">{item.description || 'No description provided.'}</p>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-2">Location:</h6>
                <p className="mb-0">
                  {item.location?.city || 'N/A'}
                </p>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-2">Owner:</h6>
                <p className="mb-0">
                  {item.owner?.name || 'Anonymous'}
                  {item.owner?.location?.city && (
                    <span className="text-muted ms-2">
                      ({item.owner.location.city})
                    </span>
                  )}
                </p>
              </div>

              <hr className="my-4" />

              {user && user._id !== item.owner?._id ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="w-100"
                >
                  Send Swap Request
                </Button>
              ) : user?._id === item.owner?._id ? (
                <Alert variant="info" className="mb-0">
                  This is your own item. You cannot swap with yourself.
                </Alert>
              ) : (
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="w-100"
                >
                  🔐 Login to Swap
                </Button>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Your Item to Exchange</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Choose one of your available items to swap with <strong>"{item.title}"</strong>
          </p>

          {myItems.length === 0 ? (
            <Alert variant="warning">
              You don't have any available items to swap.
              <Button
                variant="link"
                className="ms-1 p-0"
                onClick={() => navigate('/dashboard')}
              >
                List an item
              </Button>
              first.
            </Alert>
          ) : (
            <Form.Group>
              <Form.Label>Select your item:</Form.Label>
              <Form.Select
                onChange={e => setSelectedItemId(e.target.value)}
                value={selectedItemId}
              >
                <option value="">Choose an item...</option>
                {myItems.map(i => (
                  <option key={i._id} value={i._id}>
                    {i.title} (₹{i.estimatedValue}) - {i.condition}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {selectedItemId && (
            <Alert variant="info" className="mt-3 mb-0 small">
              Backend will verify fairness before processing.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSwap}
            disabled={!selectedItemId}
          >
            Send Request
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}