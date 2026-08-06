import { NowSchema, type Now } from './schema'

export const now: Now = {
  updated: '2026-08-06',
  items: [
    { label: 'Graduated', value: 'B.S. CS + Data Science — UW–Madison, May 2026' },
    { label: 'Looking for', value: 'Full-stack / backend roles, 2026 start' },
    { label: 'Building', value: 'This site, and packaging past projects for GitHub' },
    { label: 'Based in', value: 'Madison, WI — open to relocating' },
  ],
} satisfies Now

export const nowSchema = NowSchema
