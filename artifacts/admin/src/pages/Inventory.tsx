import { useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertCircle, Image as ImageIcon, X, Save, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  spaId: string;
}

const getStatus = (stock: number) => {
  if (stock === 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
};

const CATEGORIES = ["Skincare", "Haircare", "Body", "Nails", "Tools", "Other"];
const EMPTY_PRODUCT = { name: "", category: "Skincare", price: 0, stock: 0, image: "" };

export default function Inventory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch products from API filtered by the logged-in spa owner's spa
  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ["products", user?.spaId],
    queryFn: () => customFetch<Product[]>(`/api/products${user?.spaId ? `?spaId=${user.spaId}` : ""}`),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => customFetch("/api/products", { method: "POST", body: JSON.stringify({ ...data, spaId: user?.spaId }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product added", description: "Product is now visible on the app." });
      setNewProduct({ ...EMPTY_PRODUCT });
      setIsAdding(false);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customFetch(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated", description: "Changes are now live on the app." });
      setEditingProduct(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customFetch(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
      setDeleteConfirm(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Inventory & Products</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage retail products, stock levels, and store inventory. Changes appear immediately on the mobile app.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{products.length}</div></CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Low / Out of Stock</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{lowStockCount} / {outOfStockCount}</div></CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">KSH {totalValue.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add New Product</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input placeholder="e.g. Shea Butter Lotion" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Price (KSH)</Label>
                  <Input type="number" placeholder="0" value={newProduct.price || ""} onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Initial Stock</Label>
                <Input type="number" placeholder="0" value={newProduct.stock || ""} onChange={e => setNewProduct(p => ({ ...p, stock: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Image URL (optional)</Label>
                <Input placeholder="https://..." value={newProduct.image} onChange={e => setNewProduct(p => ({ ...p, image: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => createMutation.mutate(newProduct)}
                  disabled={createMutation.isPending || !newProduct.name.trim()}
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Product</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={editingProduct.name} onChange={e => setEditingProduct(p => p ? { ...p, name: e.target.value } : p)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editingProduct.category} onChange={e => setEditingProduct(p => p ? { ...p, category: e.target.value } : p)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Price (KSH)</Label>
                  <Input type="number" value={editingProduct.price} onChange={e => setEditingProduct(p => p ? { ...p, price: Number(e.target.value) } : p)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" value={editingProduct.stock} onChange={e => setEditingProduct(p => p ? { ...p, stock: Number(e.target.value) } : p)} />
              </div>
              <div className="space-y-2">
                <Label>Image URL (optional)</Label>
                <Input placeholder="https://..." value={editingProduct.image || ""} onChange={e => setEditingProduct(p => p ? { ...p, image: e.target.value } : p)} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditingProduct(null)}>Cancel</Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => updateMutation.mutate({ id: editingProduct.id, data: editingProduct })}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-destructive">Confirm Delete</CardTitle>
              <CardDescription>This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to remove <strong>{products.find(p => p.id === deleteConfirm)?.name}</strong> from the inventory?</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => deleteMutation.mutate(deleteConfirm!)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white/80 backdrop-blur-lg border-white/40 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>View and manage your retail items — changes are live on the mobile app instantly</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products..." className="pl-9 bg-white/50 border-white/60 focus:bg-white" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 bg-white/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (KSH)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => {
                  const status = getStatus(product.stock);
                  return (
                    <TableRow key={product.id} className="hover:bg-white/60 transition-colors">
                      <TableCell>
                        <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-muted-foreground overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 opacity-50" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{product.category}</Badge></TableCell>
                      <TableCell className="font-semibold">KSH {product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={product.stock < 10 ? "text-destructive font-bold flex items-center gap-1" : ""}>
                          {product.stock < 10 && <AlertCircle className="w-3 h-3" />}
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status === "In Stock" ? "default" : status === "Low Stock" ? "secondary" : "destructive"}
                          className={status === "In Stock" ? "bg-green-100 text-green-700 border-green-200" : status === "Low Stock" ? "bg-amber-100 text-amber-700 border-amber-200" : ""}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditingProduct(product)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteConfirm(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No products found. Click "Add Product" to get started.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
