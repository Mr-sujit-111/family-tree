"use client";

import { useState } from 'react';
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    Filter,
    Grid3x3,
    ArrowUpDown,
    Users,
    User,
    UserCheck,
    Layers,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { FilterOptions } from '@/lib/tree-layout';

interface TreeControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onDirectionChange: (direction: 'vertical' | 'horizontal') => void;
    onFiltersChange: (filters: FilterOptions) => void;
    currentDirection: 'vertical' | 'horizontal';
    currentFilters: FilterOptions;
    maxGeneration: number;
}

export function TreeControls({
    onZoomIn,
    onZoomOut,
    onFitView,
    onDirectionChange,
    onFiltersChange,
    currentDirection,
    currentFilters,
    maxGeneration,
}: TreeControlsProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);

    const hasActiveFilters =
        (currentFilters.gender && currentFilters.gender !== 'all') ||
        currentFilters.showDeceased === false ||
        (currentFilters.generation !== undefined && currentFilters.generation !== 'all');

    const activeFilterCount = [
        currentFilters.gender && currentFilters.gender !== 'all',
        currentFilters.showDeceased === false,
        currentFilters.generation !== undefined && currentFilters.generation !== 'all',
    ].filter(Boolean).length;

    return (
        <>
            {/* All Controls - Bottom Left */}
            <div className="fixed bottom-4 left-4 z-50 flex gap-3 touch-manipulation">
                {/* Zoom & Direction Controls */}
                <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg touch-manipulation">
                    <div className="flex flex-col gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onZoomIn}
                            className="h-8 w-8 p-0 touch-manipulation"
                            title="Zoom In"
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onZoomOut}
                            className="h-8 w-8 p-0 touch-manipulation"
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onFitView}
                            className="h-8 w-8 p-0 touch-manipulation"
                            title="Fit View"
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                        <div className="h-px bg-border my-0.5" />
                        <Button
                            variant={currentDirection === 'vertical' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onDirectionChange(currentDirection === 'vertical' ? 'horizontal' : 'vertical')}
                            className="h-8 w-8 p-0 touch-manipulation"
                            title={`Switch to ${currentDirection === 'vertical' ? 'Horizontal' : 'Vertical'}`}
                        >
                            <ArrowUpDown className={`h-3.5 w-3.5 ${currentDirection === 'horizontal' ? 'rotate-90' : ''} transition-transform`} />
                        </Button>
                        <div className="h-px bg-border my-0.5" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
                            className="h-8 w-8 p-0 touch-manipulation"
                            title={isFilterPanelVisible ? 'Hide Filters' : 'Show Filters'}
                        >
                            {isFilterPanelVisible ? (
                                <ChevronLeft className="h-3.5 w-3.5" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Compact Filter Panel - Responsive */}
                {isFilterPanelVisible && (
                    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2.5 shadow-lg w-[180px] transition-all duration-300 touch-manipulation hidden sm:block md:w-[170px] lg:w-[180px]">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold flex items-center gap-1.5">
                                <Filter className="h-3 w-3" />
                                Filters
                            </h3>
                            {hasActiveFilters && (
                                <Badge variant="destructive" className="h-4 px-1.5 text-[10px] touch-manipulation">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-2">
                            {/* Gender Filter */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    Gender
                                </label>
                                <div className="flex gap-1">
                                    <Button
                                        variant={!currentFilters.gender || currentFilters.gender === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => onFiltersChange({ ...currentFilters, gender: 'all' })}
                                        className="h-7 px-2 text-[10px] flex-1 touch-manipulation"
                                        title="All"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={currentFilters.gender === 'male' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => onFiltersChange({ ...currentFilters, gender: currentFilters.gender === 'male' ? 'all' : 'male' })}
                                        className="h-7 px-2 text-[10px] flex-1 touch-manipulation"
                                        title="Male"
                                    >
                                        M
                                    </Button>
                                    <Button
                                        variant={currentFilters.gender === 'female' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => onFiltersChange({ ...currentFilters, gender: currentFilters.gender === 'female' ? 'all' : 'female' })}
                                        className="h-7 px-2 text-[10px] flex-1 touch-manipulation"
                                        title="Female"
                                    >
                                        F
                                    </Button>
                                </div>
                            </div>

                            {/* Deceased Filter */}
                            <div className="space-y-1">
                                <Button
                                    variant={currentFilters.showDeceased !== false ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onFiltersChange({ ...currentFilters, showDeceased: currentFilters.showDeceased === false })}
                                    className="w-full h-7 text-[10px] justify-start px-2 touch-manipulation"
                                >
                                    <UserCheck className="mr-1.5 h-3 w-3" />
                                    Deceased
                                </Button>
                            </div>

                            {/* Generation Filter */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    Generation
                                </label>
                                <div className="space-y-0.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                                    <Button
                                        variant={!currentFilters.generation || currentFilters.generation === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => onFiltersChange({ ...currentFilters, generation: 'all' })}
                                        className="w-full h-6 text-[10px] justify-start px-2 touch-manipulation"
                                    >
                                        All
                                    </Button>
                                    {Array.from({ length: maxGeneration }, (_, i) => i + 1).map((gen) => (
                                        <Button
                                            key={gen}
                                            variant={currentFilters.generation === gen ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onFiltersChange({ ...currentFilters, generation: currentFilters.generation === gen ? 'all' : gen })}
                                            className="w-full h-6 text-[10px] justify-start px-2 touch-manipulation"
                                        >
                                            Gen {gen}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onFiltersChange({ gender: 'all', showDeceased: true, generation: 'all' })}
                                    className="w-full h-6 text-[10px] justify-start px-2 touch-manipulation"
                                >
                                    <X className="mr-1.5 h-3 w-3" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}