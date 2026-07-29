const fs = require('fs');

async function fix() {
  const trees = require('./trees.json');
  const orders = require('./orders.json');
  
  let treeToFix = trees.find(t => t.ownerName === 'วรางคณา เป้ก้่');
  if (treeToFix) {
    const res = await fetch(`http://localhost:3000/api/trees/${treeToFix.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerName: 'วรางคณา เป้ก้า' })
    });
    console.log('Fixed tree:', res.status);
  }
}

fix();
