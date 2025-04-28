import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Razorpay from 'https://esm.sh/razorpay@2.9.2'

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
    const { amount, currency, description } = await req.json()
    
    if (!amount || !currency) {
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Amount and currency are required',
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

    // Create order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        description: description || 'Payment for Go2Solar services',
      },
    })

    // Create a payment record in the database
    const { error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: currency,
        status: 'pending',
        order_id: order.id,
        description: description || 'Payment for Go2Solar services',
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ 
          error: true,
          message: 'Failed to create payment record',
          details: dbError,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    return new Response(
      JSON.stringify(order),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    
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