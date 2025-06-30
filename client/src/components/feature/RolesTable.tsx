import { DataTable } from "@/components/DataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import type {
  PagedData,
  Role,
} from "@workos/frontend-take-home-server/src/models";
import { EllipsisVerticalIcon, PlusIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const RenameRoleDialog = ({
  role,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  role?: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description?: string) => void;
  isLoading?: boolean;
}) => {
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");

  const handleSubmit = useCallback(() => {
    if (name.trim()) {
      onSubmit(name.trim(), description.trim() || undefined);
    }
  }, [name, description, onSubmit]);

  if (!role) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename role</DialogTitle>
          <DialogDescription>
            Update the name and description for the role{" "}
            <span className="font-bold">{role.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="role-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="role-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type RoleRow = {
  role: Role;
  created: string;
};

const RoleCell = ({ role }: { role: Role }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium">{role.name}</span>
          {role.isDefault && <Badge variant="outline">Default</Badge>}
        </div>
        {role.description && (
          <span className="text-sm text-muted-foreground">
            {role.description}
          </span>
        )}
      </div>
    </div>
  );
};

const ActionMenu = ({ onRename }: { onRename: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelectItem = useCallback(
    (item: string) => {
      setIsOpen(false);
      if (item === "rename") {
        onRename();
      }
    },
    [onRename]
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <div className={cn("rounded-full", isOpen && "bg-muted")}>
            <EllipsisVerticalIcon className="w-4 h-4 text-icon rotate-90" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => onSelectItem("rename")}>
          Rename role
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function RolesTable() {
  const [isRenameRoleDialogOpen, setIsRenameRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();
  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery<PagedData<Role>>({
    queryKey: ["roles", currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const response = await fetch(
        `http://localhost:3002/roles?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      return response.json();
    },
  });

  const renameRoleMutation = useMutation({
    mutationFn: async ({
      roleId,
      name,
      description,
    }: {
      roleId: string;
      name: string;
      description?: string;
    }) => {
      const response = await fetch(`http://localhost:3002/roles/${roleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to rename role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsRenameRoleDialogOpen(false);
      setSelectedRole(undefined);
      setError(undefined);
      toast.success("Role renamed successfully");
    },
    onError: (error: Error) => {
      setError(error.message);
      setIsRenameRoleDialogOpen(false);
      setSelectedRole(undefined);
    },
  });

  const roles = useMemo(() => rolesResponse?.data ?? [], [rolesResponse]);

  const data: RoleRow[] = useMemo(
    () =>
      roles.map((role) => ({
        role,
        created: role.createdAt,
      })),
    [roles]
  );

  const columns: ColumnDef<RoleRow>[] = useMemo(
    () => [
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const roleRow = row.original;
          return <RoleCell role={roleRow.role} />;
        },
        sortingFn: (rowA, rowB) => {
          return rowA.original.role.name.localeCompare(rowB.original.role.name);
        },
        filterFn: (row, _, filterValue) => {
          const role = row.original.role;
          const searchText =
            `${role.name} ${role.description || ""}`.toLowerCase();
          return searchText.includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "created",
        header: "Created",
        cell: ({ row }) => {
          const roleRow = row.original;
          return (
            <div>
              {new Date(roleRow.created).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.created);
          const dateB = new Date(rowB.original.created);
          return dateA.getTime() - dateB.getTime();
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const roleRow = row.original;
          return (
            <ActionMenu
              onRename={() => {
                setSelectedRole(roleRow.role);
                setIsRenameRoleDialogOpen(true);
              }}
            />
          );
        },
        enableSorting: false,
      },
    ],
    []
  );

  const handleAddRole = useCallback(() => {
    // TODO: Implement add role
    // eslint-disable-next-line no-console
    console.log("add role");
  }, []);

  const handleRenameRole = useCallback(
    (name: string, description?: string) => {
      if (selectedRole) {
        renameRoleMutation.mutate({
          roleId: selectedRole.id,
          name,
          description,
        });
      }
    },
    [selectedRole, renameRoleMutation]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
  }, []);

  return (
    <div className="py-5 flex flex-col gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <DataTable
        columns={columns}
        data={data}
        isLoading={rolesLoading}
        error={rolesError}
        searchPlaceholder="Search roles..."
        serverSidePagination
        currentPage={currentPage}
        totalPages={rolesResponse?.pages ?? 1}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        searchValue={searchQuery}
        filterAction={
          <Button
            onClick={handleAddRole}
            startIcon={<PlusIcon className="w-4 h-4" />}
          >
            Add Role
          </Button>
        }
      />
      <RenameRoleDialog
        role={selectedRole}
        open={isRenameRoleDialogOpen}
        onOpenChange={setIsRenameRoleDialogOpen}
        onSubmit={handleRenameRole}
        isLoading={renameRoleMutation.isPending}
      />
    </div>
  );
}
