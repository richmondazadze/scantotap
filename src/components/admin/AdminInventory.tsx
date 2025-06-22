import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertCircle, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import inventoryService, { CardType, ColorScheme, InventoryUpdateRequest } from '@/services/inventoryService';

interface EditFormData {
  name: string;
  description: string;
  is_available: boolean;
  has_stock_limit: boolean;
  stock_quantity: number | null;
  price_modifier: number;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

const AdminInventory: React.FC = () => {
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('card-types');
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    type: 'card_type' | 'color_scheme' | null;
    item: (CardType | ColorScheme) | null;
    isNew: boolean;
  }>({ open: false, type: null, item: null, isNew: false });

  const [editForm, setEditForm] = useState<EditFormData>({
    name: '',
    description: '',
    is_available: true,
    has_stock_limit: false,
    stock_quantity: null,
    price_modifier: 0,
    primary_color: '#1e3a8a',
    secondary_color: '#3b82f6',
    accent_color: '#60a5fa'
  });

  // Pending changes for bulk operations
  const [pendingChanges, setPendingChanges] = useState<{
    cardTypes: InventoryUpdateRequest[];
    colorSchemes: InventoryUpdateRequest[];
  }>({
    cardTypes: [],
    colorSchemes: []
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const inventory = await inventoryService.getAllInventory();
      setCardTypes(inventory.cardTypes);
      setColorSchemes(inventory.colorSchemes);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (type: 'card_type' | 'color_scheme', item?: CardType | ColorScheme) => {
    if (item) {
      setEditForm({
        name: item.name,
        description: item.description || '',
        is_available: item.is_available,
        has_stock_limit: item.has_stock_limit,
        stock_quantity: item.stock_quantity,
        price_modifier: item.price_modifier,
        ...(type === 'color_scheme' && 'primary_color' in item && {
          primary_color: item.primary_color,
          secondary_color: item.secondary_color || '',
          accent_color: item.accent_color || ''
        })
      });
      setEditDialog({ open: true, type, item, isNew: false });
    } else {
      // New item creation - only allowed for color schemes
      if (type === 'card_type') {
        toast.error('Card types are managed in the database');
        return;
      }
      
      setEditForm({
        name: '',
        description: '',
        is_available: true,
        has_stock_limit: false,
        stock_quantity: null,
        price_modifier: 0,
        primary_color: '#1e3a8a',
        secondary_color: '#3b82f6',
        accent_color: '#60a5fa'
      });
      setEditDialog({ open: true, type, item: null, isNew: true });
    }
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, type: null, item: null, isNew: false });
    setEditForm({
      name: '',
      description: '',
      is_available: true,
      has_stock_limit: false,
      stock_quantity: null,
      price_modifier: 0,
      primary_color: '#1e3a8a',
      secondary_color: '#3b82f6',
      accent_color: '#60a5fa'
    });
  };

