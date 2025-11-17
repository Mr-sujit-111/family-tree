"use client";

import { useEffect, useState } from "react";
import { FamilyTreeView } from "@/components/family-tree-view";
import { EmptyTreeView } from "@/components/empty-tree-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { hasTodayEvent } from "@/lib/date-utils";

interface TreeNode {
  id: string;
  first_name: string;
  last_name?: string;
  gender: string;
  birth_date?: string;
  children: TreeNode[];
  spouse?: {
    first_name: string;
    last_name?: string;
    gender: string;
    birth_date?: string;
    image_path?: string;
    notes?: string;
    is_deceased?: boolean;
    passed_away_date?: string;
    mobile_numbers?: string[];
  };
  image_path?: string;
  notes?: string;
  is_deceased?: boolean;
  passed_away_date?: string;
  anniversary_date?: string;
}

export default function Home() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAnyEvent, setHasAnyEvent] = useState(false);
  const { isAuthenticated, isLoading: authLoading, logout, family } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTree();
    }
  }, [isAuthenticated]);

  const fetchTree = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTree();
      if (response.data) {
        setTreeData(response.data);
        // Check for any events in the tree
        const checkForEvents = (nodes: TreeNode[]): boolean => {
          for (const node of nodes) {
            const member = convertToLegacyFormat(node);
            const events = hasTodayEvent({
              birthDate: member.birthDate,
              anniversaryDate: member.anniversaryDate,
              spouse: member.spouse
                ? { birthDate: member.spouse.birthDate }
                : undefined,
            });
            if (
              events.isBirthday ||
              events.isAnniversary ||
              events.isSpouseBirthday
            ) {
              return true;
            }
            if (node.children && node.children.length > 0) {
              if (checkForEvents(node.children)) return true;
            }
          }
          return false;
        };
        setHasAnyEvent(checkForEvents(response.data));
      } else {
        setError(response.error || "Failed to load family tree");
      }
    } catch (err) {
      setError("Failed to load family tree");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading family tree...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                <span className="text-lg font-bold text-foreground">
                  Family Tree
                </span>
              </div>
              <div className="flex items-center gap-4">
                {family && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {family.family_name}
                  </span>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Logout
                </button>
                <ThemeToggle />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Family Tree
              </h1>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col select-none">
      {/* Page Load Confetti */}
      {/* {hasAnyEvent && <ConfettiEffect trigger={true} continuous={false} />} */}

      {/* Header */}
      <header className="border-b border-border bg-card select-none sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3 lg:px-8 lg:py-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-primary" />
              <span className="text-base sm:text-lg font-bold text-foreground">
                Family Tree
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {family && (
                <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden sm:inline">
                  {family.family_name}
                </span>
              )}
              <button
                onClick={logout}
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors touch-manipulation px-2 py-1"
              >
                Logout
              </button>
              <ThemeToggle />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Family Tree</h1>
            <p className="text-muted-foreground mt-0.5 sm:mt-1 text-xs sm:text-sm">
              Tap on any family member to view details
            </p>
          </div>
        </div>
      </header>

      {/* Tree View - Full Page Canvas */}
      <div className="flex-1 overflow-hidden relative">
        {treeData.length === 0 ? (
          <EmptyTreeView onAddFirstMember={fetchTree} />
        ) : (
          treeData[0] && (
            <FamilyTreeView 
              rootMember={convertToLegacyFormat(treeData[0])} 
              onTreeUpdate={fetchTree}
            />
          )
        )}
      </div>
    </main>
  );
}

// Helper function to convert API tree format to legacy format
function convertToLegacyFormat(node: TreeNode | null | undefined): any {
  if (!node) {
    return null;
  }

  // Handle image path
  const imagePath = node.image_path
    ? node.image_path.startsWith("http")
      ? node.image_path
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${
          node.image_path.startsWith("/") ? "" : "/"
        }${node.image_path}`
    : null; // Use null to trigger gender-based placeholder

  const memberId = node.id;

  // Ensure children is always an array
  const children = Array.isArray(node.children) 
    ? node.children.map((child) => convertToLegacyFormat(child))
    : [];

  const convertedMember: any = {
    id: memberId,
    name: `${node.first_name}${node.last_name ? " " + node.last_name : ""}`,
    image: imagePath,
    birthDate: node.birth_date || "",
    anniversaryDate: node.anniversary_date || undefined,
    notes: node.notes || "",
    gender: node.gender,
    is_deceased: node.is_deceased || false,
    passed_away_date: node.passed_away_date || undefined,
    children: children,
  };

  // Convert spouse if exists
  if (node.spouse) {
    const spouseImagePath = node.spouse.image_path
      ? node.spouse.image_path.startsWith("http")
        ? node.spouse.image_path
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${
            node.spouse.image_path.startsWith("/") ? "" : "/"
          }${node.spouse.image_path}`
      : null;

    convertedMember.spouse = {
      name: `${node.spouse.first_name}${
        node.spouse.last_name ? " " + node.spouse.last_name : ""
      }`,
      image: spouseImagePath,
      birthDate: node.spouse.birth_date || "",
      gender: node.spouse.gender,
      is_deceased: node.spouse.is_deceased || false,
      passed_away_date: node.spouse.passed_away_date || undefined,
    };
  }

  return convertedMember;
}
