import { WARM_TRUNK, WARM_LEAF, WARM_LEAF_LIGHT } from './palette'

export default function GrowingTree() {
  return (
    <svg
      width="180"
      height="142"
      viewBox="0 0 240 190"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <style>{`
        @keyframes tree-sway {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }
        @keyframes leaf-rustle {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
      `}</style>

      <g style={{ transformBox: 'fill-box', transformOrigin: 'bottom center', animation: 'tree-sway 6s ease-in-out infinite' }}>
        <g stroke={WARM_TRUNK} strokeLinecap="round" fill="none">
          <path d="M120 186 C 119 164 120 148 120 132" strokeWidth="11" />
          <path d="M120 158 C 106 154 92 142 82 128" strokeWidth="6" />
          <path d="M120 146 C 134 142 148 132 158 118" strokeWidth="6" />
          <path d="M120 136 C 112 132 104 122 98 110" strokeWidth="4.5" />
          <path d="M120 128 C 130 124 138 116 144 106" strokeWidth="4.5" />
          <path d="M96 122 C 90 116 84 108 80 98" strokeWidth="3.5" />
          <path d="M144 116 C 150 112 156 104 160 94" strokeWidth="3.5" />
        </g>

        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'leaf-rustle 6s ease-in-out infinite' }}>
          <circle cx="120" cy="88" r="32" fill={WARM_LEAF} />
          <circle cx="92" cy="74" r="21" fill={WARM_LEAF_LIGHT} />
          <circle cx="148" cy="76" r="21" fill={WARM_LEAF_LIGHT} />
          <circle cx="120" cy="60" r="19" fill={WARM_LEAF_LIGHT} />
          <circle cx="106" cy="104" r="17" fill={WARM_LEAF} />
          <circle cx="136" cy="102" r="17" fill={WARM_LEAF} />
        </g>

        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'leaf-rustle 6s ease-in-out 0.2s infinite' }}>
          <circle cx="76" cy="122" r="17" fill={WARM_LEAF} />
          <circle cx="84" cy="108" r="13" fill={WARM_LEAF_LIGHT} />
          <circle cx="66" cy="112" r="10" fill={WARM_LEAF_LIGHT} />
        </g>

        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'leaf-rustle 6s ease-in-out 0.4s infinite' }}>
          <circle cx="160" cy="114" r="17" fill={WARM_LEAF} />
          <circle cx="150" cy="102" r="13" fill={WARM_LEAF_LIGHT} />
          <circle cx="170" cy="104" r="10" fill={WARM_LEAF_LIGHT} />
        </g>

        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'leaf-rustle 6s ease-in-out 0.1s infinite' }}>
          <circle cx="80" cy="130" r="13" fill={WARM_LEAF} />
          <circle cx="92" cy="122" r="10" fill={WARM_LEAF_LIGHT} />
        </g>

        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'leaf-rustle 6s ease-in-out 0.3s infinite' }}>
          <circle cx="154" cy="124" r="13" fill={WARM_LEAF} />
          <circle cx="144" cy="116" r="10" fill={WARM_LEAF_LIGHT} />
        </g>
      </g>
    </svg>
  )
}
