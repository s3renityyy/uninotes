import { useState } from "react";

const SubmitPage = () => {
  const [data, setData] = useState<string>("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:9000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Data submitted successfully!");
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Error submitting data.");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default SubmitPage;
