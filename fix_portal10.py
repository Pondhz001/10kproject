with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace('''                      {manualInputError && (
                        <p className="text-[10px] text-red-600 mt-1">{manualInputError}</p>
                      )}
                      {/* Seedling Selection Preview Card */}''', '''                      {manualInputError && (
                        <p className="text-[10px] text-red-600 mt-1">{manualInputError}</p>
                      )}
                    </div>
                      {/* Seedling Selection Preview Card */}''')

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
