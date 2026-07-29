with open("src/components/PlantingPortal.tsx", "r") as f:
    content = f.read()

content = content.replace('''                          </p>
    </div>
                    </div>
                  </>
    </div>''', '''                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>''')

with open("src/components/PlantingPortal.tsx", "w") as f:
    f.write(content)
