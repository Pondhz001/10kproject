const payload = {
  donorName: "Test User",
  donorPhone: "0812345678",
  treeCount: 1,
  selectedTreeIndexes: [100100],
  treeNames: ["Test Tree"],
  userId: "",
  isAdmin: false
};

async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/forest/pledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
