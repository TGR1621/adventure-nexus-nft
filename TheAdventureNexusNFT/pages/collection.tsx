import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getContractWithSigner } from "../utils/contract";

export default function CollectionPage() {
  const [myNFTs, setMyNFTs] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyNFTs = async () => {
      const { signer } = await getContractWithSigner();
      const address = await signer.getAddress();
      const querySnapshot = await getDocs(collection(db, "nft-listings"));
      const owned = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.owner === address || item.newOwner === address);
      setMyNFTs(owned);
    };
    fetchMyNFTs();
  }, []);

  const handleListNFT = async (nft: any) => {
    const price = prompt("Masukkan harga NFT dalam ETH:", "0.01");
    if (!price) return;

    try {
      const itemRef = doc(db, "nft-listings", nft.id);
      await updateDoc(itemRef, {
        listed: true,
        price: price,
      });
      alert("✅ NFT berhasil dijual!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menjual NFT");
    }
  };

  const handleEditPrice = async (nft: any) => {
    const newPrice = prompt("Masukkan harga baru untuk NFT ini:", nft.price);
    if (!newPrice) return;

    try {
      const itemRef = doc(db, "nft-listings", nft.id);
      await updateDoc(itemRef, {
        price: newPrice,
      });
      alert("✅ Harga NFT berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal memperbarui harga NFT");
    }
  };

  const handleUnlist = async (nft: any) => {
    if (!confirm("Yakin ingin membatalkan penjualan NFT ini?")) return;

    try {
      const itemRef = doc(db, "nft-listings", nft.id);
      await updateDoc(itemRef, {
        listed: false,
        price: null
      });
      alert("✅ NFT berhasil dibatalkan dari penjualan!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal membatalkan penjualan NFT");
    }
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">🎒 Koleksi NFT Saya</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {myNFTs.length === 0 ? (
          <p>Kamu belum memiliki NFT.</p>
        ) : (
          myNFTs.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow">
              <img src={item.image} alt="nft" className="w-full h-48 object-cover mb-2" />
              <p className="font-bold">ID: {item.tokenId}</p>
              <p>{item.description}</p>
              {!item.listed && (
                <button
                  onClick={() => handleListNFT(item)}
                  className="mt-2 w-full bg-yellow-500 text-white py-1 rounded"
                >
                  Jual NFT
                </button>
              )}
              {item.listed && (
                <div className="mt-2 space-y-2">
                  <p className="text-green-600 font-semibold">Telah dijual seharga {item.price} ETH</p>
                  <button
                    onClick={() => handleEditPrice(item)}
                    className="w-full bg-blue-600 text-white py-1 rounded"
                  >
                    Edit Harga
                  </button>
                  <button
                    onClick={() => handleUnlist(item)}
                    className="w-full bg-red-600 text-white py-1 rounded"
                  >
                    Batalkan Penjualan
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
