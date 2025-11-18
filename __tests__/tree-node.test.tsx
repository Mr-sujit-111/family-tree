import { render, screen, fireEvent } from '@testing-library/react';
import { TreeNode } from '@/components/tree-node';
import { FamilyMember } from '@/data/family-data';

// Mock the MemberCard component to simplify testing
jest.mock('@/components/member-card', () => {
  return {
    MemberCard: ({ member, onClick }: any) => (
      <div data-testid={`member-card-${member.id}`} onClick={onClick}>
        {member.name}
      </div>
    )
  };
});

describe('TreeNode', () => {
  const mockMember: FamilyMember = {
    id: 1,
    name: 'John Doe',
    image: '/placeholder.svg',
    birthDate: '1980-01-01',
    notes: 'Test member',
    children: [
      {
        id: 2,
        name: 'Jane Doe',
        image: '/placeholder.svg',
        birthDate: '2000-01-01',
        notes: 'Test child'
      }
    ]
  };

  const mockOnToggleExpand = jest.fn();
  const mockOnView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders member name correctly', () => {
    render(
      <TreeNode
        member={mockMember}
        onToggleExpand={mockOnToggleExpand}
        onView={mockOnView}
        level={0}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows expand/collapse button when member has children', () => {
    render(
      <TreeNode
        member={mockMember}
        onToggleExpand={mockOnToggleExpand}
        onView={mockOnView}
        level={0}
      />
    );

    const expandButton = screen.getByLabelText('Expand');
    expect(expandButton).toBeInTheDocument();
  });

  it('calls onToggleExpand when expand button is clicked', () => {
    render(
      <TreeNode
        member={mockMember}
        onToggleExpand={mockOnToggleExpand}
        onView={mockOnView}
        level={0}
      />
    );

    const expandButton = screen.getByLabelText('Expand');
    fireEvent.click(expandButton);

    expect(mockOnToggleExpand).toHaveBeenCalledWith(mockMember);
  });

  it('does not show expand button when member has no children', () => {
    const memberWithoutChildren: FamilyMember = {
      id: 3,
      name: 'No Children',
      image: '/placeholder.svg',
      birthDate: '1980-01-01',
      notes: 'Test member without children'
    };

    render(
      <TreeNode
        member={memberWithoutChildren}
        onToggleExpand={mockOnToggleExpand}
        onView={mockOnView}
        level={0}
      />
    );

    const expandButton = screen.queryByLabelText('Expand');
    expect(expandButton).not.toBeInTheDocument();
  });

  it('renders children when expanded', () => {
    render(
      <TreeNode
        member={mockMember}
        onToggleExpand={mockOnToggleExpand}
        onView={mockOnView}
        level={0}
        isExpanded={true}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });
});