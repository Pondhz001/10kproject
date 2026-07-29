async function run() {
  const res = await fetch('http://localhost:3000/api/forest/pledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorName: 'น้องปาย',
        organization: 'เสพศิลป์ วินเทจ',
        donorPhone: '0000000000',
        treeCount: 6,
        selectedTreeIndexes: [101004, 101005, 101006, 101007, 101008, 101009],
        treeNames: ['น้องปาย (เสพศิลป์ วินเทจ)','น้องปาย (เสพศิลป์ วินเทจ)','น้องปาย (เสพศิลป์ วินเทจ)','น้องปาย (เสพศิลป์ วินเทจ)','น้องปาย (เสพศิลป์ วินเทจ)','น้องปาย (เสพศิลป์ วินเทจ)'],
        userId: '',
        isAdmin: true
      })
  });

  const data = await res.json();
  console.log("Pledge:", data);

  if (data.order && data.order.id) {
    const confirmRes = await fetch('http://localhost:3000/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: data.order.id,
            status: 'Paid',
            isAdmin: true
        })
    });
    console.log("Confirm:", await confirmRes.json());
  }
}

run();
