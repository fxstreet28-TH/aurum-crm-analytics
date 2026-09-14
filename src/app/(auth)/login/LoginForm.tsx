'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ERROR_COPY: Record<string, string> = {
  unauthorized:
    'That account exists but is not a platform super admin. Ask Por to grant access.',
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(
    ERROR_COPY[searchParams.get('error') ?? ''] ?? null,
  )

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setPending(false)
      return
    }

    // The role gate lives in the proxy; confirm it here so a non-admin sees a
    // useful message instead of being bounced straight back to this form.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profile?.role !== 'super_admin') {
      await supabase.auth.signOut()
      setError(ERROR_COPY.unauthorized)
      setPending(false)
      return
    }

    router.replace(redirectTo)
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
