### EBADENGINE warnings — Node version mismatch (not fatal, but important)

Error:

```
required: { node: '20 || >=22' }
current: { node: 'v21.7.3' }
```

Solution:

Switch to Node 20 LTS (recommended). Since your dependencies explicitly require it.

```
nvm install 20
nvm use 20
```

Install npm

```
npm install
```

*Verify installed version*

```
node -v                # should be v20.x.x
npm -v
```

You cannot remove a Node version that is currently in use.
So we must switch away from 21 first, then uninstall it. 
Uninstall previous nvm version

```
nvm ls                     # check installed versions(if any)

nvm uninstall 21.x.x
```


### The real crash — JavaScript heap out of memory (fatal ❌)

Error:

```
FATAL ERROR: Ineffective mark-compacts near heap limit
Allocation failed - JavaScript heap out of memory
```

Solution:

Prefer : EC2 instance (t2.medium) over t2.micro (Its a memory space issue)


###

Error:

```
Cannot find type definition file for 'node'
Cannot find type definition file for 'body-parser'
Cannot find type definition file for 'qs'
```

Solution:

🟢 OPTION 1
step 1. Let TypeScript auto-discover types. Remove forced types from tsconfig.json

Open tsconfig.json

```
nano tsconfig.json
```
Look for something like this

```
"types": [
  "node",
  "body-parser",
  "qs",
  "ioredis",
  "passport-oauth2",
  ...
]

```

step 2. REMOVE the entire "types" section (or comment it out)

Keep only

```
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "module": "commonjs",
    "target": "ES2020",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```
🟠 OPTION 2 — Install all missing type packages (not ideal on t2.micro)

```
npm install -D @types/node @types/body-parser @types/qs @types/ioredis @types/http-errors @types/passport-oauth2
```
After fixing tsconfig
```
npm run build
npm start
```

Root cause (exact)

You are using:

```
"module": "nodenext",
"moduleResolution": "NodeNext"
```
In this mode, TypeScript DOES NOT auto-include Node types. So when tsc runs, it expects @types/node explicitly, otherwise you get:

```
Cannot find type definition file for 'node'
Cannot find type definition file for 'qs'
Cannot find type definition file for 'body-parser'
...
```
✅ The correct & minimal fix (DO THIS)

You only need ONE package.

1️⃣ Install Node types

```
npm install -D @types/node
```

2️⃣ (Optional but recommended) Lock types to Node 20

```
npm install -D @types/node@20
```
This keeps types aligned with your runtime.

3️⃣ Run build again
```
npm run build
```

Then:

```
npm start
```

#### Why this fixes ALL 16 errors

@types/node provides:

http, fs, stream, buffer, etc.

Many libraries’ types depend on Node core

Once Node types are present:

qs, body-parser, passport, etc. resolve automatically

skipLibCheck: true avoids deep dependency type checks (good for t2.micro)

🔴 What’s ACTUALLY happening (precise root cause)

These errors:

Entry point for implicit type library 'babel__generator'
Entry point for implicit type library 'body-parser'
Entry point for implicit type library 'qs'
...


