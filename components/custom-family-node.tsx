"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { FamilyMember } from '@/data/family-data';
import { MemberCard } from './member-card';

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
    } = data as unknown as CustomFamilyNodeData;

    const isVertical = direction === 'vertical';

    return (
        <div
            className="custom-family-node relative group touch-manipulation"
            style={{
                pointerEvents: 'all',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
            }}
        >
            {/* Top/Left Handle for incoming connections */}
            <Handle
                type="target"
                position={isVertical ? Position.Top : Position.Left}
                className=""
                style={{ pointerEvents: 'none' }}
            />

            {/* Member Card */}
            <MemberCard
                member={member}
                onView={onView ? () => onView(member) : undefined}
                onAddParent={onAddParent && !hasParent ? () => onAddParent(member) : undefined}
                onAddChild={onAddChild ? () => onAddChild(member) : undefined}
                onAddSpouse={onAddSpouse ? () => onAddSpouse(member) : undefined}
                onEdit={onEdit ? () => onEdit(member) : undefined}
                onDelete={onDelete ? () => onDelete(member) : undefined}
                hasParent={hasParent}
                isClickable={false}
            />

            {/* Bottom/Right Handle for outgoing connections */}
            <Handle
                type="source"
                position={isVertical ? Position.Bottom : Position.Right}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background"
                style={{ pointerEvents: 'none' }}
            />
        </div>
    );
});

CustomFamilyNode.displayName = 'CustomFamilyNode';
