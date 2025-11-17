"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface MemberSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id: string | number;
    name: string;
    image?: string;
    gender?: string;
  };
  spouse?: {
    id: string | number;
    name: string;
    image?: string;
    gender?: string;
  };
  action: "edit" | "delete";
  onSelect: (memberId: string, isSpouse: boolean) => void;
}

export function MemberSelectionDialog({
  open,
  onOpenChange,
  member,
  spouse,
  action,
  onSelect,
}: MemberSelectionDialogProps) {
  const getPlaceholderImage = (gender?: string) => {
    if (gender === "female") return "/female_avatar.png";
    return "/male_avatar.png";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === "edit" ? "Edit Member" : "Delete Member"}
          </DialogTitle>
          <DialogDescription>
            Select which member you want to {action}:
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 py-4">
          {/* Main Member */}
          <button
            onClick={() => {
              onSelect(String(member.id), false);
              onOpenChange(false);
            }}
            className="flex flex-col items-center gap-3 flex-1 p-4 rounded-lg border-2 border-border hover:border-primary transition-all"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary">
              <Image
                src={
                  member.image ||
                  getPlaceholderImage(member.gender) ||
                  "/placeholder.svg"
                }
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">{member.name}</p>
            </div>
          </button>

          {/* Spouse */}
          {spouse && (
            <button
              onClick={() => {
                onSelect(String(spouse.id), true);
                onOpenChange(false);
              }}
              className="flex flex-col items-center gap-3 flex-1 p-4 rounded-lg border-2 border-border hover:border-primary transition-all"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary">
                <Image
                  src={
                    spouse.image ||
                    getPlaceholderImage(spouse.gender) ||
                    "/placeholder.svg"
                  }
                  alt={spouse.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">{spouse.name}</p>
              </div>
            </button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
