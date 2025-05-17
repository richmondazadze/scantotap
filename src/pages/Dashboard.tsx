import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import QRCode from "@/components/QRCode";
import Card3D from "@/components/Card3D";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, ArrowLeft, Plus, Trash, Home, Link as LinkIcon, Mail, Phone, Package, MapPin } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const { profile, updateProfile, addLink, removeLink, updateLink } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newLink, setNewLink] = useState({ platform: "", url: "", icon: "" });
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || "",
    title: profile?.title || "",
    bio: profile?.bio || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    website: profile?.website || "",
    location: profile?.location || "",
  });

  // Get current tab from URL params or default to profile
  const activeTab = searchParams.get('tab') || 'profile';
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    updateProfile(profileForm);
    setIsEditingProfile(false);
    toast({
      title: "Profile Updated",
      description: "Your profile details have been saved successfully.",
    });
  };

  const handleAddLink = () => {
    if (newLink.platform && newLink.url) {
      addLink({ 
        platform: newLink.platform, 
        url: newLink.url, 
        icon: newLink.platform.toLowerCase()
      });
      setNewLink({ platform: "", url: "", icon: "" });
      toast({
        title: "Link Added",
        description: "Your new link has been added to your profile.",
      });
    }
  };

  const handleLinkChange = (index: number, field: string, value: string) => {
    if (profile && profile.links) {
      const updatedLink = { ...profile.links[index], [field]: value };
      updateLink(index, updatedLink);
    }
  };

  const handleRemoveLink = (index: number) => {
    removeLink(index);
    toast({
      title: "Link Removed",
      description: "The link has been removed from your profile.",
    });
  };

  const orderCard = () => {
    toast({
      title: "Order Submitted",
      description: "Your card request has been received! We'll email you with shipping details.",
    });
  };

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-scan-mint/20">
      <DashboardSidebar />

      <div className="lg:pl-64 min-h-screen">
        <main className="p-4 sm:p-6 md:p-8 pt-20 lg:pt-8 h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
              <TabsList className="grid grid-cols-5 mb-8 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="order">Order Card</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <div className="h-[calc(100%-4rem)] overflow-y-auto">
                <TabsContent value="profile" forceMount className="h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your personal and professional details
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isEditingProfile ? (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label htmlFor="name" className="text-sm font-medium">
                                Full Name
                              </label>
                              <Input
                                id="name"
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileFormChange}
                                placeholder="Your full name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="title" className="text-sm font-medium">
                                Professional Title
                              </label>
                              <Input
                                id="title"
                                name="title"
                                value={profileForm.title}
                                onChange={handleProfileFormChange}
                                placeholder="e.g. Product Designer"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="bio" className="text-sm font-medium">
                                Bio
                              </label>
                              <Textarea
                                id="bio"
                                name="bio"
                                value={profileForm.bio}
                                onChange={handleProfileFormChange}
                                placeholder="A brief description about yourself"
                                rows={4}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                  Email
                                </label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={profileForm.email}
                                  onChange={handleProfileFormChange}
                                  placeholder="your@email.com"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium">
                                  Phone Number
                                </label>
                                <Input
                                  id="phone"
                                  name="phone"
                                  value={profileForm.phone}
                                  onChange={handleProfileFormChange}
                                  placeholder="+1 (555) 123-4567"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor="website" className="text-sm font-medium">
                                  Website
                                </label>
                                <Input
                                  id="website"
                                  name="website"
                                  value={profileForm.website}
                                  onChange={handleProfileFormChange}
                                  placeholder="https://yourwebsite.com"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label htmlFor="location" className="text-sm font-medium">
                                  Location
                                </label>
                                <Input
                                  id="location"
                                  name="location"
                                  value={profileForm.location}
                                  onChange={handleProfileFormChange}
                                  placeholder="City, Country"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-20 w-20">
                                <AvatarImage src={profile.avatar} alt={profile.name} />
                                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-bold">{profile.name}</h3>
                                <p className="text-gray-500">{profile.title}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Bio</h4>
                              <p className="text-gray-600">{profile.bio}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Mail size={16} className="text-scan-blue" />
                                  <h4 className="font-medium">Email</h4>
                                </div>
                                <p className="text-gray-600">{profile.email}</p>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Phone size={16} className="text-scan-blue" />
                                  <h4 className="font-medium">Phone</h4>
                                </div>
                                <p className="text-gray-600">{profile.phone}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Home size={16} className="text-scan-blue" />
                                  <h4 className="font-medium">Website</h4>
                                </div>
                                <p className="text-gray-600">{profile.website}</p>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <MapPin size={16} className="text-scan-blue" />
                                  <h4 className="font-medium">Location</h4>
                                </div>
                                <p className="text-gray-600">{profile.location}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        {isEditingProfile ? (
                          <div className="flex space-x-2 w-full justify-end">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsEditingProfile(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSaveProfile}>Save Changes</Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={() => setIsEditingProfile(true)}
                            className="ml-auto"
                          >
                            Edit Profile
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>
                          How your card appears to others
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                        <Card3D />
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-3">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Social Links</CardTitle>
                          <CardDescription>
                            Add and manage your social media and website links
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Platform (e.g. Twitter)"
                            value={newLink.platform}
                            onChange={(e) => setNewLink({...newLink, platform: e.target.value})}
                            className="w-40"
                          />
                          <Input
                            placeholder="URL"
                            value={newLink.url}
                            onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                            className="w-64"
                          />
                          <Button size="sm" onClick={handleAddLink}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Link
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {profile.links.map((link, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg">
                              <div className="w-10 h-10 rounded-full bg-scan-blue/10 flex items-center justify-center">
                                <LinkIcon className="h-5 w-5 text-scan-blue" />
                              </div>
                              <Input
                                value={link.platform}
                                onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                                className="w-40"
                              />
                              <Input
                                value={link.url}
                                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                className="flex-1"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveLink(index)}
                              >
                                <Trash size={18} />
                              </Button>
                            </div>
                          ))}
                          
                          {profile.links.length === 0 && (
                            <div className="text-center py-12">
                              <p className="text-gray-500">You haven't added any links yet.</p>
                              <p className="text-gray-500">Add your first link using the form above.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="qr" forceMount className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your QR Code</CardTitle>
                        <CardDescription>
                          Share this QR code to connect instantly
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center">
                        <QRCode profileId={profile.id} size={250} className="mb-8" />
                        <p className="text-center text-gray-600 max-w-md">
                          This QR code links directly to your profile at 
                          <br />
                          <span className="font-mono text-scan-blue">
                            {window.location.origin}/profile/{profile.id}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Usage Tips</CardTitle>
                        <CardDescription>
                          Make the most of your QR code
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <div className="mr-3 mt-1 bg-scan-blue/10 rounded-full p-1">
                              <div className="w-5 h-5 rounded-full bg-scan-blue flex items-center justify-center text-white text-xs">
                                1
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Add to digital signatures</h4>
                              <p className="text-gray-600 text-sm mt-1">
                                Include your QR code in email signatures for easy networking.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <div className="mr-3 mt-1 bg-scan-blue/10 rounded-full p-1">
                              <div className="w-5 h-5 rounded-full bg-scan-blue flex items-center justify-center text-white text-xs">
                                2
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Share on social media</h4>
                              <p className="text-gray-600 text-sm mt-1">
                                Post your QR code on social profiles for broader reach.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <div className="mr-3 mt-1 bg-scan-blue/10 rounded-full p-1">
                              <div className="w-5 h-5 rounded-full bg-scan-blue flex items-center justify-center text-white text-xs">
                                3
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Add to presentations</h4>
                              <p className="text-gray-600 text-sm mt-1">
                                Include your QR code on the final slide of presentations.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <div className="mr-3 mt-1 bg-scan-blue/10 rounded-full p-1">
                              <div className="w-5 h-5 rounded-full bg-scan-blue flex items-center justify-center text-white text-xs">
                                4
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Order your physical card</h4>
                              <p className="text-gray-600 text-sm mt-1">
                                Get a premium business card with your QR code printed on it.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="order" forceMount className="h-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Your Smart Business Card</CardTitle>
                      <CardDescription>
                        Get a premium physical card with your QR code
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <Card3D className="mx-auto mb-6" />
                          <div className="space-y-4">
                            <div className="flex space-x-2">
                              <div className="w-4 h-4 rounded-full bg-black"></div>
                              <div className="w-4 h-4 rounded-full bg-scan-blue"></div>
                              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                              <div className="w-4 h-4 rounded-full bg-white border"></div>
                            </div>
                            <h3 className="font-semibold">Premium NFC-Enabled Card</h3>
                            <ul className="space-y-2">
                              <li className="flex items-center">
                                <div className="mr-2 text-scan-blue">✓</div>
                                High-quality metal construction
                              </li>
                              <li className="flex items-center">
                                <div className="mr-2 text-scan-blue">✓</div>
                                QR code & NFC technology
                              </li>
                              <li className="flex items-center">
                                <div className="mr-2 text-scan-blue">✓</div>
                                Customized with your details
                              </li>
                              <li className="flex items-center">
                                <div className="mr-2 text-scan-blue">✓</div>
                                Free shipping worldwide
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div>
                          <div className="glass-card p-6 mb-6">
                            <h3 className="font-bold text-lg mb-4">Billing Information</h3>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                                  <Input id="firstName" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                                  <Input id="lastName" placeholder="Doe" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                <Input id="email" type="email" placeholder="john@example.com" />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                                <Input id="phone" placeholder="+1 (555) 123-4567" />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="address" className="text-sm font-medium">Address</label>
                                <Input id="address" placeholder="123 Main St" />
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-1">
                                  <label htmlFor="city" className="text-sm font-medium">City</label>
                                  <Input id="city" placeholder="New York" />
                                </div>
                                <div className="space-y-2 col-span-1">
                                  <label htmlFor="state" className="text-sm font-medium">State</label>
                                  <Input id="state" placeholder="NY" />
                                </div>
                                <div className="space-y-2 col-span-1">
                                  <label htmlFor="zip" className="text-sm font-medium">ZIP</label>
                                  <Input id="zip" placeholder="10001" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-scan-blue/10 rounded-lg mb-6">
                            <div>
                              <p className="text-sm">Premium Card</p>
                              <p className="text-lg font-bold">$49.00</p>
                            </div>
                            <Button onClick={orderCard}>
                              Complete Order
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500 text-center">
                            By ordering, you agree to our Terms of Service and Privacy Policy
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shipping" forceMount className="h-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Status</CardTitle>
                      <CardDescription>
                        Track your card order and delivery
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-500">No orders yet</h3>
                          <p className="text-gray-500 mt-2 max-w-md">
                            You haven't placed an order for a physical card yet.
                            Visit the "Order Card" tab to get started.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-6"
                            onClick={() => handleTabChange('order')}
                          >
                            Order Your Card
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" forceMount className="h-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Profile Privacy</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Make profile public</p>
                                <p className="text-sm text-gray-500">
                                  Allow anyone with the link to view your profile
                                </p>
                              </div>
                              <div className="flex items-center h-6">
                                <input
                                  type="checkbox"
                                  className="toggle toggle-primary"
                                  defaultChecked
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Show email address</p>
                                <p className="text-sm text-gray-500">
                                  Display your email on your public profile
                                </p>
                              </div>
                              <div className="flex items-center h-6">
                                <input
                                  type="checkbox"
                                  className="toggle toggle-primary"
                                  defaultChecked
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Show phone number</p>
                                <p className="text-sm text-gray-500">
                                  Display your phone number on your public profile
                                </p>
                              </div>
                              <div className="flex items-center h-6">
                                <input
                                  type="checkbox"
                                  className="toggle toggle-primary"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Profile visits</p>
                                <p className="text-sm text-gray-500">
                                  Get notified when someone views your profile
                                </p>
                              </div>
                              <div className="flex items-center h-6">
                                <input
                                  type="checkbox"
                                  className="toggle toggle-primary"
                                  defaultChecked
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Product updates</p>
                                <p className="text-sm text-gray-500">
                                  Receive updates about new features and improvements
                                </p>
                              </div>
                              <div className="flex items-center h-6">
                                <input
                                  type="checkbox"
                                  className="toggle toggle-primary"
                                  defaultChecked
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
                          <Card className="bg-red-50 border-red-200">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-red-800">Delete Account</p>
                                  <p className="text-sm text-red-600">
                                    Permanently delete your account and all data
                                  </p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="ml-auto">Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
