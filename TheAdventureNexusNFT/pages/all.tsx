import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function PublicNFTPage() {
  const [allNFTs, setAllNFTs] = useState<any[]>([]);
  const [filteredNFTs, setFilteredNFTs] = useState<any[]>([]);
  const [filterOwner, setFilterOwner] = useState("");
  const [filterListed, setFilterListed] = useState("all");

  useEffect(() => {
    const fetchAllNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "nft-listings"));
      const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllNFTs(all);
      setFilteredNFTs(all);
    };
    fetchAllNFTs();
  }, []);

  useEffect(() => {
    let filtered = [...allNFTs];
    if (filterOwner.trim() !== "") {
      filtered = filtered.filter(nft => nft.owner?.toLowerCase().includes(filterOwner.toLowerCase()));
    }
    if (filterListed === "listed") {
      filtered = filtered.filter(nft => nft.listed === true);
    } else if (filterListed === "unlisted") {
      filtered = filtered.filter(nft => nft.listed !== true);
    }
    setFilteredNFTs(filtered);
  }, [filterOwner, filterListed, allNFTs]);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">🌐 Semua Koleksi NFT di Platform</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Cari berdasarkan address owner..."
          className="border p-2 rounded w-full md:w-1/2"
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
        />
        <select
          value={filterListed}
          onChange={(e) => setFilterListed(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="all">Semua</option>
          <option value="listed">Sedang Dijual</option>
          <option value="unlisted">Tidak Dijual</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredNFTs.length === 0 ? (
          <p>Tidak ada NFT yang cocok dengan filter.</p>
        ) : (
          filteredNFTs.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow">
              <img src={item.image} alt="nft" className="w-full h-48 object-cover mb-2" />
              <p className="font-bold">ID: {item.tokenId}</p>
              <p>{item.description}</p>
              <p className="text-sm text-gray-500">Owner: {item.owner?.slice(0, 6)}...{item.owner?.slice(-4)}</p>
              {item.listed ? (
                <p className="text-green-600 font-semibold mt-1">Tersedia: {item.price} ETH</p>
              ) : (
                <p className="text-red-500 mt-1">Tidak dijual</p>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}