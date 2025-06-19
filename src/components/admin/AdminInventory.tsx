import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold capitalize">{type.replace(/([A-Z])/g, ' $1')}</h3>
        <Button onClick={() => openEditDialog(itemType)}>
          <Plus className="w-4 h-4 mr-2" />
          Add {itemType.replace('_', ' ')}
        </Button>
      </div>
      
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{item.name}</h4>
                    {itemType === 'color_scheme' && 'primary_color' in item && (
                      <div className="flex gap-1">
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
                    {item.is_available ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    {getStockStatus(item)}
                    
                    {item.price_modifier !== 0 && (
                      <Badge variant="outline">
                        {item.price_modifier > 0 ? '+' : ''}₵{item.price_modifier}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Quick toggles */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Available</Label>
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={(checked) => 
                        handleQuickToggle(type, item.id, 'is_available', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Stock Limit</Label>
                    <Switch
                      checked={item.has_stock_limit}
                      onCheckedChange={(checked) => 
                        handleQuickToggle(type, item.id, 'has_stock_limit', checked)
                      }
                    />
                  </div>
                  
                  {item.has_stock_limit && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.stock_quantity || 0}
                        onChange={(e) => 
                          handleStockChange(type, item.id, parseInt(e.target.value) || 0)
                        }
                        className="w-20 h-8"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(itemType, item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(itemType, item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-gray-600">Manage card types, materials, and color schemes</p>
        </div>
        
        {hasPendingChanges && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle className="w-4 h-4" />
              {pendingChanges.cardTypes.length + pendingChanges.materials.length + pendingChanges.colorSchemes.length} pending changes
            </div>
            <Button onClick={savePendingChanges} disabled={saving}>
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="card-types">Card Types ({cardTypes.length})</TabsTrigger>
          <TabsTrigger value="materials">Materials ({materials.length})</TabsTrigger>
          <TabsTrigger value="color-schemes">Color Schemes ({colorSchemes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="card-types" className="mt-6">
          {renderInventoryTable(cardTypes, 'cardTypes', 'card_type')}
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          {renderInventoryTable(materials, 'materials', 'material')}
        </TabsContent>

        <TabsContent value="color-schemes" className="mt-6">
          {renderInventoryTable(colorSchemes, 'colorSchemes', 'color_scheme')}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={closeEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDialog.isNew ? 'Create' : 'Edit'} {editDialog.type?.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription>
              {editDialog.isNew ? 'Add a new' : 'Update the'} {editDialog.type?.replace('_', ' ')} configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>

            {editDialog.type === 'color_scheme' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={editForm.primary_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={editForm.primary_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, primary_color: e.target.value }))}
                      placeholder="#1e3a8a"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={editForm.secondary_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={editForm.secondary_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent_color"
                      type="color"
                      value={editForm.accent_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={editForm.accent_color}
                      onChange={(e) => setEditForm(prev => ({ ...prev, accent_color: e.target.value }))}
                      placeholder="#60a5fa"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="price_modifier">Price Modifier (₵)</Label>
              <Input
                id="price_modifier"
                type="number"
                step="0.01"
                value={editForm.price_modifier}
                onChange={(e) => setEditForm(prev => ({ ...prev, price_modifier: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editForm.is_available}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_available: checked }))}
                />
                <Label>Available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editForm.has_stock_limit}
                  onCheckedChange={(checked) => setEditForm(prev => ({ 
                    ...prev, 
                    has_stock_limit: checked,
                    stock_quantity: checked ? (editForm.stock_quantity || 0) : null
                  }))}
                />
                <Label>Stock Limit</Label>
              </div>
            </div>

            {editForm.has_stock_limit && (
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={editForm.stock_quantity || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={closeEditDialog} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveItem} disabled={saving || !editForm.name.trim()} className="flex-1">
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