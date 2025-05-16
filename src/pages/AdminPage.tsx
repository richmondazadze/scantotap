
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Search, Download, User, Package, CheckCircle, Clock } from "lucide-react";

// Mock user data
const mockUsers = [
  { 
    id: "user1", 
    name: "Alex Johnson", 
    email: "alex@example.com", 
    createdAt: "2023-05-10", 
    status: "active",
    plan: "Premium"
  },
  { 
    id: "user2", 
    name: "Sarah Williams", 
    email: "sarah@example.com", 
    createdAt: "2023-05-11", 
    status: "active",
    plan: "Premium"
  },
  { 
    id: "user3", 
    name: "Michael Brown", 
    email: "michael@example.com", 
    createdAt: "2023-05-12", 
    status: "inactive",
    plan: "Free"
  },
  { 
    id: "user4", 
    name: "Emily Davis", 
    email: "emily@example.com", 
    createdAt: "2023-05-13", 
    status: "active",
    plan: "Team"
  },
  { 
    id: "user5", 
    name: "Robert Wilson", 
    email: "robert@example.com", 
    createdAt: "2023-05-14", 
    status: "active",
    plan: "Premium"
  },
];

// Mock shipping data
const mockShippings = [
  { 
    id: "ship1", 
    userId: "user1", 
    userName: "Alex Johnson",
    address: "123 Main St, New York, NY 10001", 
    requestedAt: "2023-05-15", 
    status: "delivered",
    trackingNumber: "STT54321"
  },
  { 
    id: "ship2", 
    userId: "user2", 
    userName: "Sarah Williams",
    address: "456 Oak Ave, San Francisco, CA 94102", 
    requestedAt: "2023-05-16", 
    status: "shipped",
    trackingNumber: "STT54322"
  },
  { 
    id: "ship3", 
    userId: "user4", 
    userName: "Emily Davis",
    address: "789 Pine St, Chicago, IL 60601", 
    requestedAt: "2023-05-17", 
    status: "processing",
    trackingNumber: "STT54323"
  },
  { 
    id: "ship4", 
    userId: "user5", 
    userName: "Robert Wilson",
    address: "101 Elm St, Austin, TX 78701", 
    requestedAt: "2023-05-18", 
    status: "pending",
    trackingNumber: null
  },
];

const AdminPage = () => {
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [shippingSearchTerm, setShippingSearchTerm] = useState("");

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredShippings = mockShippings.filter(shipping =>
    shipping.userName.toLowerCase().includes(shippingSearchTerm.toLowerCase()) ||
    shipping.address.toLowerCase().includes(shippingSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-scan-mint/20 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 mt-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users and shipping requests</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-scan-blue/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-scan-blue" />
              </div>
              <h3 className="text-2xl font-bold">{mockUsers.length}</h3>
              <p className="text-gray-600">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold">{mockShippings.length}</h3>
              <p className="text-gray-600">Card Orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold">
                {mockShippings.filter(s => s.status === "delivered" || s.status === "shipped").length}
              </h3>
              <p className="text-gray-600">Completed Orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold">
                {mockShippings.filter(s => s.status === "processing" || s.status === "pending").length}
              </h3>
              <p className="text-gray-600">Pending Orders</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage users and their accounts</CardDescription>
                  </div>
                  <div className="flex items-center mt-4 md:mt-0">
                    <div className="relative mr-2">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        className="pl-9 w-full md:w-64"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.plan === 'Premium' 
                                ? 'bg-scan-blue/10 text-scan-blue-dark' 
                                : user.plan === 'Team'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.plan}
                            </span>
                          </TableCell>
                          <TableCell>{user.createdAt}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Shipping Requests</CardTitle>
                    <CardDescription>Manage card orders and shipping</CardDescription>
                  </div>
                  <div className="flex items-center mt-4 md:mt-0">
                    <div className="relative mr-2">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-9 w-full md:w-64"
                        value={shippingSearchTerm}
                        onChange={(e) => setShippingSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShippings.map((shipping) => (
                        <TableRow key={shipping.id}>
                          <TableCell className="font-medium">{shipping.id}</TableCell>
                          <TableCell>{shipping.userName}</TableCell>
                          <TableCell className="max-w-xs truncate">{shipping.address}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              shipping.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : shipping.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : shipping.status === 'processing'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                              {shipping.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {shipping.trackingNumber || '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="text-center mt-12 pb-6">
        <p className="text-sm text-gray-600">
          ScanToTap Admin Dashboard • v1.0.0
        </p>
      </footer>
    </div>
  );
};

export default AdminPage;
