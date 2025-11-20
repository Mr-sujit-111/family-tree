"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { FamilyMember } from '@/data/family-data';
import { MemberCard } from './member-card';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface CustomFamilyNodeData {
    member: FamilyMember;
    onView?: (member: FamilyMember) => void;
    onAddParent?: (member: FamilyMember) => void;
    onAddChild?: (member: FamilyMember) => void;
    onAddSpouse?: (member: FamilyMember) => void;
    onEdit?: (member: FamilyMember) => void;
    onDelete?: (member: FamilyMember) => void;
    hasParent?: boolean;
    direction?: 'vertical' | 'horizontal';
    // Expand/collapse functionality
    onToggleExpand?: (member: FamilyMember) => void;
    isExpanded?: boolean;
    hasChildren?: boolean;
}

export const CustomFamilyNode = memo(({ data }: NodeProps) => {
    const {
        member,
        onView,
        onAddParent,
        onAddChild,
        onAddSpouse,
        onEdit,
        onDelete,
        hasParent = true,
        direction = 'vertical',
        onToggleExpand,
        isExpanded,
        hasChildren,
    } = data as unknown as CustomFamilyNodeData;

    const isVertical = direction === 'vertical';

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleExpand) {
            onToggleExpand(member);
        }
    };

    return (
        <div
            className="custom-family-node relative group touch-manipulation"
            style={{
                pointerEvents: 'all',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
            }}
        >
            {/* Expand/Collapse Button - Responsive Design with Direction Support */}
            {hasChildren && onToggleExpand && (
                <button
                    onClick={handleToggle}
                    className={`absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center z-20 border-2 border-background touch-manipulation md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 ${isVertical
                            ? '-bottom-2.5 left-1/2 -translate-x-1/2'  // Vertical: bottom center
                            : '-right-2.5 top-1/2 -translate-y-1/2'  // Horizontal: right center
                        }`}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    title={isExpanded ? "Collapse family branch" : "Expand family branch"}
                >
                    {isExpanded ? (
                        <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${isVertical ? 'rotate-180' : 'rotate-270'
                            }`} />
                    ) : (
                        <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${isVertical ? 'rotate-90' : 'rotate-0'
                            }`} />
                    )}
                </button>
            )}

            {/* Top/Left Handle for incoming connections */}
            <Handle
                type="target"
                position={isVertical ? Position.Top : Position.Left}
                className="!w-1 !h-1 !bg-transparent !border-0"
                style={{ pointerEvents: 'none' }}
            />

            {/* Member Card */}
            <MemberCard
                member={member}
                onClick={hasChildren ? () => onToggleExpand && onToggleExpand(member) : undefined}
                onView={onView ? () => onView(member) : undefined}
                onAddParent={onAddParent && !hasParent ? () => onAddParent(member) : undefined}
                onAddChild={onAddChild ? () => onAddChild(member) : undefined}
                onAddSpouse={onAddSpouse ? () => onAddSpouse(member) : undefined}
                onEdit={onEdit ? () => onEdit(member) : undefined}
                onDelete={onDelete ? () => onDelete(member) : undefined}
                hasParent={hasParent}
                isClickable={hasChildren || !!onView}
                addParentPos={isVertical ? "top" : "left"}
                addChildPos={isVertical ? "right" : "bottom"}
            />

            {/* Bottom/Right Handle for outgoing connections */}
            <Handle
                type="source"
                position={isVertical ? Position.Bottom : Position.Right}
                className="!w-1 !h-1 !bg-transparent !border-0"
                style={{ pointerEvents: 'none' }}
            />
        </div>
    );
});

CustomFamilyNode.displayName = 'CustomFamilyNode';