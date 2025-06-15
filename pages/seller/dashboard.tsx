import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import AuthGuard from '@/components/AuthGuard';

// Progress helper for order status
const getProgress = (status: string) => {
  switch (status) {
    case 'pending': return 20;
    case 'packed': return 40;
    case 'ready_for_pickup': return 60;
    case 'picked_up': return 80;
    case 'delivered': return 100;
    default: return 0;
  }
};

export default function SellerDashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    statusCounts: {
      pending: 0,
      packed: 0,
      ready_for_pickup: 0,
      picked_up: 0,
      delivered: 0
    }
  });

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user;
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (profile?.role !== 'seller') {
        window.location.href = '/unauthorized';
      }
    };

    checkRole();
  }, []);

  const fetchProducts = async () => {
    const session = await supabase.auth.getSession()
    const seller_id = session.data.session?.user.id

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', seller_id)

    if (!error) {
      setProducts(data || [])
      setAnalytics(prev => ({ ...prev, totalProducts: (data || []).length }));
    }
  }

  const fetchOrders = async () => {
    const session = await supabase.auth.getSession();
    const seller_id = session.data.session?.user.id;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false });

    if (!error) {
      setOrders(data || []);
      const revenue = (data || []).reduce((sum, order) => sum + (order.total || 0), 0);
      const statusCounts = {
        pending: 0,
        packed: 0,
        ready_for_pickup: 0,
        picked_up: 0,
        delivered: 0
      };

      (data || []).forEach(order => {
        if (statusCounts.hasOwnProperty(order.status)) {
          statusCounts[order.status]++;
        }
      });

      setAnalytics(prev => ({
        ...prev,
        totalOrders: (data || []).length,
        totalRevenue: revenue,
        statusCounts
      }));
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [])

  // Update order status handler
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order status:', error.message);
      return;
    }

    fetchOrders();
  };

  return (
    <AuthGuard role="seller">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold">Store Analytics</h2>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-gray-100 p-4 rounded shadow">
            <p><strong>Total Products:</strong> {analytics.totalProducts}</p>
            <p><strong>Total Orders:</strong> {analytics.totalOrders}</p>
            <p><strong>Total Revenue:</strong> ${analytics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <p><strong>Order Status Counts:</strong></p>
            <ul className="list-disc list-inside">
              <li>Pending: {analytics.statusCounts.pending}</li>
              <li>Packed: {analytics.statusCounts.packed}</li>
              <li>Ready: {analytics.statusCounts.ready_for_pickup}</li>
              <li>Picked Up: {analytics.statusCounts.picked_up}</li>
              <li>Delivered: {analytics.statusCounts.delivered}</li>
            </ul>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">StreetStashed Seller Hub</h1>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Reload My Products
        </button>
        <h2 className="text-xl font-semibold">Seller Profile</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Current Profile Image:</p>
          {typeof window !== 'undefined' && (
            <img
              src={sessionStorage.getItem('profile_image') || '/default-avatar.png'}
              alt="Current profile"
              className="w-24 h-24 rounded-full border mt-2"
            />
          )}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fileInput = (e.target as HTMLFormElement).elements.namedItem('avatar') as HTMLInputElement;
            const file = fileInput.files?.[0];
            if (!file) return;

            const session = await supabase.auth.getSession();
            const userId = session.data.session?.user.id;

            const { data, error } = await supabase.storage
              .from('avatars')
              .upload(`users/${userId}/profile.png`, file, { upsert: true });

            if (!error) {
              const publicURL = supabase.storage
                .from('avatars')
                .getPublicUrl(`users/${userId}/profile.png`).data.publicUrl;

              await supabase.from('profiles')
                .update({ profile_image: publicURL })
                .eq('id', userId);

              sessionStorage.setItem('profile_image', publicURL);
              alert("Profile image updated!");
            } else {
              console.error(error.message);
              alert("Failed to upload image.");
            }
          }}
          className="space-y-4 mb-6"
        >
          <input type="file" name="avatar" accept="image/*" className="border p-2 w-full rounded" required />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">Upload Profile Image</button>
        </form>
        <h2 className="text-xl font-semibold">Upload New Product</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const price = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value);
            const image = (form.elements.namedItem('image') as HTMLInputElement).value;
            const description = (form.elements.namedItem('description') as HTMLInputElement).value;
            const category = (form.elements.namedItem('category') as HTMLInputElement).value;

            const session = await supabase.auth.getSession();
            const seller_id = session.data.session?.user.id;

            const { error } = await supabase
              .from('products')
              .insert([
                {
                  name,
                  price,
                  image_url: image,
                  seller_id: seller_id || 'mock-seller-id',
                  status: 'active',
                  description,
                  category
                }
              ]);

            if (error) {
              console.error('Upload error:', error.message);
              setUploadMessage('Failed to upload product');
              return;
            }

            setUploadMessage('Product uploaded successfully');
            console.log('Uploaded:', { name, price, image, description, category });
            fetchProducts();
            form.reset();
          }}
          className="space-y-4 mb-6"
        >
          <input name="name" placeholder="Product Name" className="border p-2 w-full rounded" required />
          <input name="price" type="number" placeholder="Price" className="border p-2 w-full rounded" required />
          <input name="image" placeholder="Image URL" className="border p-2 w-full rounded" required />
          <input name="category" placeholder="Category" className="border p-2 w-full rounded" />
          <textarea name="description" placeholder="Description" className="border p-2 w-full rounded" rows={3}></textarea>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">Upload Product</button>
          {uploadMessage && <p className="text-sm italic">{uploadMessage}</p>}
        </form>
        <h2 className="text-xl font-semibold">Your Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500 italic">No products uploaded yet. Start by adding one above.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="border p-4 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <img src={product.image_url} alt={product.name} className="w-full sm:w-48 h-48 object-cover rounded mb-2" />
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Status:</strong> {product.status}</p>
              </div>
            </div>
          ))
        )}
        <h2 className="text-xl font-semibold mt-8">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 italic">No orders found for your products yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border p-4 rounded shadow mt-2 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> ${order.total}</p>
                <p className="text-sm text-gray-500">Created: {new Date(order.created_at).toLocaleString()}</p>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Pending</span>
                    <span>Packed</span>
                    <span>Ready</span>
                    <span>Picked</span>
                    <span>Delivered</span>
                  </div>
                  <div className="flex w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(order.status) >= 20 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(order.status) >= 40 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(order.status) >= 60 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(order.status) >= 80 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                    <div
                      className={`h-full transition-all duration-500 ${getProgress(order.status) >= 100 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '20%' }}
                    />
                  </div>
                </div>

                {/* Optional Tracking Field */}
                {order.status !== 'delivered' && (
                  <input
                    type="text"
                    placeholder="Tracking or driver notes (optional)"
                    className="mt-2 border p-2 rounded w-full"
                    disabled
                  />
                )}

                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'packed')}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Mark as Packed
                  </button>
                )}

                {order.status === 'packed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Mark as Ready for Pickup
                  </button>
                )}

                {order.status === 'ready_for_pickup' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'picked_up')}
                    className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded"
                  >
                    Mark as Picked Up
                  </button>
                )}

                {order.status === 'picked_up' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AuthGuard>
  )
}
