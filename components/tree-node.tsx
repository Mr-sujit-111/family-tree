"use client";

import { useState, useEffect } from "react";
import type { FamilyMember } from "@/data/family-data";
import { MemberCard } from "./member-card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TreeNodeProps {
  member: FamilyMember;
  hasParent?: boolean;
  onMemberClick?: (member: FamilyMember) => void;
  onToggleExpand?: (member: FamilyMember) => void;
  onView?: (member: FamilyMember) => void;
  onAddRelative?: (member: FamilyMember) => void;
  onAddParent?: (member: FamilyMember) => void;
  onAddChild?: (member: FamilyMember) => void;
  onAddSpouse?: (member: FamilyMember) => void;
  onEdit?: (member: FamilyMember) => void;
  onDelete?: (member: FamilyMember) => void;
  level: number;
  isExpanded?: boolean;
  isNodeExpanded?: (member: FamilyMember) => boolean;
}

export function TreeNode({
  member,
  hasParent,
  onMemberClick,
  onToggleExpand,
  onView,
  onAddRelative,
  onAddParent,
  onAddChild,
  onAddSpouse,
  onEdit,
  onDelete,
  level,
  isExpanded: controlledExpanded,
  isNodeExpanded: checkExpanded,
}: TreeNodeProps) {
  const hasChildren = member.children && member.children.length > 0;
  const memberId = String(member.id);
  const storageKey = `tree_node_${memberId}_expanded`;

  // Use controlled state if provided, otherwise use local state
  // Always initialize with true to avoid hydration mismatch
  const [localExpanded, setLocalExpanded] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from sessionStorage only on client after mount
  useEffect(() => {
    setIsHydrated(true);
    if (controlledExpanded === undefined) {
      const stored = sessionStorage.getItem(storageKey);
      if (stored !== null) {
        setLocalExpanded(stored === "true");
      }
    }
  }, [storageKey, controlledExpanded]);

  // Save to sessionStorage when localExpanded changes
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined" && controlledExpanded === undefined) {
      sessionStorage.setItem(storageKey, String(localExpanded));
    }
  }, [localExpanded, storageKey, controlledExpanded, isHydrated]);

  // Determine if expanded: use checkExpanded function if provided, then controlledExpanded, then local state
  const isExpanded = checkExpanded 
    ? checkExpanded(member)
    : controlledExpanded !== undefined 
    ? controlledExpanded 
    : localExpanded;

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(member);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  const handleAddRelative = () => {
    if (onAddRelative) {
      onAddRelative(member);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(member);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(member);
    }
  };

  console.log(JSON.stringify(member));
  

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6 lg:gap-8" style={{ minWidth: 0, width: "auto" }}>
      {/* Current Member */}
      <div className="flex items-center gap-2 sm:gap-3" style={{ minWidth: 0 }}>
        <MemberCard
          member={member}
          onClick={hasChildren ? toggleExpand : undefined}
          hasParent={hasParent}
          onView={onView ? () => onView(member) : undefined}
          onAddParent={onAddParent ? () => onAddParent(member) : undefined}
          onAddChild={onAddChild ? () => onAddChild(member) : undefined}
          onAddSpouse={onAddSpouse ? () => onAddSpouse(member) : undefined}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isClickable={hasChildren || !!onView}
          className="pb-2"
        />

        {/* Expand/Collapse Indicator - Only show if has children and card click handles it */}
        {hasChildren && (
          <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0 touch-manipulation cursor-pointer hover:bg-muted/50 rounded-full transition-colors">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Children Section */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center gap-5 sm:gap-6" style={{ width: "100%", minWidth: 0 }}>
          {/* Connector Line */}
          <div className="h-5 sm:h-6 w-0.5 sm:w-1 bg-primary/40" />

          <div className="relative" style={{ width: "100%", overflow: "visible", minWidth: 0 }}>
            <div 
              className="flex items-start gap-5 sm:gap-6 lg:gap-8 overflow-x-auto overflow-y-visible pb-4 tree-node-children-scroll snap-x snap-mandatory" 
              style={{ 
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x pan-y",
                scrollPaddingLeft: "0",
                scrollPaddingRight: "0",
                paddingLeft: "0",
                paddingRight: "0",
                width: "100%",
                minWidth: 0,
                display: "flex",
                flexWrap: "nowrap"
              }}
            >
              {member.children!.map((child, index) => (
                <div
                  key={child.id}
                  className="flex flex-col items-center shrink-0 snap-center"
                  style={{
                    scrollSnapAlign: "center",
                    flexShrink: 0,
                    flexGrow: 0,
                    flexBasis: "auto"
                  }}
                >
                  {/* Child Tree */}
                  <TreeNode
                    member={child}
                    hasParent={true}
                    onMemberClick={onMemberClick}
                    onToggleExpand={onToggleExpand}
                    onView={onView}
                    onAddRelative={onAddRelative}
                    onAddParent={onAddParent}
                    onAddChild={onAddChild}
                    onAddSpouse={onAddSpouse}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    level={level + 1}
                    isNodeExpanded={checkExpanded}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
