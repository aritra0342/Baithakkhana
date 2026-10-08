/**
 * কলকা — the mango-shaped paisley stitched into Bengali kantha quilts and
 * printed on Jamdani borders. Used as drifting background ornament.
 */
export function Kolka({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg className={`kolka ${className}`} viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M118 14C178 44 196 128 158 192C128 242 60 256 30 216C-2 174 18 118 62 96C98 78 128 50 118 14Z" fill="var(--card)" stroke="currentColor" strokeWidth="2.2"/>
      <path d="M116 42C158 70 170 130 142 176C120 212 72 224 50 196C28 168 44 128 76 112C104 98 124 72 116 42Z" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 5"/>
      <path d="M110 76C136 98 142 136 124 164C110 186 82 194 70 178C56 160 68 136 88 126C104 118 116 98 110 76Z" fill="var(--mustard)" fillOpacity=".55" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M96 118C108 128 110 146 100 158" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      {[[40, 106], [28, 150], [44, 206], [92, 236], [148, 212], [176, 160], [174, 102], [142, 52]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill="currentColor"/>
      ))}
    </svg>
  );
}
