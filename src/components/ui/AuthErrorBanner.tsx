'use client'

import { useSearchParams } from 'next/navigation'

export default function AuthErrorBanner() {
  const params = useSearchParams()
  const errorCode = params.get('error_code')
  const errorDesc = params.get('error_description')

  if (!errorCode) return null

  const isExpired = errorCode === 'otp_expired'
  const title = isExpired ? 'Your sign-in link expired.' : 'Sign-in failed.'
  const body = isExpired
    ? 'Magic links expire after a short window. Head back to sign in and request a new one.'
    : errorDesc
      ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
      : 'Something went wrong with your sign-in link. Please try again.'

  return (
    <div style={{
      maxWidth: 540,
      margin: 'var(--space-10) auto 0',
      padding: '0 var(--space-6)',
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderLeft: '4px solid var(--color-red)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
      }}>
        <p style={{
          margin: '0 0 var(--space-2)',
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-primary)',
        }}>{title}</p>
        <p style={{
          margin: '0 0 var(--space-4)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
        }}>{body}</p>
        <a href="/signin" style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-small)',
          color: '#fff',
          backgroundColor: 'var(--color-red)',
          textDecoration: 'none',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--btn-radius)',
          display: 'inline-block',
        }}>
          Request a new link →
        </a>
      </div>
    </div>
  )
}
