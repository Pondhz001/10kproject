import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Fix broken imports
content = content.replace("import { MessageCircle, Tree, Order", "import { Tree, Order")
content = content.replace("import { MessageCircle, motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';")

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
