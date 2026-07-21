console.log('Env keys:', Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('PASSWORD') && !k.includes('TOKEN')));
console.log('Env keys with secret/key/token/password indicators:', Object.keys(process.env).filter(k => k.includes('SECRET') || k.includes('KEY') || k.includes('PASSWORD') || k.includes('TOKEN')));
