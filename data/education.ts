import { EducationSchema, type Education } from './schema'
import { z } from 'zod'

export const education: Education[] = [
  {
    id: 'uw-madison',
    institution: 'University of Wisconsin–Madison',
    credential: 'Bachelor of Science, Computer Science & Data Science',
    detail: 'GPA: 3.74',
    location: 'Madison, WI',
    start: '2022-09',
    end: '2026-05',
  },
  {
    id: 'dps-dwarka',
    institution: 'Delhi Public School, Dwarka',
    location: 'New Delhi, India',
    start: '2018',
    end: '2022',
  },
] satisfies Education[]

export const educationSchema = z.array(EducationSchema)
