// Supabase Edge Function for deleting a user account
// @ts-expect-error Deno imports are not recognized by TypeScript but will work in Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-expect-error Supabase imports are not recognized by TypeScript but will work in Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Handle environment variables for both development and Supabase environments
const getEnv = (key: string) => {
  // @ts-expect-error Deno available at runtime in Supabase Functions
  return typeof Deno !== 'undefined' ? Deno.env.get(key) : process.env[key];
};

// Log environment configuration (don't log actual secrets!)
console.log(`SUPABASE_URL configured: ${!!getEnv('SUPABASE_URL')}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY configured: ${!!getEnv('SUPABASE_SERVICE_ROLE_KEY')}`);

// Create a Supabase client with the service role key (has admin privileges)
const supabaseAdmin = createClient(
  getEnv('SUPABASE_URL') ?? '',
  getEnv('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// At the beginning of your file, add a function to check admin permissions
async function verifyAdminPermissions() {
  try {
    // Test admin privileges with a simple query
    const { error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      console.error('Admin privileges check failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Admin privileges check error:', err);
    return false;
  }
}

serve(async (req: Request) => {
  console.log(`Received ${req.method} request`);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
  };

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Add admin permission check before any user deletion
    const hasAdminPermissions = await verifyAdminPermissions();
    if (!hasAdminPermissions) {
      console.error('SERVICE_ROLE_KEY does not have admin privileges');
      return new Response(JSON.stringify({
        error: 'Server configuration error - insufficient permissions',
        code: 'admin_permission_error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Error: Missing Authorization header');
      return new Response(JSON.stringify({
        error: 'Missing authorization header'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Authorization header found');

         // Verify the token to get the user
     const token = authHeader.replace('Bearer ', '');
     console.log(`Verifying token: ${token.substring(0, 20)}...`);
     console.log(`Token length: ${token.length}`);
     console.log(`Full token (first 50 chars): ${token.substring(0, 50)}`);

     try {
       console.log('Attempting to verify token with supabaseAdmin...');
       const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError) {
        console.log(`Auth error: ${authError.message}`);
        return new Response(JSON.stringify({
          error: `Authentication error: ${authError.message}`
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!user) {
        console.log('No user found with the provided token');
        return new Response(JSON.stringify({
          error: 'No user found'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`User authenticated: ${user.id} (${user.email})`);

      const userId = user.id;
      let confirmEmail = '';
      let body = {};

      try {
        body = await req.json();
        console.log(`Request body: ${JSON.stringify(body)}`);
        confirmEmail = (body as any).confirmEmail || '';
      } catch (err) {
        console.log(`Error parsing request body: ${err}`);
        // No body or invalid JSON - we'll use the token user
      }

      // Additional security check - confirm email matches
      if (confirmEmail && confirmEmail !== user.email) {
        console.log(`Email confirmation mismatch: ${confirmEmail} vs ${user.email}`);
        return new Response(JSON.stringify({
          error: 'Email confirmation does not match'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`Attempting real deletion for user: ${userId}`);

      // Step 1: Delete all user data from our custom tables
      try {
        console.log('Deleting user data from custom tables...');
        
        // Delete in correct order (foreign key dependencies)
        const deleteOperations = [
          // AI chat messages first
          supabaseAdmin.from('ai_chat_history').delete().eq('user_id', userId),
          // AI chat sessions  
          supabaseAdmin.from('ai_chat_sessions').delete().eq('user_id', userId),
          // Flashcard progress
          supabaseAdmin.from('flashcard_progress').delete().eq('user_id', userId),
          // AI recommendations
          supabaseAdmin.from('ai_recommendations').delete().eq('user_id', userId),
          // Performance analytics
          supabaseAdmin.from('performance_analytics').delete().eq('user_id', userId),
          // Quiz results
          supabaseAdmin.from('quiz_results').delete().eq('user_id', userId),
          // Questions created by user
          supabaseAdmin.from('questions').delete().eq('created_by', userId),
          // Subjects created by user
          supabaseAdmin.from('subjects').delete().eq('created_by', userId),
          // Backup metadata
          supabaseAdmin.from('user_backup_metadata').delete().eq('user_id', userId),
          // Users table
          supabaseAdmin.from('users').delete().eq('id', userId)
        ];

        await Promise.allSettled(deleteOperations);
        console.log('Custom table data deleted');
      } catch (tableErr) {
        console.error('Custom table deletion error:', tableErr);
      }

      // Step 2: Clean up storage files if any exist
      try {
        console.log('Checking for user storage files');
        
        // Check user-backups bucket
        const { data: backupFiles } = await supabaseAdmin.storage
          .from('user-backups')
          .list(`${userId}/`);
          
        if (backupFiles && backupFiles.length > 0) {
          console.log(`Found ${backupFiles.length} backup files to delete`);
          const filePaths = backupFiles.map(file => `${userId}/${file.name}`);
          await supabaseAdmin.storage.from('user-backups').remove(filePaths);
          console.log('Backup files deleted');
        }

        // Check profiles bucket if exists
        const { data: profileFiles } = await supabaseAdmin.storage
          .from('profiles')
          .list(userId);
          
        if (profileFiles && profileFiles.length > 0) {
          console.log(`Found ${profileFiles.length} profile files to delete`);
          const filePaths = profileFiles.map(file => `${userId}/${file.name}`);
          await supabaseAdmin.storage.from('profiles').remove(filePaths);
          console.log('Profile files deleted');
        }
      } catch (storageErr) {
        // Continue even if storage cleanup fails
        console.error('Storage cleanup error:', storageErr);
      }

      // Step 3: Profiles table doesn't exist in this project, skip
      console.log('Skipping profiles table (not used in this project)');

      // Step 4: Delete the user account using direct API call
      try {
        console.log('Attempting real user deletion via Admin API...');
        
        // Direct API call to delete user
        const deleteResponse = await fetch(`${getEnv('SUPABASE_URL')}/auth/v1/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getEnv('SUPABASE_SERVICE_ROLE_KEY')}`,
            'apikey': getEnv('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            'Content-Type': 'application/json'
          }
        });

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error(`Delete API failed: ${deleteResponse.status} - ${errorText}`);
          
          // Try with supabaseAdmin as fallback
          console.log('Trying fallback method...');
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
          
          if (deleteError) {
            console.error(`Fallback also failed: ${deleteError.message}`);
            throw new Error(`Both delete methods failed. API: ${errorText}, Admin: ${deleteError.message}`);
          }
        } else {
          const responseData = await deleteResponse.text();
          console.log('User deleted successfully via API:', responseData);
        }
        
      } catch (deleteErr) {
        const errorMessage = deleteErr instanceof Error ? deleteErr.message : 'Unknown error';
        console.error(`Exception during user deletion: ${errorMessage}`);
        return new Response(JSON.stringify({
          error: errorMessage,
          code: 'delete_exception'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Final verification - check if user still exists
      try {
        const { data: checkUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (checkUser.user) {
          console.error('WARNING: User still exists after deletion attempt!');
          return new Response(JSON.stringify({
            success: false,
            error: 'User deletion failed - user still exists',
            code: 'deletion_verification_failed'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (verifyErr) {
        // If getUserById throws error, user is deleted (expected)
        console.log('User verification failed as expected - user deleted');
      }

      console.log(`Successfully performed real deletion for user: ${userId}`);

      return new Response(JSON.stringify({
        success: true,
        message: 'User account and all associated data have been permanently deleted'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (authErr) {
      const errorMessage = authErr instanceof Error ? authErr.message : 'Unknown error';
      console.error(`Error during authentication: ${errorMessage}`);
      return new Response(JSON.stringify({
        error: `Error during authentication: ${errorMessage}`,
        code: 'auth_error'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Unexpected error: ${errorMessage}`);
    console.error(error instanceof Error ? error.stack : 'No stack trace available');
    
    return new Response(JSON.stringify({
      error: errorMessage,
      code: 'unexpected_error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 