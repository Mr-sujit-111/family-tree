"use client";

import { useState, useEffect, useRef } from "react";
import type { FamilyMember } from "@/data/family-data";
import { TreeNode } from "./tree-node";
import { MemberModal } from "./member-modal";
import { AddMemberDialog } from "./add-member-dialog";
import { EditMemberDialog } from "./edit-member-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";
import { MemberSelectionDialog } from "./member-selection-dialog";
import { apiClient } from "@/lib/api";
import { saveTreeState, loadTreeState } from "@/lib/tree-state";

interface FamilyTreeViewProps {
  rootMember: FamilyMember;
  onTreeUpdate?: () => void;
}

export function FamilyTreeView({ rootMember, onTreeUpdate }: FamilyTreeViewProps) {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [memberToAdd, setMemberToAdd] = useState<FamilyMember | null>(null);
  const [relationType, setRelationType] = useState<"child" | "parent" | "sibling" | "spouse">("child");
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(
    null
  );
  const [memberEditData, setMemberEditData] = useState<any>(null);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [selectionAction, setSelectionAction] = useState<"edit" | "delete">(
    "edit"
  );
  const [selectedMemberForAction, setSelectedMemberForAction] =
    useState<FamilyMember | null>(null);
  const [isEditingSpouse, setIsEditingSpouse] = useState(false);
  const [scale, setScale] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set([String(rootMember.id)])
  );
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const lastDistanceRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load tree state from localStorage on mount or when rootMember changes
  useEffect(() => {
    const savedState = loadTreeState();
    if (savedState) {
      // Restore zoom level
      setScale(savedState.zoomLevel || 1);
      // Restore expanded nodes, ensuring root is always expanded
      const expandedSet = new Set(savedState.expandedNodes || []);
      expandedSet.add(String(rootMember.id)); // Always include root
      setExpandedNodes(expandedSet);
    } else {
      // If no saved state, ensure root is expanded
      setExpandedNodes(new Set([String(rootMember.id)]));
    }
    setIsInitialized(true);
  }, [rootMember.id]);

  // Save tree state whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveTreeState({
        expandedNodes: Array.from(expandedNodes),
        zoomLevel: scale,
      });
    }
  }, [expandedNodes, scale, isInitialized]);

  // Auto-expand parent node when a child is added
  useEffect(() => {
    if (isInitialized) {
      const parentIdToExpand = sessionStorage.getItem("expand_parent_after_add");
      if (parentIdToExpand) {
        // Add parent to expanded nodes
        setExpandedNodes((prev) => {
          const newSet = new Set(prev);
          newSet.add(parentIdToExpand);
          return newSet;
        });
        // Clear the flag
        sessionStorage.removeItem("expand_parent_after_add");
      }
    }
  }, [isInitialized]);

  const handleZoomIn = () => {
    setScale((prev) => {
      const newScale = Math.min(prev + 0.2, 2);
      return newScale;
    });
  };
  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.2, 0.5);
      return newScale;
    });
  };
  const handleResetZoom = () => setScale(1);

  // Pinch-to-zoom support
  useEffect(() => {
    const container = treeContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        lastDistanceRef.current = distance;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastDistanceRef.current !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scaleChange = distance / lastDistanceRef.current;
        setScale((prev) => {
          const newScale = prev * scaleChange;
          return Math.max(0.5, Math.min(3, newScale));
        });
        lastDistanceRef.current = distance;
      }
    };

    const handleTouchEnd = () => {
      lastDistanceRef.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleToggleExpand = (member: FamilyMember) => {
    const memberId = String(member.id);
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const handleView = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  const isNodeExpanded = (member: FamilyMember): boolean => {
    return expandedNodes.has(String(member.id));
  };

  const handleAddRelative = (member: FamilyMember) => {
    setMemberToAdd(member);
    setRelationType("child"); // Default to child
  };

  const handleAddParent = (member: FamilyMember) => {
    setMemberToAdd(member);
    setRelationType("parent");
  };

  const handleAddChild = (member: FamilyMember) => {
    setMemberToAdd(member);
    setRelationType("child");
  };

  const handleAddSpouse = (member: FamilyMember) => {
    setMemberToAdd(member);
    setRelationType("spouse");
  };

  const handleEdit = async (member: FamilyMember) => {
    // If couple, show selection dialog
    if (member.spouse) {
      setSelectedMemberForAction(member);
      setSelectionAction("edit");
      setShowMemberSelection(true);
    } else {
      // Single member - proceed directly
      try {
        const response = await apiClient.getMemberById(String(member.id));
        if (response.data) {
          setMemberEditData(response.data);
          setMemberToEdit(member);
        } else {
          console.error("Failed to fetch member data:", response.error);
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    }
  };

  const handleDelete = (member: FamilyMember) => {
    // If couple, show selection dialog
    if (member.spouse) {
      setSelectedMemberForAction(member);
      setSelectionAction("delete");
      setShowMemberSelection(true);
    } else {
      // Single member - proceed directly
      setMemberToDelete(member);
    }
  };

  const handleMemberSelected = async (memberId: string, isSpouse: boolean) => {
    if (!selectedMemberForAction) return;

    if (selectionAction === "edit") {
      try {
        // Fetch member data
        const response = await apiClient.getMemberById(String(selectedMemberForAction.id));
        if (response.data) {
          setMemberEditData(response.data);
          setIsEditingSpouse(isSpouse);
          setMemberToEdit({
            ...selectedMemberForAction,
            id: selectedMemberForAction.id,
            name:
              isSpouse && selectedMemberForAction.spouse
                ? selectedMemberForAction.spouse.name
                : selectedMemberForAction.name,
          });
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    } else {
      // Delete action
      if (isSpouse && selectedMemberForAction.spouse) {
        // For spouse deletion, show confirmation dialog
        setMemberToDelete({
          id: selectedMemberForAction.id,
          name: selectedMemberForAction.spouse.name,
          isSpouse: true,
        } as FamilyMember & { isSpouse?: boolean });
      } else {
        // Delete the member itself
        setMemberToDelete({
          id: selectedMemberForAction.id,
          name: selectedMemberForAction.name,
        } as FamilyMember);
      }
    }
  };

  const handleSuccess = () => {
    // Trigger tree update callback if provided, otherwise reload
    if (onTreeUpdate) {
      onTreeUpdate();
    } else {
      // Fallback to reload if no callback provided
      window.location.reload();
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Mobile Floating Zoom Controls */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:hidden">
        <button
          onClick={handleZoomIn}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all touch-manipulation flex items-center justify-center text-lg font-semibold"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="h-12 w-12 rounded-full bg-card border-2 border-border text-foreground shadow-lg hover:bg-muted active:scale-95 transition-all touch-manipulation flex items-center justify-center text-lg font-semibold"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={handleResetZoom}
          className="h-10 w-12 rounded-lg bg-card border-2 border-border text-foreground shadow-lg hover:bg-muted active:scale-95 transition-all touch-manipulation flex items-center justify-center text-xs font-medium"
          aria-label="Reset zoom"
        >
          {Math.round(scale * 100)}%
        </button>
      </div>

      {/* Desktop Controls - Floating */}
      <div className="hidden sm:flex fixed top-20 right-4 z-50 items-center gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
        <button
          onClick={handleZoomOut}
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted active:scale-95 transition-all text-sm font-medium touch-manipulation min-w-[44px]"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted active:scale-95 transition-all text-sm font-medium touch-manipulation min-w-[44px]"
          aria-label="Zoom in"
        >
          +
        </button>
        <div className="h-6 w-px bg-border mx-1" />
        <button
          onClick={handleResetZoom}
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted active:scale-95 transition-all text-xs font-medium touch-manipulation"
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>

      {/* Tree Container - Full Page Canvas */}
      <div
        ref={treeContainerRef}
        className="absolute inset-0 overflow-auto select-none tree-canvas"
        style={{ 
          touchAction: "pan-x pan-y pinch-zoom",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain"
        }}
      >
        <div
          className="flex justify-center items-start transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            width: "max-content",
            minHeight: `${100 / scale}%`,
            minWidth: "100%",
            // Account for sticky header height - responsive padding that scales with zoom
            paddingTop: scale > 1 
              ? `${90 / scale}px` 
              : `calc(${90 / scale}px + ${2 / scale}rem)`,
            paddingBottom: scale > 1 ? "0" : `${2 / scale}rem`,
            paddingLeft: "0",
            paddingRight: "0",
          }}
        >
          <div className="flex justify-center" style={{ minWidth: "fit-content", width: "max-content" }}>
            <TreeNode
              member={rootMember}
              hasParent={false}
              onToggleExpand={handleToggleExpand}
              onView={handleView}
              onAddRelative={handleAddRelative}
              onAddParent={handleAddParent}
              onAddChild={handleAddChild}
              onAddSpouse={handleAddSpouse}
              onEdit={handleEdit}
              onDelete={handleDelete}
              level={0}
              isNodeExpanded={isNodeExpanded}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
      <AddMemberDialog
        open={memberToAdd !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToAdd(null);
            setRelationType("child");
          }
        }}
        targetMemberId={memberToAdd?.id ? String(memberToAdd.id) : undefined}
        targetMemberGender={memberToAdd?.gender as "male" | "female" | undefined}
        relationType={relationType}
        onSuccess={handleSuccess}
      />
      <EditMemberDialog
        open={memberToEdit !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToEdit(null);
            setMemberEditData(null);
            setIsEditingSpouse(false);
          }
        }}
        memberId={memberToEdit?.id ? String(memberToEdit.id) : ""}
        isEditingSpouse={isEditingSpouse}
        memberData={memberEditData}
        onSuccess={handleSuccess}
      />
      <DeleteMemberDialog
        open={memberToDelete !== null}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
        memberId={memberToDelete?.id ? String(memberToDelete.id) : ""}
        memberName={memberToDelete?.name || "this member"}
        isSpouse={(memberToDelete as any)?.isSpouse || false}
        onSuccess={handleSuccess}
      />
      <MemberSelectionDialog
        open={showMemberSelection}
        onOpenChange={(open) => {
          setShowMemberSelection(open);
          if (!open) {
            setSelectedMemberForAction(null);
          }
        }}
        member={{
          id: selectedMemberForAction?.id || "",
          name: selectedMemberForAction?.name || "",
          image: selectedMemberForAction?.image,
          gender: selectedMemberForAction?.gender,
        }}
        spouse={
          selectedMemberForAction?.spouse
            ? {
                id: String(selectedMemberForAction.id), // Use member ID since spouse is embedded
                name: selectedMemberForAction.spouse.name,
                image: selectedMemberForAction.spouse.image,
                gender: selectedMemberForAction.spouse.gender,
              }
            : undefined
        }
        action={selectionAction}
        onSelect={handleMemberSelected}
      />
    </div>
  );
}