mean TypeScript is detecting leftover / partial @types/* packages in
node_modules/@types, but their type files are missing or broken.

This usually happens when:

npm install / prune removed packages

@types/* were previously installed, then partially removed

TypeScript auto-detects them and fails

⚠️ This is not a Node 20 or tsconfig mistake anymore.

✅ Correct, clean, demo-safe fix (DO THIS EXACTLY)

1️⃣ Completely remove broken @types cache

```
rm -rf node_modules/@types
```
This is safe. You’ll re-add only what you need.

2️⃣ Reinstall ONLY Node types

```
npm install -D @types/node@20
```
No other @types/* packages

3️⃣ Add explicit types to tsconfig (important with NodeNext)

Edit tsconfig.json:
```
nano tsconfig.json
```

Change it to:
```
{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "nodenext",
    "moduleResolution": "NodeNext",
    "target": "ES2020",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

✅ This forces TS to ignore all implicit libraries.

Save & exit. And Build again!!!

### Great — this is the last real TypeScript issue, and it’s a known Passport + Google OAuth typing mismatch, not a runtime bug. Your app is basically ready.

Error
```
passport-google-oauth20 Strategy
is not assignable to
passport Strategy
```

This happens because:

passport and passport-google-oauth20 define Strategy types differently

With TypeScript + NodeNext + strict mode, TS becomes very picky

At runtime everything works, but types don’t line up

This is a typing mismatch, not a logic error

✅ Don’t type the strategy explicitly — let Passport infer it

Open:
```
nano config/passport.ts
```
🔧 Change your imports

❌ Current (problematic)
```
import passport, { Strategy } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
```

✅ Correct
```
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
```

⚠️ Do NOT import Strategy from passport

🔧 Register the strategy like this

❌ Problematic
```
passport.use(
  new GoogleStrategy({...}, callback)
);


(or with typing)

passport.use<Strategy>(
  new GoogleStrategy(...)
);
```

✅ Correct (no explicit typing)
```
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
```

Let Passport handle the type internally.

✅ Why this works (important to understand)

passport-google-oauth20 extends Passport’s Strategy at runtime

But TypeScript doesn’t model this inheritance cleanly

Explicit typing forces an incompatible contract

Removing the explicit type avoids the conflict

This is the officially recommended workaround.

🧪 Now rebuild
```
npm run build
```

Then:

```
npm start
```


### 🔴 What’s actually happening (short)

Your EC2 volume has NOT been expanded yet (or OS hasn’t picked it up)

Disk is 100% full

Any command needing /tmp fails

You must delete files first, then expand


✅ STEP 1: Emergency space recovery (must do first).We’ll free 500MB–1GB. That’s enough. Avoid t2.micro and use more than 20gib storage

1️⃣ Remove npm cache (this is usually HUGE)
```
sudo rm -rf /home/ubuntu/.npm
```

2️⃣ Remove frontend junk (partial installs)
```
sudo rm -rf /home/ubuntu/wanderlust/frontend/node_modules
sudo rm -f  /home/ubuntu/wanderlust/frontend/package-lock.json
```

3️⃣ Clear system caches & logs
```
sudo apt clean
sudo rm -rf /var/cache/apt/*
sudo journalctl --vacuum-size=50M
```

4️⃣ Clear temp dirs
```
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
```
✅ STEP 2: Confirm space is free
```
df -h
```

You should now see at least 500MB–1GB free.

👉 If still 100%, tell me immediately — don’t continue.

Expand the EBS volume in AWS Console. You must do this first — Linux can’t grow what AWS hasn’t expanded.

✅ STEP 3: NOW grow the partition (this will work now)
1️⃣ Grow partition
```
sudo growpart /dev/xvda 1
```

Expected:
```
CHANGED: partition=1
```

2️⃣ Resize filesystem
```
sudo resize2fs /dev/xvda1
```

This time it WILL resize.

✅ STEP 4: Verify final size
```
df -h
```

You should now see something like:
```
/dev/xvda1   20G   5G   15G
```

🎉 Disk problem permanently solved.

🔥 DO NOT install frontend deps on EC2 again

Even with 20GB, it’s bad practice.

✅ Correct DevOps approach

Build frontend locally or in CI

Copy only dist/ or build/ to EC2

Serve via:

Nginx or

Backend static serving

This is exactly how production works.


####

Error:

```
Error connecting to Redis: connect ECONNREFUSED 127.0.0.1:6379
connect ECONNREFUSED 127.0.0.1:27017
```

1️⃣ Check status
```
sudo systemctl status mongod
```

If it says inactive / not found, do this:

2️⃣ Start MongoDB
```
sudo systemctl start mongod
sudo systemctl enable mongod
```

3️⃣ Verify
```
mongod --version
```

Test connection:
```
mongosh
```


✅ Fix Redis (second) - Not necessarily required (I skipped)
1️⃣ Install Redis (if not installed)
```
sudo apt update
sudo apt install -y redis-server
```

2️⃣ Start Redis
```
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

3️⃣ Verify
```
redis-cli ping
```

Expected output:
```
PONG
```

✅ Restart backend
```
cd ~/wanderlust/backend
npm start
```

Expected output:
```
🚀 Starting server...
📡 Connecting to databases...
✅ MongoDB connected
✅ Redis connected
```