import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { CheckCircle2, Search, XCircle, RefreshCw, Table2, Key } from 'lucide-react';",
    "import { CheckCircle2, Search, XCircle, RefreshCw, Table2, Key, Check, X, FileImage } from 'lucide-react';"
)

# Add search and filter states
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'spreadsheet' | 'codes'>('spreadsheet');",
    "const [activeTab, setActiveTab] = useState<'spreadsheet' | 'codes'>('spreadsheet');\n  const [searchTerm, setSearchTerm] = useState('');\n  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid' | 'Failed'>('All');"
)

# Add approve/reject functions
action_funcs = """
  const handleUpdateStatus = async (id: string, newStatus: 'Paid' | 'Failed') => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        o.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (o.donorPhone && o.donorPhone.includes(searchTerm));
    const matchStatus = statusFilter === 'All' ? true : o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalTrees = orders.filter(o => o.status === 'Paid').reduce((acc, curr) => acc + curr.treeCount, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const approvedCount = orders.filter(o => o.status === 'Paid').length;
"""

content = content.replace(
    "const pendingOrders = orders.filter(o => o.status === 'Pending');",
    action_funcs + "\n  const pendingOrders = orders.filter(o => o.status === 'Pending');"
)

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
print("Done Update Admin Dashboard")
