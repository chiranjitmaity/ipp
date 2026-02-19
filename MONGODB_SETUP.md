# How to Get Your MongoDB Connection String (URI)

To fix the Vercel deployment error, you need a cloud database. Follow these steps to use **MongoDB Atlas** (which has a free tier).

## Step 1: Create an Account & Cluster
1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).**
2. Sign up or log in.
3. **Create a new Project** (name it `ilovepdftools` or similar).
4. Click **Build a Database**.
5. Select **M0 Free** (the free tier).
6. **Provider:** Choose **Google Cloud** (since you asked about it) or AWS. Any works.
7. **Region:** Choose a region close to your users (e.g., `Mumbai` if in India, or `Iowa` for US).
8. Click **Create Deployment**.

## Step 2: Create a Database User
1. You will be asked to create a database user.
2. **Username:** Enter a name (e.g., `admin`).
3. **Password:** Click "Autogenerate Secure Password" and **COPY IT** immediately. You will need it.
4. Click **Create Database User**.

## Step 3: Whitelist IP Address
1. Scroll down to **Network Access** (or click "Network Access" on the left menu).
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (0.0.0.0/0).
   * *Required because Vercel's IP addresses change dynamically.*
4. Click **Confirm**.

## Step 4: Get the Connection String
1. Go back to the **Database** tab (left menu).
2. Click the **Connect** button on your cluster.
3. Select **Drivers**.
4. You will see a string like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. **Copy this string.**

## Step 5: Final Setup
1. Paste this string into a text editor.
2. Replace `<password>` with the password you copied in Step 2.
3. Replace `?retryWrites=...` (everything after the `/`) with the database name:
   * **Result:** `mongodb+srv://admin:your_password@cluster0.abcde.mongodb.net/ilovepdftools?retryWrites=true&w=majority`
   * Note: Make sure to add `/ilovepdftools` before the `?`.

## Step 6: Add to Vercel
1. Go to your Vercel Project Settings -> Environment Variables.
2. Key: `MONGODB_URI`
3. Value: (The final string from Step 5)
4. Save and Redeploy.
