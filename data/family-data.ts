export interface FamilyMember {
  id: number | string
  name: string
  image: string
  birthDate: string
  anniversaryDate?: string
  notes: string
  gender?: string
  is_deceased?: boolean
  passed_away_date?: string
  spouse?: {
    name: string
    image: string
    birthDate: string
    gender?: string
    is_deceased?: boolean
    passed_away_date?: string
  }
  children?: FamilyMember[]
}
