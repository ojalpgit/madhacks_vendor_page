import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Product } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import colors from '../utils/colors';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceBtc: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/vendor/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/api/vendor/products/${editingProduct.id}`, {
          name: formData.name || undefined,
          description: formData.description || undefined,
          priceBtc: formData.priceBtc ? parseFloat(formData.priceBtc) : undefined,
          imageUrl: formData.imageUrl || undefined,
        });
      } else {
        await api.post('/api/vendor/add-product', {
          name: formData.name,
          description: formData.description,
          priceBtc: parseFloat(formData.priceBtc),
          imageUrl: formData.imageUrl || undefined,
        });
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', priceBtc: '', imageUrl: '' });
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      priceBtc: product.priceBtc.toString(),
      imageUrl: product.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/vendor/products/${id}`);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const sbtcFromBtc = (btc: number) => (btc * 10000000).toFixed(2);

  if (loading) {
    return (
      <div className="p-8" style={{ backgroundColor: colors.background }}>
        <div className="text-center" style={{ color: colors.textDark }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8" style={{ backgroundColor: colors.background }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.textDark }}>Products</h1>
          <p className="mt-2" style={{ color: colors.textLight }}>Manage your product catalog</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', description: '', priceBtc: '', imageUrl: '' });
            setShowModal(true);
          }}
          style={{ backgroundColor: colors.accent, color: colors.white }}
        >
          <Plus size={20} className="mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className="hover:shadow-lg transition-shadow bg-white border"
            style={{ borderColor: colors.border }}
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: colors.textDark }}>{product.name}</CardTitle>
              {product.description && (
                <CardDescription style={{ color: colors.textLight }}>{product.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {product.priceBtc.toFixed(8)} BTC
                </div>
                <div className="text-lg" style={{ color: colors.textLight }}>
                  {sbtcFromBtc(product.priceBtc)} Sbtc
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  className="flex-1"
                  style={{ borderColor: colors.border, color: colors.textDark }}
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="flex-1"
                  style={{ backgroundColor: colors.error, color: colors.white }}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="text-center py-12 bg-white border" style={{ borderColor: colors.border }}>
          <CardContent>
            <p style={{ color: colors.textLight }}>No products yet. Add your first product!</p>
          </CardContent>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white border" style={{ borderColor: colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: colors.primary }}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Description
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Price (BTC) *
                  </label>
                  <Input
                    type="number"
                    step="0.00000001"
                    value={formData.priceBtc}
                    onChange={(e) => setFormData({ ...formData, priceBtc: e.target.value })}
                    required={!editingProduct}
                    placeholder="0.00015"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Image URL
                  </label>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                    }}
                    style={{ borderColor: colors.border, color: colors.textDark }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    style={{ backgroundColor: colors.accent, color: colors.white }}
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

