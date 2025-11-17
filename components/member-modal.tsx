"use client"

import Image from "next/image"
import Link from "next/link"
import type { FamilyMember } from "@/data/family-data"
import { formatDate, getAge, getYearsMarried } from "@/lib/date-utils"
import { X, ExternalLink, Heart } from "lucide-react"
import { useEffect } from "react"

interface MemberModalProps {
  member: FamilyMember | null
  onClose: () => void
}

export function MemberModal({ member, onClose }: MemberModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (member) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [member, onClose])

  if (!member) return null

  const age = getAge(member.birthDate)
  const yearsMarried = getYearsMarried(member.anniversaryDate)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-lg animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Image Section */}
          <div className="flex flex-col items-center gap-4 md:w-1/3">
            <div className="relative h-48 w-48 overflow-hidden rounded-lg border-2 border-primary">
              <Image src={member.image ? member.image : member.gender === "female" ? "/female_avatar.png" : "/male_avatar.png"} alt={member.name} fill className="object-cover" />
            </div>

            {member.spouse && (
              <div className="w-full">
                <p className="mb-2 text-center text-sm font-semibold text-muted-foreground">Spouse</p>
                <div className="relative h-32 w-32 mx-auto overflow-hidden rounded-lg border border-border">
                  <Image
                    src={member.spouse.image ? member.spouse.image : member.spouse.gender === "female" ? "/female_avatar.png" : "/male_avatar.png"}
                    alt={member.spouse.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-4 md:w-2/3">
            <div>
              <h2 className="text-3xl font-bold text-foreground">{member.name}</h2>
              <p className="text-muted-foreground">
                {typeof age === "number" ? `${age} years old` : age}
              </p>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Birth Date</p>
                <p className="text-foreground">{formatDate(member.birthDate)}</p>
              </div>

              {member.spouse && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Spouse
                    </p>
                    <p className="text-foreground">{member.spouse.name}</p>
                    <p className="text-xs text-muted-foreground">Born: {formatDate(member.spouse.birthDate)}</p>
                  </div>

                  {member.anniversaryDate && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Anniversary</p>
                      <p className="text-foreground">{formatDate(member.anniversaryDate)}</p>
                      <p className="text-xs text-muted-foreground">
                        Married for {typeof yearsMarried === "number" ? `${yearsMarried} years` : yearsMarried}
                      </p>
                    </div>
                  )}
                </>
              )}

              {member.notes && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Notes</p>
                  <p className="text-foreground">{member.notes}</p>
                </div>
              )}
            </div>

            {member.children && member.children.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Children ({member.children.length})</p>
                <div className="space-y-2">
                  {member.children.map((child) => (
                    <p key={child.id} className="text-sm text-foreground">
                      {child.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Full Profile <span className="text-xs text-muted-foreground">(Coming Soon)</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
