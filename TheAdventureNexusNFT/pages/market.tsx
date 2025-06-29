import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { getContractWithSigner } from "../utils/contract";

export default function MarketPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const querySnapshot = await getDocs(collection(db, "nft-listings"));
      const data = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.listed);
      setItems(data);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const handleBuy = async (item: any) => {
    try {
      const { contract, signer } = await getContractWithSigner();
      const tx = await contract.transferFrom(item.owner, await signer.getAddress(), item.tokenId);
      await tx.wait();

      const itemRef = doc(db, "nft-listings", item.id);
      await updateDoc(itemRef, {
        listed: false,
        newOwner: await signer.getAddress()
      });

      alert("✅ Berhasil membeli NFT!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal membeli NFT");
    }
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">🛒 Marketplace</h1>
      {loading ? (
        <p>Memuat NFT...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow">
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover mb-2" />
              <p className="font-bold">ID: {item.tokenId}</p>
              <p>{item.description}</p>
              <button
                onClick={() => handleBuy(item)}
                className="mt-2 w-full bg-green-600 text-white py-1 rounded"
              >
                Beli NFT
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}