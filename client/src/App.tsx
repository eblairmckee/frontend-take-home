import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

function App() {
  return (
    <div className="flex flex-col py-10 px-10 justify-center items-center">
      <Tabs defaultValue="users" className="max-w-4xl min-w-4/5">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="flex flex-col gap-y-5 py-5">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search by name..."
                startIcon={<MagnifyingGlassIcon />}
                className="flex-1"
              />
              <Button startIcon={<PlusIcon />}>Add User</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="roles">Roles</TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
