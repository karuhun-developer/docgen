import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Render the A4 document node to a downloadable PDF (fully local, no network).
 * Uses html2canvas to rasterize then places it on an A4 jsPDF page.
 *
 * The node normally lives off-screen (left: -10000px). html2canvas is unreliable
 * capturing off-screen nodes, so we briefly pin it on-screen (behind everything
 * else, top-left) for the capture and restore it afterwards.
 */
export async function downloadPdf(node: HTMLElement, filename: string) {
  const prev = {
    left: node.style.left,
    top: node.style.top,
    zIndex: node.style.zIndex,
    visibility: node.style.visibility,
  }

  // Bring the source on-screen at 0,0 but hidden under the app (negative z-index)
  node.style.left = '0'
  node.style.top = '0'
  node.style.zIndex = '-9999'
  node.style.visibility = 'visible'
  window.scrollTo(0, 0)

  try {
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    })

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()

    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width
    const img = canvas.toDataURL('image/png')

    if (imgH <= pageH + 1) {
      pdf.addImage(img, 'PNG', 0, 0, imgW, imgH)
    } else {
      // Split tall documents across multiple A4 pages
      let remaining = imgH
      let position = 0
      while (remaining > 0) {
        pdf.addImage(img, 'PNG', 0, position, imgW, imgH)
        remaining -= pageH
        if (remaining > 0) {
          pdf.addPage()
          position -= pageH
        }
      }
    }

    pdf.save(filename)
  } finally {
    node.style.left = prev.left
    node.style.top = prev.top
    node.style.zIndex = prev.zIndex
    node.style.visibility = prev.visibility
  }
}
