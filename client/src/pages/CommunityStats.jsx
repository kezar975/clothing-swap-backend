import { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';

export default function CommunityStats() {
  const { user } = useAuth();
  const [myStats, setMyStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [myRes, platformRes, leaderboardRes] = await Promise.all([
          user ? statsAPI.getMyStats() : Promise.resolve(null),
          statsAPI.getPlatformStats(),
          statsAPI.getLeaderboard()
        ]);
        
        if (myRes) setMyStats(myRes.data.stats);
        setPlatformStats(platformRes.data.stats);
        setLeaderboard(leaderboardRes.data.leaderboard);
      } catch (err) {
        console.error('Stats fetch error:', err);
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  if (loading) return <div className="text-center mt-5">Loading community stats...</div>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4"> Sustainable Fashion Community</h2>
      
      {/* Platform-wide Impact */}
      <Card className="mb-4 bg-success text-white">
        <Card.Header><h4> Our Collective Impact</h4></Card.Header>
        <Card.Body>
          <Row className="text-center">
            <Col md={3} className="mb-3">
              <h2>{platformStats?.totalSwaps || 0}</h2>
              <p>Successful Swaps</p>
            </Col>
            <Col md={3} className="mb-3">
              <h2>{platformStats?.totalUsers || 0}</h2>
              <p>Active Members</p>
            </Col>
            <Col md={3} className="mb-3">
              <h2>{platformStats?.totalWasteSaved || 0} kg</h2>
              <p>Textile Waste Saved</p>
            </Col>
            <Col md={3} className="mb-3">
              <h2>{platformStats?.totalCO2Saved || 0} kg</h2>
              <p>CO₂ Emissions Prevented</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

     
      {myStats && user && (
        <Card className="mb-4">
          <Card.Header><h5> Your Sustainability Journey</h5></Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6>Your Impact</h6>
                <Row className="mb-3">
                  <Col xs={6}>
                    <p className="mb-1"><strong>Swaps Completed:</strong></p>
                    <Badge bg="success" pill>{myStats.successfulSwaps}</Badge>
                  </Col>
                  <Col xs={6}>
                    <p className="mb-1"><strong>Items Listed:</strong></p>
                    <Badge bg="primary" pill>{myStats.itemsListed}</Badge>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={6}>
                    <p className="mb-1"><strong>Waste Saved:</strong></p>
                    <Badge bg="info" pill>{myStats.textileWasteSavedKg.toFixed(1)} kg</Badge>
                  </Col>
                  <Col xs={6}>
                    <p className="mb-1"><strong>CO₂ Saved:</strong></p>
                    <Badge bg="secondary" pill>{myStats.co2SavedKg.toFixed(1)} kg</Badge>
                  </Col>
                </Row>
                
                <div className="mt-3">
                  <p className="mb-1"><strong>Eco Score:</strong> {myStats.ecoScore}/100</p>
                  <ProgressBar
                    now={myStats.ecoScore}
                    variant={myStats.ecoScore >= 70 ? 'success' : myStats.ecoScore >= 40 ? 'warning' : 'info'}
                    label={`${myStats.ecoScore}%`}
                  />
                  <small className="text-muted">
                    {myStats.ecoScore < 30 && " Getting started! Keep swapping."}
                    {myStats.ecoScore >= 30 && myStats.ecoScore < 70 && " Great progress! You're making a difference."}
                    {myStats.ecoScore >= 70 && " Amazing! You're a sustainability champion!"}
                  </small>
                </div>
              </Col>
              
              <Col md={6}>
                <h6> Your Badges</h6>
                {myStats.badges && myStats.badges.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {myStats.badges.map((badge, idx) => (
                      <Badge key={idx} bg="warning" text="dark" className="p-2">
                        <span style={{fontSize: '1.5rem'}}>{badge.icon}</span>
                        <div style={{fontSize: '0.8rem'}}><strong>{badge.name}</strong></div>
                        <div style={{fontSize: '0.7rem'}}>{badge.description}</div>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Complete swaps to earn badges!</p>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

     
      <Card>
        <Card.Header><h5> Top Eco Warriors This Month</h5></Card.Header>
        <Card.Body>
          {leaderboard.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Eco Score</th>
                    <th>Swaps</th>
                    <th>Waste Saved</th>
                    <th>Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => (
                    <tr key={idx} className={idx === 0 ? 'table-success' : ''}>
                      <td>
                        {idx === 0 && '1'}
                        {idx === 1 && '2'}
                        {idx === 2 && '3'}
                        {idx > 2 && `#${idx + 1}`}
                      </td>
                      <td><strong>{user.user?.name || 'Anonymous'}</strong></td>
                      <td><Badge bg="success">{user.ecoScore}</Badge></td>
                      <td>{user.successfulSwaps}</td>
                      <td>{user.textileWasteSavedKg.toFixed(1)} kg</td>
                      <td>
                        {user.badges?.slice(0, 3).map((b, i) => (
                          <span key={i} style={{fontSize: '1.2rem'}}>{b.icon} </span>
                        ))}
                        {user.badges?.length > 3 && `+${user.badges.length - 3}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted">Be the first eco warrior! Start swapping now. </p>
          )}
        </Card.Body>
      </Card>

      {/* Eco Tips */}
      <Card className="mt-4 bg-light">
        <Card.Body>
          <h6> Sustainable Fashion Tips</h6>
          <ul className="mb-0">
            <li> Swap instead of buying new - saves 2,700 liters of water per t-shirt!</li>
            <li> Each clothing swap prevents ~0.5kg of textile waste</li>
            <li> Fashion industry produces 10% of global carbon emissions - you're helping reduce it!</li>
            <li> Quality over quantity - choose durable items that last longer</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
}