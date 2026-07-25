import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Insert the Admin Auto-Logout logic
admin_timeout_logic = """
  // Admin Auto-Logout Timer (5 minutes)
  const ADMIN_TIMEOUT_MS = 5 * 60 * 1000;
  
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (isAdmin) {
        timeoutId = setTimeout(() => {
          setIsAdmin(false);
          localStorage.removeItem('is_admin');
          if (activeTab === 'admin-dashboard' || (activeTab === 'plant' && plantMode === 'admin')) {
            setActiveTab('map');
          }
          alert('ออกจากระบบแอดมินอัตโนมัติเนื่องจากไม่มีการใช้งานเกิน 5 นาที');
        }, ADMIN_TIMEOUT_MS);
      }
    };

    if (isAdmin) {
      resetTimer(); // Start timer initially when admin logs in
      
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));

      return () => {
        clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
  }, [isAdmin, activeTab, plantMode]);
"""

# Find the insertion point
insert_marker = "// Load stats and tree list from our full-stack Express endpoints"
content = content.replace(insert_marker, admin_timeout_logic + "\n  " + insert_marker)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done Admin Timeout")
