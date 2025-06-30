import { DataTable } from "@/components/DataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import type {
  PagedData,
  Role,
  User,
} from "@workos/frontend-take-home-server/src/models";
import { EllipsisVerticalIcon, PlusIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const DeleteUserDialog = ({
  user,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}) => {
  if (!user) {
    return null;
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user</DialogTitle>
          <DialogDescription>
            Are you sure? The user{" "}
            <span className="font-bold">
              {user.first} {user.last}
            </span>{" "}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type UserRow = {
  user: User;
  role: string;
  joined: string;
};

const UserCell = ({ user }: { user: User }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={user.photo} />
        <AvatarFallback>{user.first.charAt(0)}</AvatarFallback>
      </Avatar>
      <span>
        {user.first} {user.last}
      </span>
    </div>
  );
};

const ActionMenu = ({ onDelete }: { onDelete: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onSelectItem = (item: string) => {
    setIsOpen(false);
    if (item === "delete") {
      onDelete();
    }
  };
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
          Edit user
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelectItem("delete")}>
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function UsersTable() {
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const queryClient = useQueryClient();
  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery<PagedData<User>>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3002/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  const columns: ColumnDef<UserRow>[] = useMemo(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => {
          const userRow = row.original;
          return <UserCell user={userRow.user} />;
        },
        sortingFn: (rowA, rowB) => {
          const nameA = `${rowA.original.user.first} ${rowA.original.user.last}`;
          const nameB = `${rowB.original.user.first} ${rowB.original.user.last}`;
          return nameA.localeCompare(nameB);
        },
        filterFn: (row, _, filterValue) => {
          const fullName = `${row.original.user.first} ${row.original.user.last}`;
          return fullName.toLowerCase().includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const userRow = row.original;
          return <div>{userRow.role}</div>;
        },
        sortingFn: (rowA, rowB) => {
          return rowA.original.role.localeCompare(rowB.original.role);
        },
        filterFn: (row, _, filterValue) => {
          return row.original.role
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "joined",
        header: "Joined",
        cell: ({ row }) => {
          const userRow = row.original;
          return (
            <div>
              {new Date(userRow.joined).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.joined);
          const dateB = new Date(rowB.original.joined);
          return dateA.getTime() - dateB.getTime();
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const userRow = row.original;
          return (
            <ActionMenu
              onDelete={() => {
                setSelectedUser(userRow.user);
                setIsDeleteUserDialogOpen(true);
              }}
            />
          );
        },
        enableSorting: false,
      },
    ],
    [setSelectedUser, setIsDeleteUserDialogOpen]
  );

  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery<PagedData<Role>>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3002/roles");
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      return response.json();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`http://localhost:3002/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteUserDialogOpen(false);
      setSelectedUser(undefined);
      setError(undefined);
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      setError(error.message);
      setIsDeleteUserDialogOpen(false);
      setSelectedUser(undefined);
    },
  });

  const users = useMemo(() => usersResponse?.data ?? [], [usersResponse]);
  const roles = useMemo(() => rolesResponse?.data ?? [], [rolesResponse]);

  const data: UserRow[] = useMemo(
    () =>
      users.map((user) => ({
        user,
        role:
          roles.find((role) => role.id === user.roleId)?.name ?? "Unknown Role",
        joined: user.createdAt,
      })),
    [users, roles]
  );

  const handleAddUser = useCallback(() => {
    // TODO: Implement add user
    // eslint-disable-next-line no-console
    console.log("add user");
  }, []);

  const handleDeleteUser = useCallback(() => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  }, [selectedUser, deleteUserMutation]);

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
        isLoading={usersLoading || rolesLoading}
        error={usersError || rolesError}
        searchPlaceholder="Search by name..."
        filterableColumns={["user"]}
        filterAction={
          <Button
            onClick={handleAddUser}
            startIcon={<PlusIcon className="w-4 h-4" />}
          >
            Add User
          </Button>
        }
      />
      <DeleteUserDialog
        user={selectedUser}
        open={isDeleteUserDialogOpen}
        onOpenChange={setIsDeleteUserDialogOpen}
        onSubmit={handleDeleteUser}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
