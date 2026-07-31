import { NowSchema, type Now } from './schema'

export const now: Now = {
  updated: '2026-07-30',
  items: [
    { label: 'Studying', value: 'CS + Data Science, senior year — UW–Madison' },
    { label: 'Looking for', value: 'Full-stack / backend roles, 2026 start' },
    { label: 'Building', value: 'This site, and packaging past projects for GitHub' },
    { label: 'Based in', value: 'Madison, WI — open to relocating' },
  ],
} satisfies Now

export const nowSchema = NowSchema
