import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Sign in · AURUM CRM' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-light text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-lg font-semibold text-ink">AURUM CRM Analytics</h1>
          <p className="mt-1 text-sm text-ink-faint">Platform operators only</p>
        </div>
        <Suspense fallback={<div className="h-64" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
