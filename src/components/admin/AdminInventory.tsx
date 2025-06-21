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
import inventoryService, { CardType, Material, ColorScheme, InventoryUpdateRequest } from '@/services/inventoryService';

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
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('card-types');
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    type: 'card_type' | 'material' | 'color_scheme' | null;
    item: (CardType | Material | ColorScheme) | null;
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
    materials: InventoryUpdateRequest[];
    colorSchemes: InventoryUpdateRequest[];
  }>({
    cardTypes: [],
    materials: [],
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
      setMaterials(inventory.materials);
      setColorSchemes(inventory.colorSchemes);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (
    type: 'card_type' | 'material' | 'color_scheme',
    item?: CardType | Material | ColorScheme
  ) => {
    const isNew = !item;
    
    if (item) {
      setEditForm({
        name: item.name,
        description: item.description || '',
        is_available: item.is_available,
        has_stock_limit: item.has_stock_limit,
        stock_quantity: item.stock_quantity,
        price_modifier: item.price_modifier,
        primary_color: 'primary_color' in item ? item.primary_color : '#1e3a8a',
        secondary_color: 'secondary_color' in item ? item.secondary_color || '#3b82f6' : '#3b82f6',
        accent_color: 'accent_color' in item ? item.accent_color || '#60a5fa' : '#60a5fa'
      });
    } else {
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
    }

    setEditDialog({ open: true, type, item, isNew });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, type: null, item: null, isNew: false });
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
        // Create new item
        if (type === 'card_type') {
          const newItem = await inventoryService.createCardType(itemData);
          setCardTypes(prev => [...prev, newItem]);
        } else if (type === 'material') {
          const newItem = await inventoryService.createMaterial(itemData);
          setMaterials(prev => [...prev, newItem]);
        } else if (type === 'color_scheme') {
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
        } else if (type === 'material') {
          const updatedItem = await inventoryService.updateMaterial(item.id, itemData);
          setMaterials(prev => prev.map(m => m.id === item.id ? updatedItem : m));
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

  const handleDeleteItem = async (type: 'card_type' | 'material' | 'color_scheme', id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      if (type === 'card_type') {
        await inventoryService.deleteCardType(id);
        setCardTypes(prev => prev.filter(ct => ct.id !== id));
      } else if (type === 'material') {
        await inventoryService.deleteMaterial(id);
        setMaterials(prev => prev.filter(m => m.id !== id));
      } else if (type === 'color_scheme') {
        await inventoryService.deleteColorScheme(id);
        setColorSchemes(prev => prev.filter(cs => cs.id !== id));
      }
      toast.success(`${type.replace('_', ' ')} deleted successfully`);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const addPendingChange = (type: 'cardTypes' | 'materials' | 'colorSchemes', change: InventoryUpdateRequest) => {
    setPendingChanges(prev => ({
      ...prev,
      [type]: [...prev[type].filter(c => c.id !== change.id), change]
    }));
  };

  const handleQuickToggle = (
    type: 'cardTypes' | 'materials' | 'colorSchemes',
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
    } else if (type === 'materials') {
      setMaterials(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    } else if (type === 'colorSchemes') {
      setColorSchemes(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    }
  };

  const handleStockChange = (
    type: 'cardTypes' | 'materials' | 'colorSchemes',
    id: string,
    stock_quantity: number
  ) => {
    addPendingChange(type, { id, stock_quantity });
    
    // Update UI optimistically
    if (type === 'cardTypes') {
      setCardTypes(prev => prev.map(item => 
        item.id === id ? { ...item, stock_quantity } : item
      ));
    } else if (type === 'materials') {
      setMaterials(prev => prev.map(item => 
        item.id === id ? { ...item, stock_quantity } : item
      ));
    } else if (type === 'colorSchemes') {
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
      if (pendingChanges.materials.length > 0) {
        promises.push(inventoryService.bulkUpdateMaterials(pendingChanges.materials));
      }
      if (pendingChanges.colorSchemes.length > 0) {
        promises.push(inventoryService.bulkUpdateColorSchemes(pendingChanges.colorSchemes));
      }

      await Promise.all(promises);
      
      setPendingChanges({ cardTypes: [], materials: [], colorSchemes: [] });
      toast.success('All changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
      await loadInventory(); // Reload to get current state
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (item: CardType | Material | ColorScheme) => {
    if (!item.has_stock_limit) {
      return <Badge variant="secondary">Unlimited</Badge>;
    }
    
    if (item.stock_quantity === null || item.stock_quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    
    if (item.stock_quantity < 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock ({item.stock_quantity})</Badge>;
    }
    
    return <Badge variant="default">In Stock ({item.stock_quantity})</Badge>;
  };

  const renderInventoryTable = (
    items: (CardType | Material | ColorScheme)[],
    type: 'cardTypes' | 'materials' | 'colorSchemes',
    itemType: 'card_type' | 'material' | 'color_scheme'
  ) => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold capitalize">{type.replace(/([A-Z])/g, ' $1')}</h3>
        <Button onClick={() => openEditDialog(itemType)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add {itemType.replace('_', ' ')}
        </Button>
      </div>
      
      {/* Mobile-first responsive grid */}
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`${!item.is_available ? 'opacity-60' : ''} transition-all`}>
            <CardContent className="p-4">
              {/* Mobile-optimized layout */}
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-medium text-sm sm:text-base truncate">{item.name}</h4>
                      {item.is_available ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Color scheme preview - mobile optimized */}
                    {itemType === 'color_scheme' && 'primary_color' in item && (
                      <div className="flex gap-1 mb-2">
                        <div 
                          className="w-4 h-4 rounded border" 
                          style={{ backgroundColor: item.primary_color }}
                          title={`Primary: ${item.primary_color}`}
                        />
                        {item.secondary_color && (
                          <div 
                            className="w-4 h-4 rounded border" 
                            style={{ backgroundColor: item.secondary_color }}
                            title={`Secondary: ${item.secondary_color}`}
                          />
                        )}
                        {item.accent_color && (
                          <div 
                            className="w-4 h-4 rounded border" 
                            style={{ backgroundColor: item.accent_color }}
                            title={`Accent: ${item.accent_color}`}
                          />
                        )}
                      </div>
                    )}
                    
                    {item.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  
                  {/* Mobile menu for actions */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(itemType, item)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteItem(itemType, item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Status and Price Section */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  {getStockStatus(item)}
                  
                  {item.price_modifier !== 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.price_modifier > 0 ? '+' : ''}₵{item.price_modifier}
                    </Badge>
                  )}
                </div>
                
                <Separator />
                
                {/* Controls Section - Mobile Optimized */}
                <div className="space-y-3">
                  {/* Row 1: Main toggles */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <Label className="text-xs sm:text-sm font-medium">Available</Label>
                      <Switch
                        checked={item.is_available}
                        onCheckedChange={(checked) => 
                          handleQuickToggle(type, item.id, 'is_available', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <Label className="text-xs sm:text-sm font-medium">Stock Limit</Label>
                      <Switch
                        checked={item.has_stock_limit}
                        onCheckedChange={(checked) => 
                          handleQuickToggle(type, item.id, 'has_stock_limit', checked)
                        }
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Stock input (when enabled) */}
                  {item.has_stock_limit && (
                    <div className="flex items-center gap-3">
                      <Label className="text-xs sm:text-sm font-medium min-w-0 flex-shrink-0">Stock Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.stock_quantity || 0}
                        onChange={(e) => 
                          handleStockChange(type, item.id, parseInt(e.target.value) || 0)
                        }
                        className="w-full sm:w-24 h-8 text-sm"
                      />
                    </div>
                  )}
                  
                  {/* Row 3: Desktop action buttons */}
                  <div className="hidden sm:flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(itemType, item)}
                      className="text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(itemType, item.id)}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Empty state */}
        {items.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-3">No {itemType.replace('_', ' ')}s found</p>
              <Button onClick={() => openEditDialog(itemType)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add first {itemType.replace('_', ' ')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const hasPendingChanges = 
    pendingChanges.cardTypes.length > 0 ||
    pendingChanges.materials.length > 0 ||
    pendingChanges.colorSchemes.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold">Inventory Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage card types, materials, and color schemes</p>
        </div>
        
        {/* Pending changes notification - Mobile friendly */}
        {hasPendingChanges && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-sm text-orange-600 flex-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">
                {pendingChanges.cardTypes.length + pendingChanges.materials.length + pendingChanges.colorSchemes.length} pending changes
              </span>
            </div>
            <Button onClick={savePendingChanges} disabled={saving} size="sm" className="w-full sm:w-auto">
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs - Mobile Responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="card-types" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Card Types</span>
              <span className="sm:hidden">Cards</span>
              <span className="ml-1">({cardTypes.length})</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Materials</span>
              <span className="sm:hidden">Materials</span>
              <span className="ml-1">({materials.length})</span>
            </TabsTrigger>
            <TabsTrigger value="color-schemes" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Color Schemes</span>
              <span className="sm:hidden">Colors</span>
              <span className="ml-1">({colorSchemes.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="card-types" className="mt-4 sm:mt-6">
          {renderInventoryTable(cardTypes, 'cardTypes', 'card_type')}
        </TabsContent>

        <TabsContent value="materials" className="mt-4 sm:mt-6">
          {renderInventoryTable(materials, 'materials', 'material')}
        </TabsContent>

        <TabsContent value="color-schemes" className="mt-4 sm:mt-6">
          {renderInventoryTable(colorSchemes, 'colorSchemes', 'color_scheme')}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog - Mobile Responsive */}
      <Dialog open={editDialog.open} onOpenChange={closeEditDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editDialog.isNew ? 'Create' : 'Edit'} {editDialog.type?.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editDialog.isNew ? 'Add a new' : 'Update the'} {editDialog.type?.replace('_', ' ')} configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description (optional)"
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            {/* Color scheme section - Mobile optimized */}
            {editDialog.type === 'color_scheme' && (
              <div className="space-y-4">
                <Separator />
                <h4 className="text-sm font-medium">Colors</h4>
                
                <div>
                  <Label htmlFor="primary_color" className="text-sm">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primary_color"
                      type="color"
                      value={editForm.primary_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={editForm.primary_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, primary_color: e.target.value }))}
                      placeholder="#1e3a8a"
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color" className="text-sm">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={editForm.secondary_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={editForm.secondary_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                      placeholder="#3b82f6"
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent_color" className="text-sm">Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="accent_color"
                      type="color"
                      value={editForm.accent_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={editForm.accent_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      placeholder="#60a5fa"
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="price_modifier" className="text-sm font-medium">Price Modifier (₵)</Label>
              <Input
                id="price_modifier"
                type="number"
                step="0.01"
                value={editForm.price_modifier}
                onChange={(e) => setEditForm(prev => ({ ...prev, price_modifier: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <Separator />

            {/* Toggles - Mobile optimized */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Available</Label>
                <Switch
                  checked={editForm.is_available}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_available: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Stock Limit</Label>
                <Switch
                  checked={editForm.has_stock_limit}
                  onCheckedChange={(checked) => setEditForm(prev => ({ 
                    ...prev, 
                    has_stock_limit: checked,
                    stock_quantity: checked ? (editForm.stock_quantity || 0) : null
                  }))}
                />
              </div>
            </div>

            {editForm.has_stock_limit && (
              <div>
                <Label htmlFor="stock_quantity" className="text-sm font-medium">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={editForm.stock_quantity || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            )}

            {/* Action buttons - Mobile optimized */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button variant="outline" onClick={closeEditDialog} className="flex-1 order-2 sm:order-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveItem} 
                disabled={saving || !editForm.name.trim()} 
                className="flex-1 order-1 sm:order-2"
              >
                {saving ? 'Saving...' : editDialog.isNew ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInventory; 