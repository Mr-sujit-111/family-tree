"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { FamilyMember } from '@/data/family-data';
import { CustomFamilyNode, type CustomFamilyNodeData } from './custom-family-node';
import { TreeControls } from './tree-controls';
import { MemberModal } from './member-modal';
import { AddMemberDialog } from './add-member-dialog';
import { EditMemberDialog } from './edit-member-dialog';
import { DeleteMemberDialog } from './delete-member-dialog';
import { MemberSelectionDialog } from './member-selection-dialog';
import { apiClient } from '@/lib/api';
import {
    convertToReactFlowElements,
    filterFamilyTree,
    getAllGenerations,
    filterByGeneration,
    applyExpansionState,
    type FilterOptions,
} from '@/lib/tree-layout';
import { loadTreeState, saveTreeState } from '@/lib/tree-state';

interface AdvancedFamilyTreeViewProps {
    rootMember: FamilyMember;
    onTreeUpdate?: () => void;
}

const nodeTypes = {
    familyMember: CustomFamilyNode,
};

function AdvancedFamilyTreeViewInner({ rootMember, onTreeUpdate }: AdvancedFamilyTreeViewProps) {
    const [direction, setDirection] = useState<'vertical' | 'horizontal'>('horizontal'); // Changed default to vertical
    const [filters, setFilters] = useState<FilterOptions>({
        gender: 'all',
        showDeceased: true,
        generation: 'all',
    });

    // State for expanded nodes
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
        // Load expanded nodes from localStorage
        if (typeof window !== 'undefined') {
            const state = loadTreeState();
            if (state) {
                return new Set(state.expandedNodes);
            }
        }
        return new Set([String(rootMember.id)]); // Root node is expanded by default
    });

    // Dialog states
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [memberToAdd, setMemberToAdd] = useState<FamilyMember | null>(null);
    const [relationType, setRelationType] = useState<'child' | 'parent' | 'sibling' | 'spouse'>('child');
    const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
    const [memberEditData, setMemberEditData] = useState<any>(null);
    const [showMemberSelection, setShowMemberSelection] = useState(false);
    const [selectionAction, setSelectionAction] = useState<'edit' | 'delete'>('edit');
    const [selectedMemberForAction, setSelectedMemberForAction] = useState<FamilyMember | null>(null);
    const [isEditingSpouse, setIsEditingSpouse] = useState(false);

    const { fitView, zoomIn, zoomOut } = useReactFlow();

    // Save expanded nodes to localStorage when they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const state = {
                expandedNodes: Array.from(expandedNodes),
                zoomLevel: 1, // We can add zoom level persistence later
            };
            saveTreeState(state);
        }
    }, [expandedNodes]);

    // Calculate max generation
    const maxGeneration = useMemo(() => getAllGenerations(rootMember), [rootMember]);

    // Apply filters and expansion state to tree data
    const processedMember = useMemo(() => {
        let filtered: FamilyMember | null = rootMember;

        // Apply gender and deceased filters
        if (filters.gender !== 'all' || filters.showDeceased === false) {
            filtered = filterFamilyTree(rootMember, filters);
        }

        // Apply generation filter
        if (filtered && filters.generation !== 'all' && typeof filters.generation === 'number') {
            filtered = filterByGeneration(filtered, filters.generation);
        }

        // Apply expansion state
        if (filtered) {
            filtered = applyExpansionState(filtered, expandedNodes);
        }

        return filtered || rootMember;
    }, [rootMember, filters, expandedNodes]);

    // Convert to ReactFlow elements
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!processedMember) return { nodes: [], edges: [] };

        return convertToReactFlowElements(processedMember, {
            direction,
            nodeWidth: 240,
            nodeHeight: 180,
            horizontalSpacing: 40,
            verticalSpacing: 60,
        });
    }, [processedMember, direction]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes with callbacks and direction
    useEffect(() => {
        const updatedNodes = initialNodes.map(node => ({
            ...node,
            data: {
                ...(node.data as unknown as CustomFamilyNodeData),
                onView: handleView,
                onAddParent: handleAddParent,
                onAddChild: handleAddChild,
                onAddSpouse: handleAddSpouse,
                onEdit: handleEdit,
                onDelete: handleDelete,
                hasParent: node.id !== String(rootMember.id),
                direction,
                // Add toggle expand function to node data
                onToggleExpand: handleToggleExpand,
                isExpanded: expandedNodes.has(node.id),
                hasChildren: checkHasChildren(node.id),
            },
        }));
        setNodes(updatedNodes as any);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, direction, rootMember.id, expandedNodes]);

    // Fit view when layout changes with smooth animation
    useEffect(() => {
        const timer = setTimeout(() => {
            fitView({ padding: 0.2, duration: 600 });
        }, 150);
        return () => clearTimeout(timer);
    }, [direction, filters, fitView]);

    // Smooth auto-fit when tree data updates (new member added)
    useEffect(() => {
        const timer = setTimeout(() => {
            fitView({ padding: 0.2, duration: 500, maxZoom: 1.5 });
        }, 200);
        return () => clearTimeout(timer);
    }, [rootMember, fitView]);

    // Check if a node has children in the original tree data
    const checkHasChildren = useCallback((nodeId: string): boolean => {
        // Find the member in the original tree data (not the processed one)
        const findMember = (member: FamilyMember): boolean => {
            if (String(member.id) === nodeId) {
                const hasChildren = !!(member.children && member.children.length > 0);
                return hasChildren;
            }
            if (member.children) {
                for (const child of member.children) {
                    if (findMember(child)) {
                        return true;
                    }
                }
            }
            return false;
        };
        return findMember(rootMember);
    }, [rootMember]);

    // Toggle expand/collapse for a node
    const handleToggleExpand = useCallback((member: FamilyMember) => {
        const memberId = String(member.id);
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(memberId)) {
                newSet.delete(memberId);
            } else {
                newSet.add(memberId);
            }
            return newSet;
        });
    }, []);

    const handleView = useCallback((member: FamilyMember) => {
        setSelectedMember(member);
    }, []);

    const handleAddParent = useCallback((member: FamilyMember) => {
        setMemberToAdd(member);
        setRelationType('parent');
    }, []);

    const handleAddChild = useCallback((member: FamilyMember) => {
        setMemberToAdd(member);
        setRelationType('child');
    }, []);

    const handleAddSpouse = useCallback((member: FamilyMember) => {
        setMemberToAdd(member);
        setRelationType('spouse');
    }, []);

    const handleEdit = useCallback(async (member: FamilyMember) => {
        if (member.spouse) {
            setSelectedMemberForAction(member);
            setSelectionAction('edit');
            setShowMemberSelection(true);
        } else {
            try {
                const response = await apiClient.getMemberById(String(member.id));
                if (response.data) {
                    setMemberEditData(response.data);
                    setMemberToEdit(member);
                }
            } catch (error) {
                console.error('Error fetching member data:', error);
            }
        }
    }, []);

    const handleDelete = useCallback((member: FamilyMember) => {
        if (member.spouse) {
            setSelectedMemberForAction(member);
            setSelectionAction('delete');
            setShowMemberSelection(true);
        } else {
            setMemberToDelete(member);
        }
    }, []);

    const handleMemberSelected = useCallback(async (memberId: string, isSpouse: boolean) => {
        if (!selectedMemberForAction) return;

        if (selectionAction === 'edit') {
            try {
                const response = await apiClient.getMemberById(String(selectedMemberForAction.id));
                if (response.data) {
                    setMemberEditData(response.data);
                    setIsEditingSpouse(isSpouse);
                    setMemberToEdit({
                        ...selectedMemberForAction,
                        id: selectedMemberForAction.id,
                        name: isSpouse && selectedMemberForAction.spouse
                            ? selectedMemberForAction.spouse.name
                            : selectedMemberForAction.name,
                    });
                }
            } catch (error) {
                console.error('Error fetching member data:', error);
            }
        } else {
            if (isSpouse && selectedMemberForAction.spouse) {
                setMemberToDelete({
                    id: selectedMemberForAction.id,
                    name: selectedMemberForAction.spouse.name,
                    isSpouse: true,
                } as FamilyMember & { isSpouse?: boolean });
            } else {
                setMemberToDelete({
                    id: selectedMemberForAction.id,
                    name: selectedMemberForAction.name,
                } as FamilyMember);
            }
        }
    }, [selectedMemberForAction, selectionAction]);

    const handleSuccess = useCallback(() => {
        if (onTreeUpdate) {
            // Trigger smooth tree update without full reload
            onTreeUpdate();
        }
    }, [onTreeUpdate]);

    const handleZoomIn = useCallback(() => {
        zoomIn({ duration: 300 });
    }, [zoomIn]);

    const handleZoomOut = useCallback(() => {
        zoomOut({ duration: 300 });
    }, [zoomOut]);

    const handleFitView = useCallback(() => {
        fitView({ padding: 0.2, duration: 800 });
    }, [fitView]);

    return (
        <div className="absolute inset-0 bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                panOnScroll
                zoomOnScroll
                panOnDrag
                selectNodesOnDrag={false}
                nodesFocusable={true}
                edgesFocusable={true}
                edgesReconnectable={false}
                className="family-tree-canvas w-full h-full"
                // Enhanced mobile touch optimizations
                touch-action="manipulation"
                preventScrolling={true}
                zoomOnPinch={true}
                panOnScrollSpeed={0.5}
                // Improved mobile drag behavior
                nodeDragThreshold={0}
                zoomActivationKeyCode={null}
                panActivationKeyCode={null}
                selectionKeyCode={null}
                multiSelectionKeyCode={null}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="hsl(var(--border))"
                />

                <TreeControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFitView={handleFitView}
                    onDirectionChange={setDirection}
                    onFiltersChange={setFilters}
                    currentDirection={direction}
                    currentFilters={filters}
                    maxGeneration={maxGeneration}
                />
            </ReactFlow>

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
                        setRelationType('child');
                    }
                }}
                targetMemberId={memberToAdd?.id ? String(memberToAdd.id) : undefined}
                targetMemberGender={memberToAdd?.gender as 'male' | 'female' | undefined}
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
                memberId={memberToEdit?.id ? String(memberToEdit.id) : ''}
                isEditingSpouse={isEditingSpouse}
                memberData={memberEditData}
                onSuccess={handleSuccess}
            />
            <DeleteMemberDialog
                open={memberToDelete !== null}
                onOpenChange={(open) => !open && setMemberToDelete(null)}
                memberId={memberToDelete?.id ? String(memberToDelete.id) : ''}
                memberName={memberToDelete?.name || 'this member'}
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
                    id: selectedMemberForAction?.id || '',
                    name: selectedMemberForAction?.name || '',
                    image: selectedMemberForAction?.image,
                    gender: selectedMemberForAction?.gender,
                }}
                spouse={
                    selectedMemberForAction?.spouse
                        ? {
                            id: String(selectedMemberForAction.id),
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

export function AdvancedFamilyTreeView(props: AdvancedFamilyTreeViewProps) {
    return (
        <ReactFlowProvider>
            <AdvancedFamilyTreeViewInner {...props} />
        </ReactFlowProvider>
    );
}