import { Node, Edge, MarkerType } from '@xyflow/react';
import { hierarchy, tree } from 'd3-hierarchy';
import type { FamilyMember } from '@/data/family-data';

export interface TreeLayoutOptions {
    direction: 'vertical' | 'horizontal';
    nodeWidth: number;
    nodeHeight: number;
    horizontalSpacing: number;
    verticalSpacing: number;
}

const DEFAULT_OPTIONS: TreeLayoutOptions = {
    direction: 'vertical',
    nodeWidth: 240,
    nodeHeight: 180,
    horizontalSpacing: 40,
    verticalSpacing: 60,
};

interface HierarchyNode {
    id: string;
    member: FamilyMember;
    children?: HierarchyNode[];
}

export function buildHierarchy(member: FamilyMember): HierarchyNode {
    return {
        id: String(member.id),
        member,
        children: member.children?.map(child => buildHierarchy(child)),
    };
}

export function convertToReactFlowElements(
    rootMember: FamilyMember,
    options: Partial<TreeLayoutOptions> = {}
): { nodes: Node[]; edges: Edge[] } {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const hierarchyRoot = buildHierarchy(rootMember);

    // Create d3 hierarchy
    const root = hierarchy(hierarchyRoot);

    // Calculate tree layout
    const treeLayout = tree<HierarchyNode>()
        .nodeSize([
            opts.direction === 'vertical' ? opts.nodeWidth + opts.horizontalSpacing : opts.nodeHeight + opts.verticalSpacing,
            opts.direction === 'vertical' ? opts.nodeHeight + opts.verticalSpacing : opts.nodeWidth + opts.horizontalSpacing,
        ])
        .separation((a: any, b: any) => (a.parent === b.parent ? 1 : 1.2));

    treeLayout(root);

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Convert hierarchy nodes to ReactFlow nodes
    root.each((node: any) => {
        const data = node.data;
        const position = opts.direction === 'vertical'
            ? { x: node.x, y: node.y }
            : { x: node.y, y: node.x };

        nodes.push({
            id: data.id,
            type: 'familyMember',
            position,
            data: { member: data.member },
            draggable: true,
        });
        // Create edges
        if (node.parent) {
            edges.push({
                id: `e-${node.parent.data.id}-${data.id}`,
                source: node.parent.data.id,
                target: data.id,
                type: 'smoothstep',
                style: {
                    stroke: '#2563eb',
                    strokeWidth: 3,
                    strokeDasharray: '5, 5',
                },
                animated: true,
                selectable: false,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#2563eb',
                },
            });
        }
    });

    return { nodes, edges };
}

export interface FilterOptions {
    gender?: 'male' | 'female' | 'all';
    showDeceased?: boolean;
    generation?: number | 'all';
}

export function filterFamilyTree(
    member: FamilyMember,
    filters: FilterOptions
): FamilyMember | null {
    // Check if current member matches filters
    const matchesGender = !filters.gender || filters.gender === 'all' || member.gender === filters.gender;
    const matchesDeceased = filters.showDeceased === undefined || filters.showDeceased === true || !member.is_deceased;

    // Recursively filter children first
    const filteredChildren = member.children
        ?.map(child => filterFamilyTree(child, filters))
        .filter((child): child is FamilyMember => child !== null) || [];

    // If this member doesn't match but has filtered children, include it to maintain tree structure
    if (!matchesGender || !matchesDeceased) {
        // Only exclude if it has no filtered children
        if (filteredChildren.length === 0) {
            return null;
        }
    }

    return {
        ...member,
        children: filteredChildren,
    };
}

export function getAllGenerations(member: FamilyMember, level: number = 1): number {
    if (!member.children || member.children.length === 0) {
        return level;
    }

    const childLevels = member.children.map(child => getAllGenerations(child, level + 1));
    return Math.max(...childLevels);
}

export function filterByGeneration(
    member: FamilyMember,
    targetGeneration: number,
    currentLevel: number = 1
): FamilyMember | null {
    if (currentLevel > targetGeneration) {
        return null;
    }

    if (currentLevel === targetGeneration) {
        return {
            ...member,
            children: [],
        };
    }

    const filteredChildren = member.children
        ?.map(child => filterByGeneration(child, targetGeneration, currentLevel + 1))
        .filter((child): child is FamilyMember => child !== null);

    return {
        ...member,
        children: filteredChildren || [],
    };
}

export function applyExpansionState(
    member: FamilyMember,
    expandedNodes: Set<string>
): FamilyMember {
    const memberId = String(member.id);
    const isExpanded = expandedNodes.has(memberId);

    if (!isExpanded || !member.children || member.children.length === 0) {
        return {
            ...member,
            children: [],
        };
    }

    return {
        ...member,
        children: member.children.map(child => applyExpansionState(child, expandedNodes)),
    };
}
