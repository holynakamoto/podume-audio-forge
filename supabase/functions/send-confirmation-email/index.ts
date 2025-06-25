
import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Email function invoked with method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const payload = await req.text()
    console.log('Received payload length:', payload.length)
    
    // Security: Check if we have the required environment variables
    if (!resend) {
      console.error('RESEND_API_KEY not found')
      return new Response('Email service not configured', {
        status: 500,
        headers: corsHeaders
      })
    }

    // Try webhook verification first, fallback to direct call
    let emailData;
    
    if (hookSecret && payload.includes('user')) {
      // Webhook call from Supabase
      try {
        const headers = Object.fromEntries(req.headers)
        console.log('Attempting webhook verification')
        
        const wh = new Webhook(hookSecret)
        const verified = wh.verify(payload, headers) as {
          user: { email: string }
          email_data: {
            token: string
            token_hash: string
            redirect_to: string
            email_action_type: string
          }
        }

        console.log('Webhook verified for user:', verified.user.email)
        
        // Only handle signup confirmations
        if (verified.email_data.email_action_type !== 'signup') {
          console.log('Email type not handled:', verified.email_data.email_action_type)
          return new Response('Email type not handled', { 
            status: 200,
            headers: corsHeaders 
          })
        }

        emailData = {
          email: verified.user.email,
          token: verified.email_data.token,
          token_hash: verified.email_data.token_hash,
          redirect_to: verified.email_data.redirect_to || 'https://pudwgzutzoidxbvozhnk.supabase.co/',
          email_action_type: verified.email_data.email_action_type
        }
      } catch (verifyError) {
        console.error('Webhook verification failed:', verifyError)
        return new Response('Webhook verification failed', {
          status: 401,
          headers: corsHeaders
        })
      }
    } else {
      // Direct call fallback
      console.log('Processing as direct call')
      const body = JSON.parse(payload)
      
      if (!body.email) {
        return new Response('Email is required', {
          status: 400,
          headers: corsHeaders
        })
      }
      
      emailData = {
        email: body.email,
        token: body.token || 'confirmation-required',
        token_hash: body.token_hash || 'hash-placeholder',
        redirect_to: body.redirect_to || 'https://pudwgzutzoidxbvozhnk.supabase.co/',
        email_action_type: 'signup'
      }
    }

    await sendConfirmationEmail(emailData)

  } catch (error) {
    console.error('Error in send-confirmation-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          details: error.toString(),
        },
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    },
  })
})

async function sendConfirmationEmail(emailData: {
  email: string
  token: string
  token_hash: string
  redirect_to: string
  email_action_type: string
}) {
  console.log('Rendering email template for:', emailData.email)
  
  const html = await renderAsync(
    React.createElement(ConfirmationEmail, {
      supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
      token: emailData.token,
      token_hash: emailData.token_hash,
      redirect_to: emailData.redirect_to,
      email_action_type: emailData.email_action_type,
    })
  )

  console.log('Email template rendered, sending email...')
  const { data, error } = await resend.emails.send({
    from: 'Podumé <onboarding@resend.dev>',
    to: [emailData.email],
    subject: 'Confirm your Podumé account',
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    throw error
  }

  console.log('Confirmation email sent successfully to:', emailData.email)
  console.log('Email data:', data)
}
