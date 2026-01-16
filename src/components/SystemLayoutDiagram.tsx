/**
 * Static reference diagram showing the standard SDI system layout.
 * Helps users understand where each pipe segment fits in the system.
 */
export function SystemLayoutDiagram() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">System Reference Diagram</h4>
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 600 320"
          className="w-full min-w-[500px] h-auto"
          role="img"
          aria-label="SDI System Layout Diagram showing pipe segments from pump to drip zones"
        >
          {/* Background */}
          <rect x="0" y="0" width="600" height="320" fill="#f9fafb" rx="8" />

          {/* Title */}
          <text x="300" y="24" textAnchor="middle" className="fill-gray-700 text-sm font-semibold">
            Typical SDI System Flow Path
          </text>

          {/* === PUMP === */}
          <g>
            <circle cx="60" cy="160" r="28" fill="#0d9488" stroke="#0f766e" strokeWidth="2" />
            <text x="60" y="164" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
              PUMP
            </text>
            {/* Pump label */}
            <text x="60" y="205" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="500">
              9
            </text>
          </g>

          {/* === Segment 9: Pump to Headworks === */}
          <g>
            <line x1="88" y1="160" x2="140" y2="160" stroke="#0d9488" strokeWidth="4" />
            <polygon points="135,155 145,160 135,165" fill="#0d9488" />
          </g>

          {/* === HEADWORKS === */}
          <g>
            <rect x="145" y="130" width="70" height="60" fill="#0d9488" stroke="#0f766e" strokeWidth="2" rx="4" />
            <text x="180" y="155" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
              HEAD-
            </text>
            <text x="180" y="167" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
              WORKS
            </text>
            {/* Labels for headworks segments */}
            <text x="180" y="205" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="500">
              2, 8
            </text>
          </g>

          {/* === Segment 7: Headworks to Zone Valve === */}
          <g>
            <line x1="215" y1="160" x2="265" y2="160" stroke="#0d9488" strokeWidth="4" />
            <polygon points="260,155 270,160 260,165" fill="#0d9488" />
            <text x="240" y="150" textAnchor="middle" fill="#374151" fontSize="8">
              7
            </text>
          </g>

          {/* === ZONE VALVE === */}
          <g>
            <rect x="270" y="140" width="50" height="40" fill="#14b8a6" stroke="#0d9488" strokeWidth="2" rx="4" />
            <text x="295" y="157" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">
              ZONE
            </text>
            <text x="295" y="169" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">
              VALVE
            </text>
            <text x="295" y="195" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="500">
              6
            </text>
          </g>

          {/* === Segment 5: Zone Valve to Supply Manifold === */}
          <g>
            <line x1="320" y1="160" x2="370" y2="160" stroke="#0d9488" strokeWidth="4" />
            <polygon points="365,155 375,160 365,165" fill="#0d9488" />
            <text x="345" y="150" textAnchor="middle" fill="#374151" fontSize="8">
              5
            </text>
          </g>

          {/* === SUPPLY MANIFOLD === */}
          <g>
            <rect x="375" y="80" width="20" height="160" fill="#5eead4" stroke="#14b8a6" strokeWidth="2" rx="2" />
            <text x="385" y="260" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="500">
              Supply
            </text>
          </g>

          {/* === DRIP ZONE LATERALS (Segment 4) === */}
          <g>
            {/* Lateral lines */}
            <line x1="395" y1="100" x2="495" y2="100" stroke="#2dd4bf" strokeWidth="3" />
            <line x1="395" y1="130" x2="495" y2="130" stroke="#2dd4bf" strokeWidth="3" />
            <line x1="395" y1="160" x2="495" y2="160" stroke="#2dd4bf" strokeWidth="3" />
            <line x1="395" y1="190" x2="495" y2="190" stroke="#2dd4bf" strokeWidth="3" />
            <line x1="395" y1="220" x2="495" y2="220" stroke="#2dd4bf" strokeWidth="3" />

            {/* Emitter dots */}
            {[100, 130, 160, 190, 220].map((y) => (
              <g key={y}>
                <circle cx="420" cy={y} r="3" fill="#0f766e" />
                <circle cx="445" cy={y} r="3" fill="#0f766e" />
                <circle cx="470" cy={y} r="3" fill="#0f766e" />
              </g>
            ))}

            {/* Label */}
            <text x="445" y="70" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="500">
              Drip Laterals (4)
            </text>
          </g>

          {/* === RETURN MANIFOLD === */}
          <g>
            <rect x="500" y="80" width="20" height="160" fill="#99f6e4" stroke="#5eead4" strokeWidth="2" rx="2" />
            <text x="510" y="260" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="500">
              Return
            </text>
          </g>

          {/* === Segment 3: Return Manifold to Headworks === */}
          <g>
            {/* Vertical line down from return manifold */}
            <line x1="510" y1="240" x2="510" y2="290" stroke="#14b8a6" strokeWidth="3" />
            {/* Horizontal line back to headworks area */}
            <line x1="510" y1="290" x2="180" y2="290" stroke="#14b8a6" strokeWidth="3" />
            {/* Vertical line up to headworks */}
            <line x1="180" y1="290" x2="180" y2="195" stroke="#14b8a6" strokeWidth="3" />
            <polygon points="175,200 180,190 185,200" fill="#14b8a6" />
            <text x="345" y="305" textAnchor="middle" fill="#374151" fontSize="8">
              3 - Return to Headworks
            </text>
          </g>

          {/* === Segment 1: Headworks to Flush Discharge === */}
          <g>
            <line x1="145" y1="160" x2="100" y2="160" stroke="#f97316" strokeWidth="3" strokeDasharray="5,3" />
            <line x1="100" y1="160" x2="100" y2="80" stroke="#f97316" strokeWidth="3" strokeDasharray="5,3" />
            <polygon points="95,85 100,75 105,85" fill="#f97316" />
            <text x="100" y="65" textAnchor="middle" fill="#f97316" fontSize="8" fontWeight="500">
              Flush (1)
            </text>
          </g>

          {/* === LEGEND === */}
          <g transform="translate(10, 270)">
            <rect x="0" y="0" width="130" height="45" fill="white" stroke="#e5e7eb" rx="4" />
            <text x="65" y="14" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="600">
              Legend
            </text>
            <line x1="10" y1="24" x2="30" y2="24" stroke="#0d9488" strokeWidth="3" />
            <text x="35" y="27" fill="#374151" fontSize="7">Supply flow</text>
            <line x1="70" y1="24" x2="90" y2="24" stroke="#14b8a6" strokeWidth="3" />
            <text x="95" y="27" fill="#374151" fontSize="7">Return flow</text>
            <line x1="10" y1="38" x2="30" y2="38" stroke="#f97316" strokeWidth="3" strokeDasharray="4,2" />
            <text x="35" y="41" fill="#374151" fontSize="7">Flush discharge</text>
          </g>

          {/* Flow direction indicator */}
          <g transform="translate(450, 270)">
            <rect x="0" y="0" width="140" height="45" fill="white" stroke="#e5e7eb" rx="4" />
            <text x="70" y="14" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="600">
              Segment Numbers
            </text>
            <text x="70" y="28" textAnchor="middle" fill="#6b7280" fontSize="7">
              Match these to your pipe
            </text>
            <text x="70" y="40" textAnchor="middle" fill="#6b7280" fontSize="7">
              segments below
            </text>
          </g>
        </svg>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Numbers indicate standard pipe segment positions. Your system may vary.
      </p>
    </div>
  )
}
