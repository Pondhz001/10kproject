import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Remove verify button
verify_button_regex = r'<button\s+onClick=\{\(\) => setActiveTab\(\'verify\'\)\}\s+className=\{`px-3\.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1\.5 transition-all whitespace-nowrap cursor-pointer \$\{\s+activeTab === \'verify\'\s+\? \'bg-amber-500 text-stone-950 shadow-sm font-black\'\s+: \'text-stone-600 hover:text-amber-600 hover:bg-white/80\'\s+\}`\}\s+>\s+<CheckCircle className=\{`w-4 h-4 \$\{activeTab === \'verify\' \? \'text-stone-950\' : \'text-amber-600\'\}`\} />\s+ยืนยันการปลูก\s+</button>'
content = re.sub(verify_button_regex, '', content, flags=re.DOTALL)

# 2. Remove VerifyPlanting rendering
verify_render_regex = r'\{activeTab === \'verify\' && \(\s*<VerifyPlanting onVerified=\{\(\) => setActiveTab\(\'my-trees\'\)\} />\s*\)\}'
content = re.sub(verify_render_regex, '', content, flags=re.DOTALL)

# 3. Handle 'verify' in HomeCampaign by tracking it. 
# We will use activeTab = 'plant', plantMode = 'member', and pass initialSubTab='verify' if a state is set.
# Let's add a state `verifyMode` in App.tsx
content = content.replace("const [plantMode, setPlantMode] = useState<'member' | 'admin'>('member');", "const [plantMode, setPlantMode] = useState<'member' | 'admin'>('member');\n  const [plantSubTab, setPlantSubTab] = useState<'new' | 'verify'>('new');")

# 4. Modify handleEnterCampaign (wait, there isn't one, it just sets activeTab directly)
# But wait, HomeCampaign is passed `onEnterCampaign`.
# In App.tsx: 
# <HomeCampaign stats={stats} onEnterCampaign={setActiveTab} />
# Let's change how HomeCampaign is called
home_render_regex = r'<HomeCampaign\s+stats=\{stats\}\s+onEnterCampaign=\{setActiveTab\}\s+/>'
new_home_render = """<HomeCampaign 
                stats={stats} 
                onEnterCampaign={(tab) => {
                  if (tab === 'verify') {
                    setPlantMode('member');
                    setPlantSubTab('verify');
                    setActiveTab('plant');
                  } else {
                    setPlantSubTab('new');
                    setActiveTab(tab as any);
                  }
                }} 
              />"""
content = re.sub(home_render_regex, new_home_render, content)

# 5. Modify PlantingPortal props
portal_regex = r'<PlantingPortal\s+onOrderCompleted=\{handleOrderCompleted\}\s+preSelectedTreeIndex=\{preSelectedTreeIndex\}\s+setPreSelectedTreeIndex=\{setPreSelectedTreeIndex\}\s+preSelectedTreeIndexes=\{preSelectedTreeIndexes\}\s+setPreSelectedTreeIndexes=\{setPreSelectedTreeIndexes\}\s+trees=\{trees\}\s+initialMemberMode=\{plantMode === \'member\'\}\s+isAdmin=\{isAdmin\}\s+/>'
new_portal_render = """<PlantingPortal
                onOrderCompleted={handleOrderCompleted}
                preSelectedTreeIndex={preSelectedTreeIndex}
                setPreSelectedTreeIndex={setPreSelectedTreeIndex}
                preSelectedTreeIndexes={preSelectedTreeIndexes}
                setPreSelectedTreeIndexes={setPreSelectedTreeIndexes}
                trees={trees}
                initialMemberMode={plantMode === 'member'}
                isAdmin={isAdmin}
                initialSubTab={plantSubTab}
                onNavigateToMyTrees={() => setActiveTab('my-trees')}
              />"""
content = re.sub(portal_regex, new_portal_render, content)

# 6. Also update the plant button in header to reset to 'new'
plant_button_regex = r'onClick=\{\(\) => \{\s+setPlantMode\(\'member\'\);\s+setActiveTab\(\'plant\'\);\s+\}\}'
new_plant_button = """onClick={() => {
                  setPlantMode('member');
                  setPlantSubTab('new');
                  setActiveTab('plant');
                }}"""
content = re.sub(plant_button_regex, new_plant_button, content)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
