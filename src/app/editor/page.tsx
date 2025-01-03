'use client'

import dynamic from 'next/dynamic'
import AuthGuard from "@/components/auth-guard"

const EditorLayout = dynamic(
  () => import('@/components/editor/editor-layout'),
  { ssr: false }
)

export default function EditorPage() {
  return (
    <AuthGuard>
      <EditorLayout />
    </AuthGuard>
  )
}
