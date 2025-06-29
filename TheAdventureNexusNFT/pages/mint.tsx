import { useState } from "react";
import { db, storage } from "../utils/firebase";
import { getContractWithSigner } from "../utils/contract";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";

export default function MintPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    if (!name || !desc || !image) return alert("Lengkapi semua data");

    try {
      setLoading(true);

      const imageRef = ref(storage, `nft-images/${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(snapshot.ref);

      const metadata = { name, description: desc, image: imageUrl };
      const metadataDoc = await addDoc(collection(db, "nft-metadata"), metadata);
      const tokenUri = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/nft-metadata/${metadataDoc.id}`;

      const { contract, signer } = await getContractWithSigner();
      const tx = await contract.mintNFT(await signer.getAddress(), tokenUri);
      const receipt = await tx.wait();
      const tokenId = receipt.logs[0].topics[3];

      await addDoc(collection(db, "nft-listings"), {
        tokenId: parseInt(tokenId, 16),
        image: imageUrl,
        owner: await signer.getAddress(),
        price: "0",
        listed: false,
        description: desc,
      });

      alert("✅ NFT berhasil dimint!");
      setName(""); setDesc(""); setImage(null);
    } catch (e) {
      console.error(e);
      alert("❌ Mint gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">🎨 Mint NFT</h1>
      <div className="max-w-md mx-auto space-y-4">
        <input type="text" placeholder="Nama NFT" className="w-full border p-2 rounded"
          value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Deskripsi" className="w-full border p-2 rounded"
          value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        <button onClick={handleMint} disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? "Memproses..." : "Mint NFT"}
        </button>
      </div>
    </main>
  );
}
