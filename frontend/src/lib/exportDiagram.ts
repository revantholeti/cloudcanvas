import { toPng, toSvg } from 'html-to-image'
import jsPDF from 'jspdf'

function getFlowElement(): HTMLElement | null {
  return document.querySelector('.react-flow__viewport') as HTMLElement
}

export async function exportPng(filename = 'diagram'): Promise<void> {
  const el = getFlowElement()
  if (!el) return
  const dataUrl = await toPng(el, { backgroundColor: '#0f1117', pixelRatio: 2 })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${filename}.png`
  a.click()
}

export async function exportSvg(filename = 'diagram'): Promise<void> {
  const el = getFlowElement()
  if (!el) return
  const dataUrl = await toSvg(el, { backgroundColor: '#0f1117' })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${filename}.svg`
  a.click()
}

export async function exportPdf(filename = 'diagram'): Promise<void> {
  const el = getFlowElement()
  if (!el) return
  const dataUrl = await toPng(el, { backgroundColor: '#0f1117', pixelRatio: 2 })
  const img = new Image()
  img.src = dataUrl
  await new Promise((resolve) => { img.onload = resolve })
  const pdf = new jsPDF({ orientation: img.width > img.height ? 'landscape' : 'portrait', unit: 'px', format: [img.width, img.height] })
  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height)
  pdf.save(`${filename}.pdf`)
}
