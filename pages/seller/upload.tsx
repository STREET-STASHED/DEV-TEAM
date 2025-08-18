import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/router";

export default function UploadProduct() {
  const [storeId, setStoreId] = useState("");
  const [storeList, setStoreList] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<{ id: string; subscription_tier?: string } | null>(null);
  const [deliveryTier, setDeliveryTier] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndStores = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;
      setUser(currentUser);

      if (currentUser) {
        // Since we don't have a stores table, we'll use the user's profile
        // For now, create a default store entry
        setStoreList([{ id: currentUser.id, name: "My Store" }]);
      }
    };

    void fetchUserAndStores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to upload a product.");
      return;
    }

    setUploading(true);
    const { error } = await supabase.from("products").insert([
      {
        name,
        price: parseFloat(price),
        image_url: imageUrl || null,
        description,
        quantity: parseInt(quantity),
        store_id: storeId,
        delivery_tier: deliveryTier,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Product upload failed.");
      setUploading(false);
    } else {
      alert("Product uploaded successfully!");
      setUploading(false);
      void router.push("/seller/dashboard");
    }
  };

  // Suggested Markup calculation with updated subscription tiers
  const getSuggestedMarkup = () => {
    const basePrice = parseFloat(price || "0");
    if (!basePrice) return "";

    const tierFee =
      deliveryTier === "local"
        ? 3
        : deliveryTier === "citywide"
          ? 4
          : deliveryTier === "extended"
            ? 5
            : 0;

    const subscriptionDiscount =
      user?.subscription_tier === "silver"
        ? 0.03
        : user?.subscription_tier === "gold"
          ? 0.05
          : user?.subscription_tier === "platinum"
            ? 0.07
            : user?.subscription_tier === "diamond_elite"
              ? 0.09
              : 0;

    const commissionRate = 0.15 - subscriptionDiscount;
    const markup = basePrice * (1 + commissionRate) + tierFee;

    return markup.toFixed(2);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Upload Product</h1>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <label>
          Select Store:
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            required
          >
            <option value="">Select a store</option>
            {storeList.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Product Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Price:
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Suggested Markup Price:
          <input type="text" value={getSuggestedMarkup()} readOnly />
        </label>
        <label>
          Image URL:
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            // optional for now
          />
        </label>
        <br />
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Quantity:
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Delivery Tier:
          <select
            value={deliveryTier}
            onChange={(e) => setDeliveryTier(e.target.value)}
            required
          >
            <option value="">Select Tier</option>
            <option value="local">Local (0–5mi)</option>
            <option value="citywide">Citywide (5–10mi)</option>
            <option value="extended">Extended (10–20+mi)</option>
          </select>
        </label>
        <br />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
