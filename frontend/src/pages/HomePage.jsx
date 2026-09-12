import './HomePage.css'

function HomePage({ onStart }) {
  return (
    <div className="home-screen">
      <h1 className="home-title">
        <span style={{ color: '#A8E56C' }}>룸</span>
        <span style={{ color: '#8A8A8A' }}>-</span>
        <span style={{ color: '#FFB4C6' }}>메</span>
        <span style={{ color: '#FFE07D' }}>이</span>
        <span style={{ color: '#8FD9FF' }}>팅</span>
      </h1>
      <button type="button" className="home-start-link" onClick={onStart}>
        [룸-메이트 찾으러 가기!]
      </button>
    </div>
  )
}

export default HomePage
