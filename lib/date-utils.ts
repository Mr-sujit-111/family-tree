export function formatDate(dateString?: string | null): string {
  if (!dateString) {
    return "Unknown"
  }
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return "Unknown"
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function getAge(birthDateString?: string | null): number | string {
  if (!birthDateString) {
    return "Unknown";
  }
  const birthDate = new Date(birthDateString)
  if (isNaN(birthDate.getTime())) {
    return "Unknown"
  }
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function getYearsMarried(anniversaryDateString?: string | null): number | string {
  if (!anniversaryDateString) {
    return "Unknown"
  }
  const anniversaryDate = new Date(anniversaryDateString)
  if (isNaN(anniversaryDate.getTime())) {
    return "Unknown"
  }
  const today = new Date()
  let years = today.getFullYear() - anniversaryDate.getFullYear()
  const monthDiff = today.getMonth() - anniversaryDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < anniversaryDate.getDate())) {
    years--
  }

  return years
}

export function isTodayBirthday(birthDateString?: string): boolean {
  if (!birthDateString) return false
  const birthDate = new Date(birthDateString)
  const today = new Date()
  return birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate()
}

export function isTodayAnniversary(anniversaryDateString?: string): boolean {
  if (!anniversaryDateString) return false
  const anniversaryDate = new Date(anniversaryDateString)
  const today = new Date()
  return anniversaryDate.getMonth() === today.getMonth() && anniversaryDate.getDate() === today.getDate()
}

export function hasTodayEvent(member: {
  birthDate?: string
  anniversaryDate?: string
  spouse?: {
    birthDate?: string
  }
}): { isBirthday: boolean; isAnniversary: boolean; isSpouseBirthday: boolean } {
  return {
    isBirthday: isTodayBirthday(member.birthDate),
    isAnniversary: isTodayAnniversary(member.anniversaryDate),
    isSpouseBirthday: isTodayBirthday(member.spouse?.birthDate),
  }
}
