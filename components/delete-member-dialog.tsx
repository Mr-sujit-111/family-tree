"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";

interface DeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  isSpouse?: boolean;
  onSuccess?: () => void;
}

export function DeleteMemberDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
  isSpouse = false,
  onSuccess,
}: DeleteMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSpouse) {
        // Remove spouse by setting it to null
        const response = await apiClient.updateMember(memberId, {
          spouse: null,
        });

        if (response.data) {
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError(
            typeof response.error === "string"
              ? response.error
              : "Failed to remove spouse"
          );
        }
      } else {
        // Delete the member
        const response = await apiClient.deleteMember(memberId);

        if (response.data !== undefined || !response.error) {
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError(
            typeof response.error === "string"
              ? response.error
              : "Failed to delete member"
          );
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSpouse ? "Remove Spouse" : "Delete Family Member"}
          </DialogTitle>
          <DialogDescription>
            {isSpouse ? (
              <>
                Are you sure you want to remove <strong>{memberName}</strong> as
                spouse? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{memberName}</strong>?
                This action cannot be undone and will also remove all
                relationships associated with this member.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading
              ? isSpouse
                ? "Removing..."
                : "Deleting..."
              : isSpouse
              ? "Remove Spouse"
              : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
