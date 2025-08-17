import { useState } from "react";
import { uploadJson } from "../services/storageService";

export default function UploadJson() {
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    try {
      const jsonData = { name: "Vishnu", age: 22 };
      await uploadJson("my-bucket", "data/user.json", jsonData);
      setStatus("✅ JSON uploaded successfully!");
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div className="p-4">
      <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded">
        Upload JSON
      </button>
      <p>{status}</p>
    </div>
  );
}
