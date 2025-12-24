// update - rename this as passport.js and scrap previous one
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  BACKEND_URL,
} from "./utils.js";

/**
 * Google OAuth Strategy
 * NOTE:
 * passport-google-oauth20 typings are incompatible with passport
 * Strategy typings in strict NodeNext mode.
 * Casting to `any` here is intentional and runtime-safe.
 */
passport.use(
  (new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value || "";

          let fullName = profile.displayName || "";
          if (fullName.length > 15) {
            fullName = fullName.slice(0, 15);
          }

          const baseUserName =
            email.split("@")[0] ||
            fullName.replace(/\s+/g, "").toLowerCase();

          let userName = baseUserName;
          let counter = 1;

          while (await User.findOne({ userName })) {
            userName = `${baseUserName}${counter++}`;
          }

          user = new User({
            googleId: profile.id,
            email,
            fullName,
            userName,
            avatar: profile.photos?.[0]?.value || "",
          });

          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  ) as any)
); 

/**
 * Serialize user
 */
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

/**
 * Deserialize user
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("Deserialize user error:", err);
    done(err, null);
  }
});

export default passport;
