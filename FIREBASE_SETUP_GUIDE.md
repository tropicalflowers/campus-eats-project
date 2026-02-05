# Firebase Setup Guide - Campus Eats

## ⚠️ Important: Login Credentials Now Use Firebase Authentication

Your app has been updated to use **Firebase Authentication** instead of username/password stored in Firestore.

### Why Did This Change?

Your Firebase rules require `request.auth` (Firebase Authentication users), not custom credentials:

```firestore
allow read: if isSignedIn();  // Checks if user is authenticated with Firebase
```

---

## ✅ What Login Credentials Will Work?

**Email** and **Password** of users registered in Firebase Authentication.

### Step 1: Create Test Users in Firebase

Go to **Firebase Console** → **Authentication** → **Users** tab:

1. Click **"Add user"**
2. Enter:
   - **Email**: `student1@campus.edu`
   - **Password**: `password123`
   - Click **Add user**
3. Repeat for more test users:
   - `student2@campus.edu` / `password123`
   - `manager@campus.edu` / `manager123`

### Step 2: Try Logging In

Now use these credentials in the login form:
- **Email**: `student1@campus.edu`
- **Password**: `password123`

---

## 🍽️ Why Menu Items Aren't Showing

Your Firebase Firestore database rules block reads from unauthenticated users:

```firestore
allow read: if isSignedIn();  // ← This is the issue!
```

**Solution**: You must be **logged in** to see anything.

1. ✅ Create test users (see Step 1 above)
2. ✅ Login with those credentials
3. ✅ Now you'll see restaurants and menu items!

---

## 🔒 Firebase Security Rules Summary

Your rules require:

| Action | Requirement |
|--------|-------------|
| **Read** (`restaurents` collection) | Must be signed in (`isSignedIn()`) |
| **Read** (`public/data/credentials`) | Must be signed in (`isSignedIn()`) |
| **Write** | Must be signed in AND have "manager" role |

---

## 📝 Checklist

- [ ] Go to Firebase Console → Authentication
- [ ] Create test user: `student1@campus.edu` / `password123`
- [ ] Start the app: `npm start` (port 3001)
- [ ] Click "Login" button
- [ ] Enter email and password
- [ ] See restaurants and menu items!

---

## 🆘 Troubleshooting

**"Email not found"**
→ User doesn't exist in Firebase Authentication. Create it in the console.

**"Incorrect password"**
→ Check the password you set in Firebase Authentication console.

**"Still can't see menus after login"**
→ Check browser console (F12) for detailed Firebase errors.

**Want to remove the authentication requirement?**
→ Modify Firebase Firestore Rules (in Firebase Console → Firestore → Rules):
```firestore
allow read: if true;  // Opens read access to everyone
```
