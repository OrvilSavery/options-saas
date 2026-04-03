import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from './db'

export async function ensureUserRecord() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const clerkUser = await currentUser()

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null

  const { data: existingUser, error: findError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (findError) {
    throw new Error(`Failed to look up user: ${findError.message}`)
  }

  if (existingUser) {
    return existingUser
  }

  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      clerk_user_id: userId,
      email,
    })
    .select()
    .single()

  if (insertError) {
    throw new Error(`Failed to create user: ${insertError.message}`)
  }

  return newUser
}