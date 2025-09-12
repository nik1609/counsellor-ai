'user client'

import {SessionProvider} from 'next-auth/react'

export function AuthProvider({children} : {children: React.ReactNode}) {
    <SessionProvider>{children}</SessionProvider>
}