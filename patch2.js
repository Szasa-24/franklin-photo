const fs = require('fs');
let code = fs.readFileSync('app/admin/school/[id]/page.tsx', 'utf8');
code = code.replace("import firebaseConfig from '@/firebase-applet-config.json';", "");
code = code.replace("firebaseConfig.apiKey", "process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''");
fs.writeFileSync('app/admin/school/[id]/page.tsx', code);
