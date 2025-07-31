import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteAccountRequest {
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Admin key
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Initialize regular Supabase client for user verification
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user's JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid or expired token')
    }

    const userId = user.id
    console.log('Deleting account for user:', userId)

    // Step 1: Delete all user data from custom tables
    const deleteOperations = [
      // Delete AI chat messages first (foreign key dependency)
      supabaseAdmin.from('ai_chat_history').delete().eq('user_id', userId),
      
      // Delete AI chat sessions
      supabaseAdmin.from('ai_chat_sessions').delete().eq('user_id', userId),
      
      // Delete flashcard progress
      supabaseAdmin.from('flashcard_progress').delete().eq('user_id', userId),
      
      // Delete AI recommendations
      supabaseAdmin.from('ai_recommendations').delete().eq('user_id', userId),
      
      // Delete performance analytics
      supabaseAdmin.from('performance_analytics').delete().eq('user_id', userId),
      
      // Delete quiz results
      supabaseAdmin.from('quiz_results').delete().eq('user_id', userId),
      
      // Delete questions created by user
      supabaseAdmin.from('questions').delete().eq('created_by', userId),
      
      // Delete subjects created by user
      supabaseAdmin.from('subjects').delete().eq('created_by', userId),
      
      // Delete backup metadata
      supabaseAdmin.from('user_backup_metadata').delete().eq('user_id', userId),
      
      // Delete user record from users table
      supabaseAdmin.from('users').delete().eq('id', userId)
    ]

    // Execute all delete operations
    const results = await Promise.allSettled(deleteOperations)
    
    // Check for any failures
    const failures = results.filter((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Delete operation ${index} failed:`, result.reason)
        return true
      }
      if (result.status === 'fulfilled' && result.value.error) {
        console.error(`Delete operation ${index} failed:`, result.value.error)
        return true
      }
      return false
    })

    if (failures.length > 0) {
      console.warn(`${failures.length} delete operations failed, continuing with auth user deletion`)
    }

    // Step 2: Delete user's backup files from storage
    try {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('user-backups')
        .list(`${userId}/`)

      if (!listError && files && files.length > 0) {
        const filePaths = files.map(file => `${userId}/${file.name}`)
        const { error: removeError } = await supabaseAdmin.storage
          .from('user-backups')
          .remove(filePaths)
        
        if (removeError) {
          console.error('Error removing backup files:', removeError)
        } else {
          console.log('Backup files removed successfully')
        }
      }
    } catch (storageError) {
      console.error('Error handling storage cleanup:', storageError)
    }

    // Step 3: Delete the user from Supabase Auth (most important step)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteUserError) {
      console.error('Failed to delete auth user:', deleteUserError)
      throw new Error(`Failed to delete user account: ${deleteUserError.message}`)
    }

    console.log('User account deleted successfully:', userId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully',
        deletedUserId: userId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error deleting user account:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

/* 
Edge Function Deployment Guide:

1. Install Supabase CLI:
   npm install -g supabase

2. Login to Supabase:
   supabase login

3. Deploy the function:
   supabase functions deploy delete-user-account

4. Set environment variables in Supabase Dashboard:
   - SUPABASE_URL (automatically set)
   - SUPABASE_ANON_KEY (automatically set) 
   - SUPABASE_SERVICE_ROLE_KEY (needs to be set manually)

5. Test the function:
   curl -X POST 'https://your-project.supabase.co/functions/v1/delete-user-account' \
   -H 'Authorization: Bearer your-user-jwt-token' \
   -H 'apikey: your-anon-key'
*/ 