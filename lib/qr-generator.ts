import { toPng } from 'html-to-image'

export interface QRCodeOptions {
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  includeMargin?: boolean
  bgColor?: string
  fgColor?: string
}

export async function generateTableQR(
  tableId: string, 
  branchId: string, 
  baseUrl: string,
  options: QRCodeOptions = {}
) {
  const {
    size = 256,
    level = 'M',
    includeMargin = true,
    bgColor = '#ffffff',
    fgColor = '#000000',
  } = options

  const url = `${baseUrl}/table/${tableId}?branch=${branchId}`
  
  // Create QR code using browser API or external library
  // For production, consider using a server-side QR generator
  const qrContainer = document.createElement('div')
  qrContainer.style.width = `${size}px`
  qrContainer.style.height = `${size}px`
  qrContainer.style.backgroundColor = bgColor
  
  // Simple QR placeholder - replace with actual QR library
  qrContainer.innerHTML = `
    <div style="
      width: 100%; 
      height: 100%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      background: ${bgColor};
      color: ${fgColor};
      font-family: monospace;
      font-size: 10px;
      text-align: center;
      padding: 8px;
      word-break: break-all;
    ">
      ${url}
    </div>
  `
  
  // Convert to PNG for download/print
  try {
    const dataUrl = await toPng(qrContainer, { 
      backgroundColor: bgColor,
      quality: 1.0,
    })
    return { url, dataUrl, element: qrContainer }
  } catch (error) {
    console.error('QR generation failed:', error)
    return { url, dataUrl: null, element: qrContainer }
  }
}

export async function downloadQR(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = dataUrl
  link.click()
}

export function printQR(element: HTMLElement) {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Code</title>
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}