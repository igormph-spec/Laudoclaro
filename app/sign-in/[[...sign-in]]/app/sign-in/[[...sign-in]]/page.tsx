import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <SignIn />
    </main>
  )
}
