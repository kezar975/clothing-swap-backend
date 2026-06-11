import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  
import { courierAPI, swapAPI } from '../services/api'; 
import { Container, Card, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';


const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function CourierDetails() {
  const { swapId } = useParams();
  const { user } = useAuth();
  
  const [courierInfo, setCourierInfo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [swapData, setSwapData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    sender: { name: '', phone: '', address: '', pincode: '', city: '' },
    receiver: { name: '', phone: '', address: '', pincode: '', city: '' },
    courierService: 'Other',
    trackingId: '',
    notes: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [courierRes, suggestionsRes] = await Promise.all([
          courierAPI.get(swapId),
          courierAPI.getSuggestions()
        ]);
        
        setCourierInfo(courierRes.data.courierInfo);
        setSuggestions(suggestionsRes.data.suggestions);

        
        const swapRes = await swapAPI.getById(swapId);
        setSwapData(swapRes.data.swap || swapRes.data);
        
        if (courierRes.data.courierInfo) {
          setFormData({
            sender: courierRes.data.courierInfo.sender || {},
            receiver: courierRes.data.courierInfo.receiver || {},
            courierService: courierRes.data.courierInfo.courierService || 'Other',
            trackingId: courierRes.data.courierInfo.trackingId || '',
            notes: courierRes.data.courierInfo.notes || ''
          });
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        setMsg({ type: 'danger', text: 'Failed to load courier info' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [swapId]);

  
  const isSender = user && swapData && String(user._id) === String(swapData.sender?._id);
  
  
  useEffect(() => {
    if (user && swapData) {
      console.log(' Auth Check:', {
        userId: user._id,
        senderId: swapData.sender?._id,
        isSender: isSender
      });
    }
  }, [user, swapData, isSender]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await courierAPI.createOrUpdate(swapId, formData);
      setCourierInfo(res.data.courierInfo);
      setMsg({ type: 'success', text: 'Courier info saved!' });
      setEditing(false);
    } catch {
      setMsg({ type: 'danger', text: 'Failed to save' });
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      const res = await courierAPI.updateStatus(swapId, status);
      setCourierInfo(res.data.courierInfo);
      setMsg({ type: 'success', text: `Status updated to ${status}` });
    } catch {
      setMsg({ type: 'danger', text: 'Failed to update status' });
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container className="mt-4">
      <h3 className="mb-4"> Shipping & Courier Details</h3>
      
      {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

      <Card className="mb-4">
        <Card.Header><strong> Recommended Courier Services</strong></Card.Header>
        <Card.Body>
          <Row xs={1} md={2} lg={3} className="g-3">
            {suggestions.map((svc, idx) => (
              <Col key={idx}>
                <Card className="border-light shadow-sm">
                  <Card.Body>
                    <Card.Title className="text-primary">{svc.name}</Card.Title>
                    <Card.Text className="small mb-1">
                      <strong>Best for:</strong> {svc.bestFor}<br/>
                      <strong>Cost:</strong> {svc.estimatedCost}<br/>
                      <strong>Tracking:</strong> {svc.trackingAvailable ? ' Yes' : ' No'}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      
      {!editing && courierInfo ? (
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span><strong> Current Shipping Details</strong></span>
            <Button size="sm" variant="outline-primary" onClick={() => setEditing(true)}>Edit</Button>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6> Sender Details</h6>
                <p><strong>Name:</strong> {courierInfo.sender?.name || 'N/A'}</p>
                <p><strong>Phone:</strong> {courierInfo.sender?.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {courierInfo.sender?.address || 'N/A'}, {courierInfo.sender?.pincode || ''}</p>
              </Col>
              <Col md={6}>
                <h6> Receiver Details</h6>
                <p><strong>Name:</strong> {courierInfo.receiver?.name || 'N/A'}</p>
                <p><strong>Phone:</strong> {courierInfo.receiver?.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {courierInfo.receiver?.address || 'N/A'}, {courierInfo.receiver?.pincode || ''}</p>
              </Col>
            </Row>
            <hr/>
            <Row>
              <Col md={4}>
                <p><strong>Courier:</strong> <Badge bg="info">{courierInfo.courierService}</Badge></p>
              </Col>
              <Col md={4}>
                <p><strong>Est. Cost:</strong> ₹{courierInfo.estimatedCost}</p>
              </Col>
              <Col md={4}>
                <p><strong>Tracking ID:</strong> {courierInfo.trackingId || 'Not provided'}</p>
              </Col>
            </Row>
            {courierInfo.shippingStatus && (
              <div className="mt-3">
                <strong>Shipping Status:</strong> 
                <Badge bg={courierInfo.shippingStatus === 'Delivered' ? 'success' : 'warning'} className="ms-2">
                  {courierInfo.shippingStatus}
                </Badge>
              </div>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className="mb-4">
          <Card.Header><strong> Add Shipping Details</strong></Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              
              <Row className="mb-3">
                <Col md={6}><Form.Control placeholder="Your Name" value={formData.sender.name} onChange={e => setFormData({...formData, sender: {...formData.sender, name: e.target.value}})}/></Col>
                <Col md={6}><Form.Control placeholder="Phone Number" value={formData.sender.phone} onChange={e => setFormData({...formData, sender: {...formData.sender, phone: e.target.value}})}/></Col>
              </Row>
              <Form.Control className="mb-2" placeholder="Full Address" value={formData.sender.address} onChange={e => setFormData({...formData, sender: {...formData.sender, address: e.target.value}})}/>
              <Row className="mb-4">
                <Col md={6}><Form.Control placeholder="Pincode" value={formData.sender.pincode} onChange={e => setFormData({...formData, sender: {...formData.sender, pincode: e.target.value}})}/></Col>
                <Col md={6}><Form.Control placeholder="City" value={formData.sender.city} onChange={e => setFormData({...formData, sender: {...formData.sender, city: e.target.value}})}/></Col>
              </Row>
              <h6 className="mb-3"> Receiver Information</h6>
              <Row className="mb-3">
                <Col md={6}><Form.Control placeholder="Receiver Name" value={formData.receiver.name} onChange={e => setFormData({...formData, receiver: {...formData.receiver, name: e.target.value}})}/></Col>
                <Col md={6}><Form.Control placeholder="Phone Number" value={formData.receiver.phone} onChange={e => setFormData({...formData, receiver: {...formData.receiver, phone: e.target.value}})}/></Col>
              </Row>
              <Form.Control className="mb-2" placeholder="Full Address" value={formData.receiver.address} onChange={e => setFormData({...formData, receiver: {...formData.receiver, address: e.target.value}})}/>
              <Row className="mb-4">
                <Col md={6}><Form.Control placeholder="Pincode" value={formData.receiver.pincode} onChange={e => setFormData({...formData, receiver: {...formData.receiver, pincode: e.target.value}})}/></Col>
                <Col md={6}><Form.Control placeholder="City" value={formData.receiver.city} onChange={e => setFormData({...formData, receiver: {...formData.receiver, city: e.target.value}})}/></Col>
              </Row>
              <h6 className="mb-3">Courier Details</h6>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Select value={formData.courierService} onChange={e => setFormData({...formData, courierService: e.target.value})}>
                    <option value="Other">Select Courier Service</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Shiprocket">Shiprocket</option>
                    <option value="IndiaPost">India Post</option>
                    <option value="Dunzo">Dunzo</option>
                    <option value="Pickup">Local Pickup</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Control placeholder="Tracking ID (if available)" value={formData.trackingId} onChange={e => setFormData({...formData, trackingId: e.target.value})}/>
                </Col>
              </Row>
              <Form.Control className="mb-3" as="textarea" rows={3} placeholder="Additional Notes (optional)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}/>
              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">Save Courier Info</Button>
                {courierInfo && <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>}
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

     
      {courierInfo && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <strong> Shipping Status Tracker</strong>
            {isSender && <Badge bg="primary"> You can update status</Badge>}
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-between flex-wrap gap-2">
              {['Not Shipped', 'Packed', 'Shipped', 'In Transit', 'Delivered'].map((status) => (
                <Button
                  key={status}
                  variant={courierInfo.shippingStatus === status ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleStatusUpdate(status)}
                  
                  disabled={!isSender || (courierInfo.shippingStatus === 'Delivered' && status !== 'Delivered')}
                  title={!isSender ? "Only sender can update status" : ""}
                >
                  {status}
                </Button>
              ))}
            </div>
            
            {courierInfo.shippedDate && (
              <p className="mt-3 text-muted small">
                 Shipped on: {formatDate(courierInfo.shippedDate)}
              </p>
            )}
            {courierInfo.deliveredDate && (
              <p className="text-success small">
                 Delivered on: {formatDate(courierInfo.deliveredDate)}
              </p>
            )}
            
          
            {!isSender && (
              <Alert variant="info" className="mt-3 mb-0 small">
                Only the sender can update shipping status. You'll see real-time updates here.
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}