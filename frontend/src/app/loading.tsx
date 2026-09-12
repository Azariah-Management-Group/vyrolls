import './loading.css';

export default function Loading() {
  return (
    <div className="loadingContainer">
      <div className="loadingContent">
        <div className="carWrapper">
          {/* SVG of a sleek Ferrari side profile */}
          <svg className="luxuryCar" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ferrariRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cc0000" />
                <stop offset="40%" stopColor="#ff2800" />
                <stop offset="80%" stopColor="#ff1100" />
                <stop offset="100%" stopColor="#aa0000" />
              </linearGradient>
              <linearGradient id="windowTint" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#111" />
                <stop offset="100%" stopColor="#222" />
              </linearGradient>
            </defs>
            
            {/* Car shadow */}
            <ellipse cx="150" cy="85" rx="135" ry="6" fill="rgba(0,0,0,0.5)" className="carShadow" />
            
            {/* Ferrari Body (Low, sharp, mid-engine profile) */}
            <path d="M 35 70 
                     C 25 70, 15 65, 12 55 
                     C 10 45, 25 38, 45 35 
                     L 85 28 
                     C 115 18, 140 18, 175 22 
                     L 245 35 
                     C 275 40, 290 48, 290 58 
                     C 290 66, 280 70, 260 70 
                     Z" fill="url(#ferrariRed)" className="carBody" />
                     
            {/* Carbon Fiber Side Skirt */}
            <path d="M 35 70 C 100 70, 200 70, 260 70 L 255 65 C 200 65, 100 65, 40 65 Z" fill="#111" />

            {/* Dark Windows */}
            <path d="M 95 30 
                     C 120 22, 145 22, 165 24 
                     L 195 32
                     L 150 32
                     Z" fill="url(#windowTint)" />
                     
            {/* Scuderia Ferrari Shield Detail */}
            <path d="M 125 45 L 132 45 L 132 52 C 132 55, 128 57, 128 57 C 128 57, 125 55, 125 52 Z" fill="#ffcc00" />
            <rect x="125" y="45" width="7" height="2" fill="#009246" />
            <rect x="125" y="47" width="7" height="2" fill="#ffffff" />
            <rect x="125" y="49" width="7" height="2" fill="#ce2b37" />

            {/* Front Headlight */}
            <path d="M 255 48 C 265 48, 280 50, 285 55 L 250 55 Z" fill="#fff" className="headlight" />
            <path d="M 270 52 L 360 52" stroke="rgba(255,255,255,0.7)" strokeWidth="5" className="lightBeam" strokeLinecap="round" />
            
            {/* Rear Light (Iconic round Ferrari taillight) */}
            <circle cx="20" cy="48" r="6" fill="#ff0000" />
            <circle cx="20" cy="48" r="3" fill="#ff9999" className="taillight" />

            {/* Wheels (Aggressive multi-spoke) */}
            <g className="wheel frontWheel">
              {/* Tire */}
              <circle cx="215" cy="65" r="22" fill="#0a0a0a" />
              <circle cx="215" cy="65" r="16" fill="#222" />
              {/* Brake Caliper (Red) */}
              <path d="M 205 53 C 215 50, 225 53, 225 53 L 223 58 C 223 58, 215 56, 207 58 Z" fill="#ff2800" />
              {/* Rim Center */}
              <circle cx="215" cy="65" r="12" fill="#silver" />
              <circle cx="215" cy="65" r="3" fill="#ffcc00" />
              {/* Spokes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                <line key={angle} x1="215" y1="65" x2={215 + Math.cos(angle * Math.PI / 180) * 15} y2={65 + Math.sin(angle * Math.PI / 180) * 15} stroke="#silver" strokeWidth="2" />
              ))}
            </g>
            
            <g className="wheel backWheel">
              {/* Tire */}
              <circle cx="75" cy="65" r="22" fill="#0a0a0a" />
              <circle cx="75" cy="65" r="16" fill="#222" />
              {/* Brake Caliper (Red) */}
              <path d="M 65 53 C 75 50, 85 53, 85 53 L 83 58 C 83 58, 75 56, 67 58 Z" fill="#ff2800" />
              {/* Rim Center */}
              <circle cx="75" cy="65" r="12" fill="#silver" />
              <circle cx="75" cy="65" r="3" fill="#ffcc00" />
              {/* Spokes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                <line key={angle} x1="75" y1="65" x2={75 + Math.cos(angle * Math.PI / 180) * 15} y2={65 + Math.sin(angle * Math.PI / 180) * 15} stroke="#silver" strokeWidth="2" />
              ))}
            </g>
            
            {/* Speed lines on the car body */}
            <line x1="140" y1="40" x2="220" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="50" x2="160" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        
        {/* Wind / Speed lines flying past */}
        <div className="speedLines">
          <div className="speedLine s1"></div>
          <div className="speedLine s2"></div>
          <div className="speedLine s3"></div>
          <div className="speedLine s4"></div>
          <div className="speedLine s5"></div>
          <div className="speedLine s6"></div>
        </div>
        
        <div className="loadingText">
          <span>S</span>
          <span>H</span>
          <span>I</span>
          <span>F</span>
          <span>T</span>
          <span>I</span>
          <span>N</span>
          <span>G</span>
          <span>&nbsp;</span>
          <span>G</span>
          <span>E</span>
          <span>A</span>
          <span>R</span>
          <span>S</span>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
}
