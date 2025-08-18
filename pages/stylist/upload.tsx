import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/client";

export default function UploadStylistBundle() {
  const [storeId, setStoreId] = useState("");
  const [storeList, setStoreList] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [type, setType] = useState("Bundle");
  const [user, setUser] = useState<{ id: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndStores = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;
      setUser(currentUser);

      if (currentUser) {
        // Since we don't have a stores table, we'll use the user's profile
        // For now, create a default store entry
        setStoreList([{ id: currentUser.id, name: "My Styling Service" }]);
      }
    };

    void fetchUserAndStores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to upload.");
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        name: title,
        price: parseFloat(price),
        image_url: imageUrl || null,
        description,
        store_id: storeId,
        type,
      },
    ]);

    if (error) {
      alert("Error uploading: " + error.message);
    } else {
      alert("Bundle uploaded!");
      void router.push("/stylist/dashboard");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Upload Styling Bundle</h1>
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
          Product Type:
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="Clothing">Clothing</option>
            <option value="Accessory">Accessory</option>
            <option value="Bundle">Bundle</option>
            <option value="Shoes">Shoes</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <br />
        <label>
          Bundle Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Price:
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Image URL:
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        <br />
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
