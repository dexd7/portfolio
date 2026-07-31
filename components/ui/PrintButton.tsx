'use client'

import { Button } from './Button'

export function PrintButton() {
  return (
    <Button variant="ghost" onClick={() => window.print()}>
      Print / Save as PDF
    </Button>
  )
}
