import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
    
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0
      }} />

    
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.85) 100%)',
        zIndex: 1
      }} />

      
      <Container className="d-flex flex-column justify-content-center align-items-center text-center text-white" style={{ position: 'relative', zIndex: 2, height: '100vh' }}>
        
        <h1 className="display-3 fw-bold mb-3" style={{ letterSpacing: '-0.5px', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
          SwapStyle
        </h1>
        
        <p className="lead mb-4" style={{ maxWidth: '650px', fontWeight: '300', lineHeight: '1.6', color: '#e2e8f0' }}>
          Refresh your wardrobe without spending a dime. Swap pre-loved fashion, reduce textile waste, and join a community that values style & sustainability.
        </p>

        <div className="d-flex flex-wrap gap-3 justify-content-center mb-5">
          <Button variant="light" size="lg" className="px-4 fw-semibold shadow-sm" onClick={() => navigate('/register')}>
            Get Started
          </Button>
          <Button variant="outline-light" size="lg" className="px-4" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="outline-light" size="lg" className="px-4" onClick={() => navigate('/listings')}>
            Browse Swaps
          </Button>
        </div>

       
        <div className="d-flex flex-wrap gap-4 justify-content-center mt-3" style={{ fontSize: '0.85rem', opacity: '0.85', letterSpacing: '0.5px' }}>
          <span className="d-flex align-items-center gap-2">🌱 Eco-Friendly</span>
          <span className="d-flex align-items-center gap-2">🔄 Zero Cost</span>
          <span className="d-flex align-items-center gap-2">📦 Verified Shipping</span>
          <span className="d-flex align-items-center gap-2">💬 Secure Chat</span>
        </div>

      </Container>
    </div>
  );
}