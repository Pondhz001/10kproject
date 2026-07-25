import re

with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace("  onNavigateToMyTrees?: () => void;\n}", "  onNavigateToMyTrees?: () => void;\n  initialSubTab?: 'new' | 'verify';\n}")
content = content.replace("  onNavigateToMyTrees\n}: PlantingPortalProps) {", "  onNavigateToMyTrees,\n  initialSubTab = 'new'\n}: PlantingPortalProps) {")

content = content.replace("const [subTab, setSubTab] = useState<'new' | 'verify'>('new');", "const [subTab, setSubTab] = useState<'new' | 'verify'>(initialSubTab);")

# Update useEffect to sync initialSubTab if it changes
effect_html = """
  React.useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);
"""
content = content.replace("const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);", effect_html + "\n  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);")

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
print("Done")
