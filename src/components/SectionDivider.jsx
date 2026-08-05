export default function SectionDivider({ from = '#ffffff', to = '#f1f5f9' }) {
  return (
    <div className="w-full overflow-hidden leading-[0]" style={{ backgroundColor: from }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[60px] block">
        <path
          d="M0,0 C360,60 1080,0 1440,60 L1440,60 L0,60 Z"
          fill={to}
        />
      </svg>
    </div>
  )
}


