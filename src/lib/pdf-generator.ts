import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface InvoiceData {
  id: string
  created_at: string
  total: number
  tax: number
  discount: number
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  notes?: string
  clients: {
    name: string
    email: string
    company?: string
    phone?: string
  }
  projects?: {
    name: string
  }
}

export async function generateInvoicePDF(invoice: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let yPosition = height - 50

  // Header
  page.drawText('INVOICE', {
    x: 50,
    y: yPosition,
    size: 24,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  })

  page.drawText(`#${invoice.id.slice(0, 8).toUpperCase()}`, {
    x: width - 150,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })

  yPosition -= 30

  // Date
  const invoiceDate = new Date(invoice.created_at).toLocaleDateString()
  page.drawText(`Date: ${invoiceDate}`, {
    x: width - 150,
    y: yPosition,
    size: 10,
    font: font,
  })

  yPosition -= 40

  // Bill To
  page.drawText('Bill To:', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
  })

  yPosition -= 20

  page.drawText(invoice.clients.name, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
  })

  yPosition -= 15

  if (invoice.clients.company) {
    page.drawText(invoice.clients.company, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
    })
    yPosition -= 15
  }

  page.drawText(invoice.clients.email, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
  })

  yPosition -= 40

  // Project
  if (invoice.projects) {
    page.drawText(`Project: ${invoice.projects.name}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: fontBold,
    })
    yPosition -= 30
  }

  // Table Header
  const tableTop = yPosition
  page.drawRectangle({
    x: 50,
    y: tableTop - 20,
    width: width - 100,
    height: 20,
    color: rgb(0.95, 0.95, 0.95),
  })

  page.drawText('Description', { x: 60, y: tableTop - 15, size: 10, font: fontBold })
  page.drawText('Qty', { x: 350, y: tableTop - 15, size: 10, font: fontBold })
  page.drawText('Rate', { x: 400, y: tableTop - 15, size: 10, font: fontBold })
  page.drawText('Amount', { x: 480, y: tableTop - 15, size: 10, font: fontBold })

  yPosition = tableTop - 40

  // Line Items
  const items = invoice.items || []
  let subtotal = 0

  if (items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + item.amount, 0)

    items.forEach((item) => {
      page.drawText(item.description, { x: 60, y: yPosition, size: 9, font: font })
      page.drawText(item.quantity.toString(), { x: 360, y: yPosition, size: 9, font: font })
      page.drawText(`$${item.rate.toFixed(2)}`, { x: 400, y: yPosition, size: 9, font: font })
      page.drawText(`$${item.amount.toFixed(2)}`, { x: 480, y: yPosition, size: 9, font: font })
      yPosition -= 20
    })
  } else {
    // Fallback: Calculate subtotal from total if items are missing (legacy/schema issue)
    const discount = invoice.discount || 0
    const taxRate = invoice.tax || 0
    subtotal = (invoice.total + discount) / (1 + taxRate / 100)

    page.drawText('Line details not available', { x: 60, y: yPosition, size: 9, font: font, color: rgb(0.5, 0.5, 0.5) })
    yPosition -= 20
  }

  yPosition -= 20

  // Totals
  const totalsX = 400

  page.drawText('Subtotal:', { x: totalsX, y: yPosition, size: 10, font: font })
  page.drawText(`$${subtotal.toFixed(2)}`, { x: 480, y: yPosition, size: 10, font: font })
  yPosition -= 20

  if (invoice.tax > 0) {
    const taxAmount = (subtotal * invoice.tax) / 100
    page.drawText(`Tax (${invoice.tax}%):`, { x: totalsX, y: yPosition, size: 10, font: font })
    page.drawText(`$${taxAmount.toFixed(2)}`, { x: 480, y: yPosition, size: 10, font: font })
    yPosition -= 20
  }

  if (invoice.discount > 0) {
    page.drawText('Discount:', { x: totalsX, y: yPosition, size: 10, font: font })
    page.drawText(`-$${invoice.discount.toFixed(2)}`, { x: 480, y: yPosition, size: 10, font: font })
    yPosition -= 20
  }

  // Total
  page.drawRectangle({
    x: totalsX - 10,
    y: yPosition - 5,
    width: 155,
    height: 25,
    color: rgb(0.2, 0.2, 0.2),
  })

  page.drawText('TOTAL:', { x: totalsX, y: yPosition + 5, size: 12, font: fontBold, color: rgb(1, 1, 1) })
  page.drawText(`$${invoice.total.toFixed(2)}`, { x: 480, y: yPosition + 5, size: 12, font: fontBold, color: rgb(1, 1, 1) })

  // Notes
  if (invoice.notes) {
    yPosition -= 60
    page.drawText('Notes:', { x: 50, y: yPosition, size: 10, font: fontBold })
    yPosition -= 15
    page.drawText(invoice.notes, { x: 50, y: yPosition, size: 9, font: font, maxWidth: width - 100 })
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