  const handleSaveItem = async () => {
    try {
      setSaving(true);
      const { type, item, isNew } = editDialog;
      
      if (!type) return;

      const itemData = {
        name: editForm.name,
        description: editForm.description,
        is_available: editForm.is_available,
        has_stock_limit: editForm.has_stock_limit,
        stock_quantity: editForm.has_stock_limit ? editForm.stock_quantity : null,
        price_modifier: editForm.price_modifier,
        ...(type === 'color_scheme' && {
          primary_color: editForm.primary_color,
          secondary_color: editForm.secondary_color,
          accent_color: editForm.accent_color
        })
      };

      if (isNew) {
        // Create new item (only for color schemes)
        if (type === 'color_scheme') {
          const newItem = await inventoryService.createColorScheme(itemData);
          setColorSchemes(prev => [...prev, newItem]);
        }
        toast.success(`${type.replace('_', ' ')} created successfully`);
      } else {
        // Update existing item
        if (!item) return;
        
        if (type === 'card_type') {
          const updatedItem = await inventoryService.updateCardType(item.id, itemData);
          setCardTypes(prev => prev.map(ct => ct.id === item.id ? updatedItem : ct));
        } else if (type === 'color_scheme') {
          const updatedItem = await inventoryService.updateColorScheme(item.id, itemData);
          setColorSchemes(prev => prev.map(cs => cs.id === item.id ? updatedItem : cs));
        }
        toast.success(`${type.replace('_', ' ')} updated successfully`);
      }

      closeEditDialog();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (type: 'color_scheme', id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      if (type === 'color_scheme') {
        await inventoryService.deleteColorScheme(id);
        setColorSchemes(prev => prev.filter(cs => cs.id !== id));
      }
      toast.success(`${type.replace('_', ' ')} deleted successfully`);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const addPendingChange = (type: 'cardTypes' | 'colorSchemes', change: InventoryUpdateRequest) => {
    setPendingChanges(prev => ({
      ...prev,
      [type]: [...prev[type].filter(c => c.id !== change.id), change]
    }));
  };

  const handleQuickToggle = (
    type: 'cardTypes' | 'colorSchemes',
    id: string,
    field: 'is_available' | 'has_stock_limit',
    value: boolean
  ) => {
    addPendingChange(type, { id, [field]: value });
    
    // Update UI optimistically
    if (type === 'cardTypes') {
      setCardTypes(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    } else if (type === 'colorSchemes') {
      setColorSchemes(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    }
  };

  const handleStockChange = (
    type: 'colorSchemes',
    id: string,
    stock_quantity: number
  ) => {
    addPendingChange(type, { id, stock_quantity });
    
    // Update UI optimistically
    if (type === 'colorSchemes') {
      setColorSchemes(prev => prev.map(item => 
        item.id === id ? { ...item, stock_quantity } : item
      ));
    }
  };

  const savePendingChanges = async () => {
    try {
      setSaving(true);
      
      const promises = [];
      
      if (pendingChanges.cardTypes.length > 0) {
        promises.push(inventoryService.bulkUpdateCardTypes(pendingChanges.cardTypes));
      }
      
      if (pendingChanges.colorSchemes.length > 0) {
        promises.push(inventoryService.bulkUpdateColorSchemes(pendingChanges.colorSchemes));
      }
      
      await Promise.all(promises);
      
      // Clear pending changes
      setPendingChanges({
        cardTypes: [],
        colorSchemes: []
      });
      
      toast.success('Changes saved successfully');
      
      // Reload inventory to get fresh data
      await loadInventory();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (item: CardType | ColorScheme) => {
    if (!item.has_stock_limit) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Unlimited</Badge>;
    }
    
    const stock = item.stock_quantity || 0;
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= 5) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Low Stock ({stock})</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock ({stock})</Badge>;
    }
  };

  const renderInventoryTable = (
    items: (CardType | ColorScheme)[],
    type: 'cardTypes' | 'colorSchemes',
    itemType: 'card_type' | 'color_scheme'
  ) => {
    if (!items || items.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">No {itemType.replace('_', ' ')}s found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {(items || []).map((item) => (
          <Card key={item.id} className="relative">
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4">
                {/* Row 1: Title and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {item.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStockStatus(item)}
                    <Badge variant={item.is_available ? "default" : "secondary"}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>

                {/* Row 2: Controls */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="flex items-center gap-3">
                    <Label className="text-xs sm:text-sm font-medium min-w-0 flex-shrink-0">Available</Label>
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={(checked) => handleQuickToggle(type, item.id, 'is_available', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Label className="text-xs sm:text-sm font-medium min-w-0 flex-shrink-0">Stock Limit</Label>
                    <Switch
                      checked={item.has_stock_limit}
                      onCheckedChange={(checked) => handleQuickToggle(type, item.id, 'has_stock_limit', checked)}
                    />
                  </div>
                  
                  {item.has_stock_limit && (
                    <div className="flex items-center gap-3">
                      <Label className="text-xs sm:text-sm font-medium min-w-0 flex-shrink-0">Stock Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.stock_quantity || 0}
                        onChange={(e) => 
                          handleStockChange(type as 'colorSchemes', item.id, parseInt(e.target.value) || 0)
                        }
                        className="w-full sm:w-24 h-8 text-sm"
                      />
                    </div>
                  )}
                  
                  {/* Row 3: Action buttons */}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(itemType, item)}
                      className="h-8 px-3"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    {itemType === 'color_scheme' && (
                      <Button
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteItem(itemType as 'color_scheme', item.id)}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(itemType, item)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        {itemType === 'color_scheme' && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteItem(itemType as 'color_scheme', item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const hasPendingChanges = pendingChanges.cardTypes.length > 0 || pendingChanges.colorSchemes.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage card types and color schemes availability and stock
          </p>
        </div>
        
        {hasPendingChanges && (
          <Button 
            onClick={savePendingChanges} 
            disabled={saving}
            className="w-full sm:w-auto bg-scan-blue hover:bg-scan-blue/90"
          >
            {saving ? 'Saving...' : `Save Changes (${pendingChanges.cardTypes.length + pendingChanges.colorSchemes.length})`}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card-types">Card Types</TabsTrigger>
          <TabsTrigger value="color-schemes">Color Schemes</TabsTrigger>
        </TabsList>

        <TabsContent value="card-types" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold capitalize">Card Types</h3>
                <p className="text-sm text-muted-foreground">
                  Manage availability and stock status of card designs
                </p>
              </div>
            </div>
            {renderInventoryTable(cardTypes, 'cardTypes', 'card_type')}
          </div>
        </TabsContent>

        <TabsContent value="color-schemes" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold capitalize">Color Schemes</h3>
                <p className="text-sm text-muted-foreground">
                  Manage color schemes inventory and stock levels
                </p>
              </div>
              <Button
                onClick={() => openEditDialog('color_scheme')}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Color Scheme
              </Button>
            </div>
            {renderInventoryTable(colorSchemes, 'colorSchemes', 'color_scheme')}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDialog.isNew ? 'Create' : 'Edit'} {editDialog.type?.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription>
              {editDialog.isNew ? 'Add a new' : 'Update the'} {editDialog.type?.replace('_', ' ')} details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                disabled={editDialog.type === 'card_type'} // Card type names are from database
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                disabled={editDialog.type === 'card_type'} // Card type descriptions are from database
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_available" className="text-right">Available</Label>
              <Switch
                id="is_available"
                checked={editForm.is_available}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_available: checked }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="has_stock_limit" className="text-right">Stock Limit</Label>
              <Switch
                id="has_stock_limit"
                checked={editForm.has_stock_limit}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, has_stock_limit: checked }))}
              />
            </div>

            {editForm.has_stock_limit && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock_quantity" className="text-right">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={editForm.stock_quantity || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                  className="col-span-3"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price_modifier" className="text-right">Price Modifier</Label>
              <Input
                id="price_modifier"
                type="number"
                value={editForm.price_modifier}
                onChange={(e) => setEditForm(prev => ({ ...prev, price_modifier: parseFloat(e.target.value) || 0 }))}
                className="col-span-3"
                disabled={editDialog.type === 'card_type'} // Card type prices are from database
              />
            </div>

            {editDialog.type === 'color_scheme' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="primary_color" className="text-right">Primary Color</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={editForm.primary_color}
                    onChange={(e) => setEditForm(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="col-span-3 h-10"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="secondary_color" className="text-right">Secondary Color</Label>
                  <Input
                    id="secondary_color"
                    type="color"
                    value={editForm.secondary_color}
                    onChange={(e) => setEditForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="col-span-3 h-10"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accent_color" className="text-right">Accent Color</Label>
                  <Input
                    id="accent_color"
                    type="color"
                    value={editForm.accent_color}
                    onChange={(e) => setEditForm(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="col-span-3 h-10"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button variant="outline" onClick={closeEditDialog} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editDialog.isNew ? 'Create' : 'Update'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInventory;
