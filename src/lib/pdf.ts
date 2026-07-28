import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Render the A4 document node to a downloadable PDF (fully local, no network).
 * Uses html2canvas to rasterize then places it on an A4 jsPDF page.
 */
export async function downloadPdf(node: HTMLElement, filename: string) {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  const imgW = pageW
  const imgH = (canvas.height * imgW) / canvas.width
  const img = canvas.toDataURL('image/png')

  if (imgH <= pageH) {
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
}
