with open("src/components/HomeCampaign.tsx", "r") as f:
    content = f.read()

import re

# Remove firebase imports
content = re.sub(r"import { collection, getDocs } from 'firebase/firestore';\n", "", content)
content = re.sub(r"import { db } from '\.\./lib/firebase';\n", "", content)
content = re.sub(r"import { db } from '\.\./firebase';\n", "", content)

# Rewrite fetchStatsAndTrees to use API
new_fetch = '''  const fetchStatsAndTrees = async () => {
    try {
      setIsLoadingStats(true);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };'''

content = re.sub(r"  const fetchStatsAndTrees = async \(\) => \{.*?\n  \};\n", new_fetch + "\n", content, flags=re.DOTALL)

with open("src/components/HomeCampaign.tsx", "w") as f:
    f.write(content)
