# Supabase Storage Setup Guide

## Step 1: Create Bucket

1. Go to Supabase Dashboard
2. Click on **Storage** tab
3. Click **Create Bucket** button
4. Bucket name: `user-backups`
5. **Turn OFF** the **Public bucket** option (must be private)
6. Click **Create bucket** button

## Step 2: Bucket Settings

After creating the bucket:

1. Click on the `user-backups` bucket
2. Go to **Settings** tab
3. **File size limit**: 10 MB
4. **Allowed MIME types**: `application/json`

## Step 3: Storage Policies (In Dashboard)

Go to **Authentication** > **Policies** tab in Supabase Dashboard and create the following policies for the **storage.objects** table:

### Policy 1: Upload Permission
- **Policy name**: `Users can upload to own folder`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: 
```sql
bucket_id = 'user-backups' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 2: Download Permission
- **Policy name**: `Users can view own backup files`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**: 
```sql
bucket_id = 'user-backups' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3: Update Permission
- **Policy name**: `Users can update own backup files`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: 
```sql
bucket_id = 'user-backups' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4: Delete Permission
- **Policy name**: `Users can delete own backup files`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: 
```sql
bucket_id = 'user-backups' AND auth.uid()::text = (storage.foldername(name))[1]
```

## Alternative: Temporary Public Bucket (For Testing Only)

If you encounter issues creating policies, you can temporarily make the bucket public:

1. Go to the `user-backups` bucket
2. Enable **Settings** > **Make public** option
3. ⚠️ **WARNING**: This should only be for testing purposes, must be private in production

## Verification

After completing the storage setup, use the "Test Storage" button in our application to verify the installation. 