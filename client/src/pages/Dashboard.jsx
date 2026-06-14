import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clothingAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const API_BASE = 'https://clothing-swap-marketplace.onrender.com/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  const [form, setForm] = useState({ 
    title: '', type: 'Shirt', brand: '', size: '', 
    condition: 'Good', estimatedValue: '', description: '', city: '' 
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchItems = async () => {
    const res = await clothingAPI.getAll();
    setItems(res.data.clothes.filter(i => i.owner?._id === user?._id));
  };

  useEffect(() => { 
    fetchItems(); 
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('type', form.type);
      formData.append('brand', form.brand);
      formData.append('size', form.size);
      formData.append('condition', form.condition);
      formData.append('estimatedValue', form.estimatedValue);
      formData.append('description', form.description);
      formData.append('city', form.city);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/clothes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setMsg({ type: 'success', text: 'Item listed successfully!' });
      setShowAdd(false);
      setImageFile(null);
      setImagePreview(null);
      fetchItems();
    } catch (err) {
      console.error('Upload Error:', err);
      setMsg({ type: 'danger', text: 'Failed to create listing' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await clothingAPI.update(editItem._id, { 
        ...form, 
        images: form.imageUrl ? [form.imageUrl] : editItem.images 
      });
      setMsg({ type: 'success', text: 'Item updated successfully!' });
      setShowEdit(false);
      fetchItems();
    } catch { 
      setMsg({ type: 'danger', text: 'Failed to update listing' }); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await clothingAPI.delete(id);
      setMsg({ type: 'success', text: 'Listing removed' });
      fetchItems();
    } catch { 
      setMsg({ type: 'danger', text: 'Failed to delete' }); 
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title, type: item.type, brand: item.brand, size: item.size,
      condition: item.condition, estimatedValue: item.estimatedValue,
      description: item.description, city: item.location?.city || '',
      imageUrl: item.images?.[0] || ''
    });
    setShowEdit(true);
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.name}</h2>
        <Button onClick={() => { 
          setForm({ title: '', type: 'Shirt', brand: '', size: '', condition: 'Good', estimatedValue: '', description: '', city: '' }); 
          setImageFile(null); 
          setImagePreview(null);
          setShowAdd(true); 
        }}>+ Add New Item</Button>
      </div>
      
      {msg.text && <Alert variant={msg.type} onClose={() => setMsg({})} dismissible>{msg.text}</Alert>}

      <Row xs={1} md={3} className="g-4">
        {items.map(item => (
          <Col key={item._id}>
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={item.images?.[0] 
                  ? (item.images[0].startsWith('http') ? item.images[0] : `${API_BASE}${item.images[0]}`)
                  : 'https://via.placeholder.com/300x150?text=No+Image'
                } 
                style={{ height: '150px', objectFit: 'cover' }} 
              />
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>
                  <Badge bg={item.status === 'Available' ? 'success' : 'secondary'}>{item.status}</Badge>
                </Card.Text>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-primary" onClick={() => openEdit(item)}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(item._id)}>Delete</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {items.length === 0 && <p className="text-center mt-4 text-muted">No items listed yet. Start swapping!</p>}

      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton><Modal.Title>List New Item</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            <Form.Control className="mb-2" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            
            <Form.Select className="mb-2" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Shirt</option><option>Pants</option><option>Jacket</option><option>Dress</option><option>Shoes</option>
            </Form.Select>
            
            <div className="d-flex gap-2 mb-2">
              <Form.Control placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
              <Form.Control placeholder="Size" value={form.size} onChange={e => setForm({...form, size: e.target.value})} required />
            </div>
            
            <div className="d-flex gap-2 mb-2">
              <Form.Select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
              </Form.Select>
              <Form.Control type="number" placeholder="Value (₹)" value={form.estimatedValue} onChange={e => setForm({...form, estimatedValue: e.target.value})} required />
            </div>
            
            <Form.Control className="mb-2" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <Form.Control className="mb-2" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            
            <Form.Group className="mb-2">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
              />
              <Form.Text className="text-muted">
                Accepted: JPEG, JPG, PNG, GIF, WebP (Max 5MB)
              </Form.Text>
              
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                </div>
              )}
            </Form.Group>
            
            <Button type="submit" className="w-100">Publish</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Item</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Control className="mb-2" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <Form.Select className="mb-2" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Shirt</option><option>Pants</option><option>Jacket</option><option>Dress</option><option>Shoes</option>
            </Form.Select>
            <div className="d-flex gap-2 mb-2">
              <Form.Control placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
              <Form.Control placeholder="Size" value={form.size} onChange={e => setForm({...form, size: e.target.value})} required />
            </div>
            <div className="d-flex gap-2 mb-2">
              <Form.Select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
              </Form.Select>
              <Form.Control type="number" placeholder="Value (₹)" value={form.estimatedValue} onChange={e => setForm({...form, estimatedValue: e.target.value})} required />
            </div>
            <Form.Control className="mb-2" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <Form.Control className="mb-2" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            
            <Form.Control className="mb-2" placeholder="Image URL (optional)" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
            
            <Button type="submit" className="w-100">Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}