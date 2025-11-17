"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddMemberDialog } from "./add-member-dialog";

interface EmptyTreeViewProps {
  onAddFirstMember: () => void;
}

export function EmptyTreeView({ onAddFirstMember }: EmptyTreeViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-6">
          {/* Card-shaped container with + button */}
          <div className="relative w-[220px] h-[280px] rounded-xl border-2 border-dashed border-border bg-card/50 flex items-center justify-center hover:border-primary transition-colors">
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex flex-col items-center gap-4 p-8 w-full h-full hover:bg-muted/50 rounded-xl transition-colors"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg text-foreground mb-1">
                  Start Your Family Tree
                </p>
                <p className="text-sm text-muted-foreground">
                  Add your first family member
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        targetMemberId=""
        relationType="child"
        onSuccess={onAddFirstMember}
      />
    </>
  );
}

