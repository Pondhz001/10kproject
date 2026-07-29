const payload = {
  donorName: "Admin Test",
  donorPhone: "0812345679",
  treeCount: 1,
  selectedTreeIndexes: [100101],
  treeNames: ["Admin Tree"],
  userId: "",
  isAdmin: true
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
