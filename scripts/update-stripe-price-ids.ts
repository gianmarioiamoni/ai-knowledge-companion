/**
 * Script to update Stripe Price IDs in subscription_plans table
 * Run this after executing sql/28_stripe_integration.sql
 * 
 * Usage: npx tsx scripts/update-stripe-price-ids.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const priceIds = {
  proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  proYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  enterpriseMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
  enterpriseYearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
}

// Validate all price IDs are present
const missingPriceIds = Object.entries(priceIds)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingPriceIds.length > 0) {
  console.error('❌ Missing Stripe Price IDs in .env.local:')
  missingPriceIds.forEach(key => console.error(`   - ${key}`))
  process.exit(1)
}

async function updateStripePriceIds() {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

  console.log('🔄 Updating Stripe Price IDs in subscription_plans...\n')

  // Update Pro plan
  console.log('📦 Updating Pro plan...')
  const { error: proError } = await supabase
    .from('subscription_plans')
    .update({
      stripe_monthly_price_id: priceIds.proMonthly,
      stripe_yearly_price_id: priceIds.proYearly,
    })
    .eq('name', 'pro')

  if (proError) {
    console.error('❌ Error updating Pro plan:', proError.message)
    process.exit(1)
  }
  console.log('✅ Pro plan updated')
  console.log(`   Monthly: ${priceIds.proMonthly}`)
  console.log(`   Yearly:  ${priceIds.proYearly}\n`)

  // Update Enterprise plan
  console.log('📦 Updating Enterprise plan...')
  const { error: enterpriseError } = await supabase
    .from('subscription_plans')
    .update({
      stripe_monthly_price_id: priceIds.enterpriseMonthly,
      stripe_yearly_price_id: priceIds.enterpriseYearly,
    })
    .eq('name', 'enterprise')

  if (enterpriseError) {
    console.error('❌ Error updating Enterprise plan:', enterpriseError.message)
    process.exit(1)
  }
  console.log('✅ Enterprise plan updated')
  console.log(`   Monthly: ${priceIds.enterpriseMonthly}`)
  console.log(`   Yearly:  ${priceIds.enterpriseYearly}\n`)

  // Verify updates
  console.log('🔍 Verifying updates...')
  const { data: plans, error: fetchError } = await supabase
    .from('subscription_plans')
    .select('name, display_name, stripe_monthly_price_id, stripe_yearly_price_id')
    .in('name', ['pro', 'enterprise'])
    .order('sort_order')

  if (fetchError) {
    console.error('❌ Error fetching plans:', fetchError.message)
    process.exit(1)
  }

  console.log('\n📋 Updated Plans:')
  console.table(plans)

  console.log('\n✅ All Stripe Price IDs updated successfully!')
}

updateStripePriceIds().catch(console.error)

