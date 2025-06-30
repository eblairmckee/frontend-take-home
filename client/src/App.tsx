import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UsersTable from "./components/feature/users/UsersTable";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col py-10 px-10 justify-center items-center">
        <Tabs defaultValue="users" className="max-w-4xl min-w-4/5">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersTable />
          </TabsContent>
          <TabsContent value="roles">Roles</TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
}

export default App;
