export interface Schedule {
  id: number
  student_id?: number
  course_id: number
  academic_year?: string
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  courseCode?: string
  courseName?: string
  color?: string
}
