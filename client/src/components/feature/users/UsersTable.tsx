import { DataTable } from "@/components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import type {
  PagedData,
  Role,
  User,
} from "@workos/frontend-take-home-server/src/models";

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

const ActionMenu = ({ userId }: { userId: string }) => {
  return <div>ActionMenu</div>;
};

const columns: ColumnDef<UserRow>[] = [
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
    filterFn: (row, columnId, filterValue) => {
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
    filterFn: (row, columnId, filterValue) => {
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
      return <ActionMenu userId={userRow.user.id} />;
    },
    enableSorting: false,
  },
];

export default function UsersTable() {
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

  const users = usersResponse?.data ?? [];
  const roles = rolesResponse?.data ?? [];

  const data: UserRow[] = users.map((user) => ({
    user,
    role: roles.find((role) => role.id === user.roleId)?.name ?? "Unknown Role",
    joined: user.createdAt,
  }));

  return (
    <div className="py-5">
      <DataTable
        columns={columns}
        data={data}
        isLoading={usersLoading || rolesLoading}
        error={usersError || rolesError}
        searchPlaceholder="Search by name..."
        filterableColumns={["user"]}
      />
    </div>
  );
}
