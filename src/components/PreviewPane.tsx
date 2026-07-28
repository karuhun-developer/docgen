import { forwardRef, useEffect, useRef, useState } from 'react'
import type { DocumentData } from '../types'
import { TEMPLATE_COMPONENTS } from '../templates'

interface Props {
  data: DocumentData
}

// A4 width in px at 96dpi ≈ 794px. We scale the fixed-size doc to fit the pane.
const A4_WIDTH_PX = 794

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
      {/* Scaled preview wrapper — height compensates for transform scale */}
      <div
        style={{
          height: scale < 1 ? `${1123 * scale}px` : undefined,
        }}
        className="mx-auto"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: A4_WIDTH_PX,
          }}
        >
          {/* #print-root is targeted by print CSS to isolate the document */}
          <div id="print-root" ref={ref}>
            <Template data={data} />
          </div>
        </div>
      </div>
    </div>
  )
})

export default PreviewPane
