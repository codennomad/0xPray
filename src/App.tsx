import { BrowserRouter, Routes, Route } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/toaster'
import Home from '@/pages/Home'
import Prayers from '@/pages/Prayers'
import Editor from '@/pages/Editor'
import Focus from '@/pages/Focus'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prayers" element={<Prayers />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/focus/:id" element={<Focus />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppShell>
      </ToastProvider>
    </BrowserRouter>
  )
}
