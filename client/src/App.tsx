import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RolesTable from "./components/feature/RolesTable";
import UsersTable from "./components/feature/UsersTable";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col py-10 px-10 justify-center items-center">
        <Tabs defaultValue="users" className="min-w-4/5 lg:w-2xl">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersTable />
          </TabsContent>
          <TabsContent value="roles">
            <RolesTable />
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
