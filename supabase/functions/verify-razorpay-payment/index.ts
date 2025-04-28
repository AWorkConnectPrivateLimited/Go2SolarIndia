import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Razorpay from 'https://esm.sh/razorpay@2.9.2'
import crypto from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Authorization header is required',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '')
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Unauthorized: Invalid token',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Parse the request body
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Payment verification details are required',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if Razorpay credentials are set
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not set')
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Payment service configuration error',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex')

    const isValid = signature === razorpay_signature

    if (!isValid) {
      console.error('Invalid signature:', { 
        expected: signature, 
        received: razorpay_signature 
      })
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Invalid signature',
          details: {
            expected: signature,
            received: razorpay_signature
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Get payment details
    const payment = await razorpay.payments.fetch(razorpay_payment_id)
    
    if (!payment) {
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Payment not found',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Update payment record in database
    const { data: paymentData, error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        status: 'completed',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', razorpay_order_id)
      .select()

    if (paymentError) {
      console.error('Database error updating payment:', paymentError)
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Failed to update payment record',
          details: paymentError,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get the payment record to check for project_id
    const paymentRecord = paymentData?.[0]
    if (!paymentRecord) {
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Payment record not found after update',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // If payment has a project_id, update the project status
    if (paymentRecord.project_id) {
      const { error: projectError } = await supabaseClient
        .from('solar_projects')
        .update({
          status: 'installation',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.project_id)
        .eq('status', 'confirmed') // Only update if current status is 'confirmed'

      if (projectError) {
        console.error('Database error updating project:', projectError)
        return new Response(
          JSON.stringify({ 
            error: true,
            message: 'Failed to update project status',
            details: projectError,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: true, payment }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    
    // Return appropriate error status code
    return new Response(
      JSON.stringify({ 
        error: true,
        message: error.message,
        details: error.stack,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}) 