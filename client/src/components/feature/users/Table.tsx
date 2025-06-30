import { type ColumnDef } from "@tanstack/react-table";
import type { User } from "@workos/frontend-take-home-server/src/models";

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];
