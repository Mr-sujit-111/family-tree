"use client";

import type React from "react";

import Image from "next/image";
import type { FamilyMember } from "@/data/family-data";
import { Plus, Edit2, Trash2, Gift, Heart, Eye, MoreVertical, ArrowUp, ArrowDown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasTodayEvent } from "@/lib/date-utils";
import { ConfettiEffect } from "./confetti-effect";

interface MemberCardProps {
  member: FamilyMember;
  onClick?: () => void;
  onView?: () => void;
  onAddParent?: () => void;
  onAddChild?: () => void;
  onAddSpouse?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isClickable?: boolean;
  hasParent?: boolean;
  className?: string;
  addParentPos?: "top" | "bottom" | "left" | "right";
  addChildPos?: "top" | "bottom" | "left" | "right";
}

export function MemberCard({
  member,
  onClick,
  onView,
  onAddParent,
  onAddChild,
  onAddSpouse,
  onEdit,
  onDelete,
  isClickable = true,
  hasParent = true,
  className = "",
  addParentPos = "top",
  addChildPos = "bottom",
}: MemberCardProps) {
  console.log(member?.name, " - ", JSON.stringify(member));
  const handleAddParentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddParent) {
      onAddParent();
    }
  };

  const handleAddChildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddChild) {
      onAddChild();
    }
  };

  const handleAddSpouseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddSpouse) {
      onAddSpouse();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView();
    }
  };

  // Get gender-based placeholder image
  const getPlaceholderImage = (gender?: string) => {
    if (gender === "female") {
      return "/female_avatar.png";
    }
    return "/male_avatar.png";
  };

  const memberImage =
    member.image || getPlaceholderImage(member.gender) || "/placeholder.svg";
  const spouseImage = member.spouse
    ? member.spouse.image ||
    getPlaceholderImage(member.spouse.gender) ||
    "/placeholder.svg"
    : "/placeholder.svg";

  // Determine deceased status
  const memberDeceased = member.is_deceased || false;
  const spouseDeceased = member.spouse?.is_deceased || false;
  const bothDeceased = memberDeceased && spouseDeceased;
  const oneDeceased = (memberDeceased || spouseDeceased) && !bothDeceased;

  // Check for birthday/anniversary events
  const events = hasTodayEvent({
    birthDate: member.birthDate,
    anniversaryDate: member.anniversaryDate,
    spouse: member.spouse ? { birthDate: member.spouse.birthDate } : undefined,
  });
  const hasEvent =
    events.isBirthday || events.isAnniversary || events.isSpouseBirthday;

  return (
    <>
      {/* Continuous Confetti for events */}
      {hasEvent && (
        <ConfettiEffect
          trigger={true}
          continuous={false}
          memberId={String(member.id)}
        />
      )}

      <div
        className={`relative flex flex-col rounded-lg sm:rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-300 min-w-[150px] w-[150px] sm:min-w-[170px] sm:w-[170px] md:min-w-[200px] md:w-[200px] lg:min-w-[240px] lg:w-[240px] overflow-visible select-none touch-manipulation ${hasEvent
          ? "border-primary ring-2 sm:ring-4 ring-primary/30 bg-linear-to-br from-primary/10 via-card to-primary/10"
          : "border-border bg-card"
          } ${isClickable
            ? "cursor-pointer active:scale-[0.97] touch-manipulation"
            : ""
          } ${className}`}
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {/* Add Parent Button */}
        {onAddParent && !hasParent && (
          <Button
            variant="default"
            size="sm"
            className={`absolute h-10 w-10 sm:h-9 sm:w-9 rounded-full p-0 z-30 bg-primary hover:bg-primary/90 shadow-lg touch-manipulation active:scale-95 border-2 border-background ${addParentPos === "top" ? "-top-5 sm:-top-6 left-1/2 -translate-x-1/2" :
                addParentPos === "bottom" ? "-bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2" :
                  addParentPos === "left" ? "top-1/2 -translate-y-1/2 -left-5 sm:-left-6" :
                    "top-1/2 -translate-y-1/2 -right-5 sm:-right-6"
              }`}
            onClick={handleAddParentClick}
            title="Add Parent"
            aria-label="Add Parent"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Actions Menu - Top Right - Repositioned to avoid overlap */}
        {(onView || onAddSpouse || onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 sm:top-1 sm:right-1 h-10 w-10 sm:h-9 sm:w-9 p-0 z-20 bg-card/95 backdrop-blur-sm border border-border/50 shadow-md hover:bg-card touch-manipulation active:scale-95 rounded-full"
                onClick={(e) => e.stopPropagation()}
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {onView && (
                <DropdownMenuItem onClick={handleViewClick} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {onAddSpouse && !member.spouse && (
                <DropdownMenuItem onClick={handleAddSpouseClick} className="cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Spouse
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {/* Background Diya Pattern */}
        {/* {bothDeceased || (oneDeceased  && !member.spouse) && (
          <div className="absolute inset-0 opacity-20 bg-linear-to-br from-yellow-400/30 via-yellow-300/20 to-yellow-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,yellow_2px,transparent_2px),radial-gradient(circle_at_70%_70%,yellow_2px,transparent_2px)] bg-size-[40px_40px]"></div>
          </div>
        )}
        {member.spouse && oneDeceased && (
          <div className="absolute inset-0">
            {memberDeceased ? (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-1/2 opacity-20 bg-linear-to-br from-yellow-400/30 via-yellow-300/20 to-yellow-500/30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,yellow_2px,transparent_2px)] bg-size-[40px_40px]"></div>
                </div>
              </>
            ) : (
              <>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-linear-to-br from-yellow-400/30 via-yellow-300/20 to-yellow-500/30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,yellow_2px,transparent_2px)] bg-size-[40px_40px]"></div>
                </div>
              </>
            )}
          </div>
        )} */}

        <div
          onClick={onClick}
          className="flex flex-col items-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 lg:p-5 rounded-t-lg relative z-10 select-none"
        >
          {/* Couple Layout */}
          {member.spouse ? (
            <>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Main Member Photo */}
                <div
                  className={`relative h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 overflow-hidden rounded-full border-2 shadow-md ${memberDeceased ? "border-yellow-500/60" : "border-primary"
                    }`}
                >
                  <Image
                    src={memberImage}
                    alt={member.name}
                    fill
                    className={`object-cover ${memberDeceased ? "grayscale opacity-75" : ""
                      }`}
                  />
                  {memberDeceased && (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/20">
                      <span className="text-yellow-600 text-xl"></span>
                    </div>
                  )}
                </div>
                {/* Spouse Photo - Smaller */}
                <div
                  className={`relative h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 overflow-hidden rounded-full border-2 shadow-md ${spouseDeceased ? "border-yellow-500/60" : "border-primary"
                    }`}
                >
                  <Image
                    src={spouseImage}
                    alt={member.spouse.name}
                    fill
                    className={`object-cover ${spouseDeceased ? "grayscale opacity-75" : ""
                      }`}
                  />
                  {spouseDeceased && (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/20">
                      <span className="text-yellow-600 text-xl"></span>
                    </div>
                  )}
                </div>
              </div>
              {/* Names */}
              <div className="text-center w-full space-y-0.5 sm:space-y-1">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                  {events.isBirthday && (
                    <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-bounce" />
                  )}
                  <h3
                    className={`font-semibold text-xs sm:text-sm truncate select-none ${memberDeceased
                      ? "text-yellow-700 dark:text-yellow-500"
                      : "text-foreground"
                      }`}
                  >
                    {member.name}
                    {memberDeceased && <span className="ml-0.5 sm:ml-1">🪔</span>}
                    {events.isBirthday && (
                      <span className="ml-0.5 sm:ml-1 text-primary">🎂</span>
                    )}
                  </h3>
                </div>
                <div className="h-px bg-border my-1 sm:my-1.5"></div>
                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                  {events.isSpouseBirthday && (
                    <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-bounce" />
                  )}
                  <h3
                    className={`font-semibold text-xs sm:text-sm truncate select-none ${spouseDeceased
                      ? "text-yellow-700 dark:text-yellow-500"
                      : "text-foreground"
                      }`}
                  >
                    {member.spouse.name}
                    {spouseDeceased && <span className="ml-0.5 sm:ml-1">🪔</span>}
                    {events.isSpouseBirthday && (
                      <span className="ml-0.5 sm:ml-1 text-primary">🎂</span>
                    )}
                  </h3>
                </div>
                {events.isAnniversary && (
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 text-primary">
                    <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary" />
                    <span className="text-[10px] sm:text-xs font-semibold">Anniversary!</span>
                    <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary" />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Single Member Layout */
            <>
              <div
                className={`relative h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 overflow-hidden rounded-full border-2 shadow-md ${memberDeceased ? "border-yellow-500/60" : "border-primary"
                  }`}
              >
                <Image
                  src={memberImage}
                  alt={member.name}
                  fill
                  className={`object-cover ${memberDeceased ? "grayscale opacity-75" : ""
                    }`}
                />
                {memberDeceased && (
                  <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/20">
                    <span className="text-yellow-600 text-2xl"></span>
                  </div>
                )}
              </div>
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                  {events.isBirthday && (
                    <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-bounce" />
                  )}
                  <h3
                    className={`font-semibold text-xs sm:text-sm truncate select-none ${memberDeceased
                      ? "text-yellow-700 dark:text-yellow-500"
                      : "text-foreground"
                      }`}
                  >
                    {member.name}
                    {memberDeceased && <span className="ml-0.5 sm:ml-1">🪔</span>}
                    {events.isBirthday && (
                      <span className="ml-0.5 sm:ml-1 text-primary">🎂</span>
                    )}
                  </h3>
                </div>
                {events.isAnniversary && (
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 text-primary">
                    <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary" />
                    <span className="text-[10px] sm:text-xs font-semibold">Anniversary!</span>
                    <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Add Child Button */}
        {onAddChild && member.spouse && (
          <Button
            variant="default"
            size="sm"
            className={`absolute h-10 w-10 sm:h-9 sm:w-9 rounded-full p-0 z-30 bg-primary hover:bg-primary/90 shadow-lg touch-manipulation active:scale-95 border-2 border-background ${addChildPos === "top" ? "-top-5 sm:-top-6 left-1/2 -translate-x-1/2" :
                addChildPos === "bottom" ? "-bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2" :
                  addChildPos === "left" ? "top-1/2 -translate-y-1/2 -left-5 sm:-left-6" :
                    "top-1/2 -translate-y-1/2 -right-5 sm:-right-6"
              }`}
            onClick={handleAddChildClick}
            title="Add Child"
            aria-label="Add Child"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
}