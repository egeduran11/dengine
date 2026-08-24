import { ShieldCheck } from 'lucide-react'

export function BrandMark() {
  return (
    <div className="brand" aria-label="Dengine">
      <span className="brand-mark" aria-hidden="true">
        <ShieldCheck size={22} strokeWidth={2.2} />
      </span>
      <span className="brand-word">Dengine</span>
    </div>
  )
}
