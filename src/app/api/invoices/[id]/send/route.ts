import { NextRequest, NextResponse } from 'next/server'
import { getInvoice, updateInvoiceStatus } from '@/app/dashboard/invoices/actions'
import { generateInvoicePDF } from '@/lib/pdf-generator'
import { Resend } from 'resend'

// Initialize Resend only if API key is available
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
    }

    const invoice = await getInvoice(id)
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Generate PDF
    const pdfBytes = await generateInvoicePDF(invoice)
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')

    // Send email
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `Invoice #${id.slice(0, 8).toUpperCase()}`,
      html: `
        <h2>Invoice from Freelance CRM</h2>
        <p>Dear ${invoice.clients.name},</p>
        <p>Please find attached your invoice.</p>
        <p><strong>Total Amount: $${invoice.total.toFixed(2)}</strong></p>
        ${invoice.projects ? `<p>Project: ${invoice.projects.name}</p>` : ''}
        <p>Thank you for your business!</p>
      `,
      attachments: [
        {
          filename: `invoice-${id.slice(0, 8)}.pdf`,
          content: pdfBase64,
        },
      ],
    })

    if (error) {
      console.error('Email send error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // Update invoice status to 'sent'
    await updateInvoiceStatus(id, 'sent')

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Send invoice error:', error)
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 })
  }
}
