import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clothingAPI } from '../services/api';
import { Container, Row, Col, Card, Spinner, Form, Alert } from 'react-bootstrap';

const API_BASE = 'http://localhost:5000';

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState({ 
    type: '', 
    condition: '', 
    city: '', 
    status: 'Available'
  });
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await clothingAPI.getAll(filter);
        setItems(res.data.clothes || []);
        
        const cities = [...new Set(res.data.clothes
          .map(item => item.location?.city)
          .filter(Boolean))];
        setAvailableCities(cities);
      } catch (err) {
        console.error('Fetch Error:', err);
        setItems([]);
      }
      finally { setLoading(false); }
    };
    fetchItems();
  }, [filter]);

  const handleFilter = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  return (
    <Container>
      <h3 className="mb-4">Browse Available Swaps</h3>
      
      <Row className="mb-4 g-2">
        <Col md={3}>
          <Form.Select name="type" onChange={handleFilter} value={filter.type}>
            <option value="">All Types</option>
            <option>Shirt</option>
            <option>Pants</option>
            <option>Jacket</option>
            <option>Dress</option>
            <option>Shoes</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select name="condition" onChange={handleFilter} value={filter.condition}>
            <option value="">All Conditions</option>
            <option>New</option>
            <option>Like New</option>
            <option>Good</option>
            <option>Fair</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Control
            list="city-suggestions"
            name="city"
            placeholder="Search or select city..."
            value={filter.city}
            onChange={handleFilter}
          />
          <datalist id="city-suggestions">
            <option value="Mumbai" />
            <option value="Delhi" />
            <option value="Bangalore" />
            <option value="Chennai" />
            <option value="Hyderabad" />
            <option value="Pune" />
            <option value="Ahmedabad" />
            <option value="Kolkata" />
            <option value="Jaipur" />
            <option value="Surat" />
            {availableCities.map((c, i) => <option key={i} value={c} />)}
          </datalist>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading listings...</p>
        </div>
      ) : items.length === 0 ? (
        <Alert variant="info" className="text-center">
          No available items found matching your filters. Try changing location or type.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {items.map(item => (
            <Col key={item._id}>
              <Card className="h-100 shadow-sm">
                <div style={{ 
                  height: '250px', 
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#f8f9fa'
                }}>
                  <Card.Img 
                    variant="top" 
                    src={getImageUrl(item.images?.[0])}
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-truncate" title={item.title}>
                    {item.title}
                  </Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    {item.brand && <span>{item.brand} • </span>}
                    {item.size} • {item.condition}
                  </Card.Text>
                  {item.location?.city && (
                    <Card.Text className="text-muted small mb-2">
                      {item.location.city}
                    </Card.Text>
                  )}
                  <Card.Text className="fw-bold mb-3">
                    Value: ₹{item.estimatedValue}
                  </Card.Text>
                  <div className="mt-auto">
                    <Link 
                      to={`/item/${item._id}`} 
                      className="btn btn-primary w-100"
                    >
                      View Details
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}