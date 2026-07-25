import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Change handleViewCertificate
old_func = r"""  const handleViewCertificate = \(tree: Tree\) => \{
    setSuccessOrder\(\{
      id: tree\.id,
      donorName: tree\.ownerName,
      donorPhone: tree\.ownerPhone,
      treeCount: 1,
      amount: 100,
      status: 'Paid',
      slipVerified: true,
      selectedTreeIndexes: \[tree\.index\],
      createdAt: tree\.plantedAt,
    \}\);
    setIsViewingCertificate\(true\);
  \};"""

new_func = r"""  const handleViewCertificate = (tree: Tree) => {
    window.open('https://lin.ee/Sv5qrGD', '_blank');
  };"""

content = re.sub(old_func, new_func, content)

# Replace the Certificate view UI
cert_view_regex = r"                \{\!isViewingCertificate \? \([\s\S]*?\n                \)\}\n              <\/motion\.div>"

new_view = r"""                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">ทำรายการสำเร็จ!</h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      ข้อมูลของคุณได้รับการบันทึกเรียบร้อยแล้ว
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => window.open('https://lin.ee/Sv5qrGD', '_blank')}
                      className="w-full py-3 bg-[#00B900] hover:bg-[#009900] text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      ติดต่อรับใบประกาศเกียรติคุณผ่าน Line
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('map');
                        setSuccessOrder(null);
                      }}
                      className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm rounded-xl transition shadow-lg cursor-pointer"
                    >
                      กลับไปดูแผนที่
                    </button>
                  </div>
                </div>
              </motion.div>"""

content = re.sub(cert_view_regex, new_view, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
