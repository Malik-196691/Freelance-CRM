"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash, Download, Mail, CheckCircle } from "lucide-react"
import { InvoiceDialog } from "@/components/invoices/invoice-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteInvoice, updateInvoiceStatus } from "@/app/dashboard/invoices/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Invoice {
  id: string
  total: number
  tax: number
  discount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  created_at: string
  clients: { name: string }
  projects?: { name: string }
}

const invoiceStatusStyles = {
  draft: "bg-gray-500/15 text-gray-600 dark:text-gray-400 hover:bg-gray-500/25 border-gray-500/20",
  sent: "bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-blue-500/20",
  paid: "bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25 border-green-500/20",
  overdue: "bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border-red-500/20",
}

export function InvoiceList({ invoices, clients, projects }: { invoices: Invoice[], clients: any[], projects: any[] }) {
  const router = useRouter()
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [recipientEmail, setRecipientEmail] = useState("")

  const handleDelete = async (id: string) => {
    await deleteInvoice(id)
    router.refresh()
  }

  const handleDownloadPDF = async (id: string) => {
    window.open(`/api/invoices/${id}/pdf`, '_blank')
  }

  const handleSendEmail = async () => {
    if (!selectedInvoice || !recipientEmail) return

    setSendingId(selectedInvoice.id)
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipientEmail }),
      })

      if (response.ok) {
        setEmailDialogOpen(false)
        setRecipientEmail("")
        router.refresh()
      } else {
        alert('Failed to send email')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to send email')
    } finally {
      setSendingId(null)
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    await updateInvoiceStatus(id, 'paid')
    router.refresh()
  }

  return (
    <>
      <div className="rounded-xl border glass-strong shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id} className="group transition-colors hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">
                    #{invoice.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium">{invoice.clients?.name || "-"}</TableCell>
                  <TableCell>{invoice.projects?.name || "-"}</TableCell>
                  <TableCell className="font-semibold">${invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={invoiceStatusStyles[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(invoice.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setRecipientEmail(invoice.clients?.name || "")
                            setEmailDialogOpen(true)
                          }}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <InvoiceDialog invoice={invoice} clients={clients} projects={projects}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </InvoiceDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(invoice.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogDescription>
              Enter the recipient's email address to send the invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Email</label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={!recipientEmail || !!sendingId}>
              {sendingId ? "Sending..." : "Send Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
