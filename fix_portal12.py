with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace('''                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {verifyError}
                  </div>
    </div>''', '''                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {verifyError}
                  </div>
                )}''')

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
