import re

with open("src/db.ts", "r") as f:
    content = f.read()

content = content.replace(
    "status: { type: String, enum: ['Seedling', 'Growing', 'Young Tree', 'Mature'] },",
    "status: { type: String, enum: ['Pending Verification', 'Seedling', 'Growing', 'Young Tree', 'Mature'] },"
)

content = content.replace(
    "createdAt: String,",
    "createdAt: String,\n  verificationCode: String,"
)

content = content.replace(
    "status?: 'Pending' | 'Paid' | 'Failed'; slipVerified?: boolean }): Promise<Order>",
    "status?: 'Pending' | 'Paid' | 'Failed'; slipVerified?: boolean; verificationCode?: string }): Promise<Order>"
)

content = content.replace(
    "slipVerified: order.slipVerified ?? false,",
    "slipVerified: order.slipVerified ?? false,\n      verificationCode: order.verificationCode || '',"
)

with open("src/db.ts", "w") as f:
    f.write(content)
print("Done")
