import { useState } from "react";
import { downloadJson } from "../services/storageService";

export default function FetchJson() {
  const [data, setData] = useState(null);

  const handleFetch = async () => {
    try {
      const json = await downloadJson("my-bucket", "data/user.json");
      setData(json);
    } catch (err) {
      alert("Error fetching JSON: " + err.message);
    }
  };

  return (
    <div className="p-4">
      <button onClick={handleFetch} className="px-4 py-2 bg-green-500 text-white rounded">
        Fetch JSON
      </button>
      {data && <pre className="mt-2 bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
