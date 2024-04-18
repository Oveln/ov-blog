
import { signOut } from "@/lib/auth/auth"
import React from "react"
 
export default function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit">Signout with GitHub</button>
    </form>
  )
} 