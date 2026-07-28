import { forwardRef, useEffect, useRef, useState } from 'react'
import type { DocumentData } from '../types'
import { TEMPLATE_COMPONENTS } from '../templates'

// A4 width in px at 96dpi ≈ 794px. We scale the fixed-size doc to fit the pane.
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

interface Props {
  data: DocumentData
}

const PreviewPane = forwardRef<HTMLDivElement, Props>(function PreviewPane(
  { data },
  ref,
) {
  const Template = TEMPLATE_COMPONENTS[data.templateId]
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const available = el.clientWidth
      setScale(Math.min(1, available / A4_WIDTH_PX))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="w-full">
      {/* On-screen preview — scaled with CSS transform (visual only, never printed/captured) */}
      <div
        className="no-print mx-auto overflow-hidden"
        style={{ height: `${A4_HEIGHT_PX * scale}px`, width: A4_WIDTH_PX * scale }}
        aria-hidden
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: A4_WIDTH_PX,
          }}
        >
          <Template data={data} />
        </div>
      </div>

      {/*
        Full-size, un-transformed source used for PRINT and html2canvas export.
        Kept at real A4 dimensions and painted behind the app (z-index below the
        opaque page background) so it's invisible on screen but fully rendered —
        html2canvas needs real geometry, and print CSS reveals it.
      */}
      <div id="print-root" ref={ref} className="print-source">
        <Template data={data} />
      </div>
    </div>
  )
})

export default PreviewPane
