import { DataTable } from "@/components/DataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

const EditRoleDialog = ({
  id,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description?: string, isDefault?: boolean) => void;
  isLoading?: boolean;
}) => {
  const {
    data: role,
    isLoading: isRoleLoading,
    error: roleError,
  } = useQuery<Role>({
    queryKey: ["roles", id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3002/roles/${id}`);
      return response.json();
    },
  });
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [isDefault, setIsDefault] = useState(role?.isDefault);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || "");
      setIsDefault(role.isDefault);
    }
  }, [role]);

  const handleSubmit = useCallback(() => {
    if (name.trim()) {
      onSubmit(name.trim(), description.trim(), isDefault);
    }
  }, [name, description, isDefault, onSubmit]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setName("");
        setDescription("");
        setIsDefault(false);
      }
      onOpenChange(open);
    },
    [onOpenChange]
  );

  if (roleError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Role not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {isRoleLoading ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      ) : role ? (
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              <span className="text-secondary-foreground font-medium">
                Editing the <span className="text-foreground">{role.name}</span>{" "}
                role
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-1">
              <Label htmlFor="role-name" className="w-[140px]">
                Name
              </Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Frontend Engineer"
                disabled={isLoading}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-1">
              <Label htmlFor="role-description" className="w-[140px]">
                Description
              </Label>
              <Textarea
                id="role-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Builds all the things, considered legendary among their peers..."
                disabled={isLoading}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-1">
              <Label htmlFor="role-is-default" className="w-[140px]">
                Make default role
              </Label>
              <Switch
                id="role-is-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
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
      ) : null}
    </Dialog>
  );
};

type RoleRow = {
  role: Role;
  updated: string;
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

const ActionMenu = ({ onEdit }: { onEdit: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelectItem = useCallback(
    (item: string) => {
      setIsOpen(false);
      if (item === "edit") {
        onEdit();
      }
    },
    [onEdit]
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
        <DropdownMenuItem onSelect={() => onSelectItem("edit")}>
          Edit Role
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function RolesTable() {
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
    undefined
  );
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

  const currentDefaultRole = useMemo(() => {
    return rolesResponse?.data.find((role) => role.isDefault);
  }, [rolesResponse]);

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      roleId,
      name,
      description,
      isDefault,
      updatedAt,
    }: {
      roleId: string;
      name?: string;
      description?: string;
      isDefault?: boolean;
      updatedAt: string;
    }) => {
      if (
        isDefault &&
        currentDefaultRole &&
        isDefault !== currentDefaultRole?.isDefault
      ) {
        const response = await fetch(
          `http://localhost:3002/roles/${currentDefaultRole?.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              isDefault: false,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update default role");
        }
      }
      const response = await fetch(`http://localhost:3002/roles/${roleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          isDefault,
          updatedAt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsEditRoleDialogOpen(false);
      setSelectedRoleId(undefined);
      setError(undefined);
      toast.success("Role updated successfully");
    },
    onError: (error: Error) => {
      setError(error.message);
      setIsEditRoleDialogOpen(false);
      setSelectedRoleId(undefined);
    },
  });

  const roles = useMemo(() => rolesResponse?.data ?? [], [rolesResponse]);

  const data: RoleRow[] = useMemo(
    () =>
      roles.map((role) => ({
        role,
        updated: role.updatedAt,
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
        accessorKey: "updated",
        header: "Last Updated",
        cell: ({ row }) => {
          const roleRow = row.original;
          return (
            <div>
              {new Date(roleRow.updated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.updated);
          const dateB = new Date(rowB.original.updated);
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
              onEdit={() => {
                setSelectedRoleId(roleRow.role.id);
                setIsEditRoleDialogOpen(true);
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

  const handleUpdateRole = useCallback(
    (name: string, description?: string, isDefault?: boolean) => {
      if (selectedRoleId) {
        updateRoleMutation.mutate({
          roleId: selectedRoleId,
          name,
          description,
          isDefault,
          updatedAt: new Date().toISOString(),
        });
      }
    },
    [selectedRoleId, updateRoleMutation]
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
      <EditRoleDialog
        id={selectedRoleId}
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
        onSubmit={handleUpdateRole}
        isLoading={updateRoleMutation.isPending}
      />
    </div>
  );
}
