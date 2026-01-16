import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Palette, Database, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
              <Input id="name" placeholder="Your name" disabled className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" disabled className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Account management will be available in a future update.
          </p>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
            <Palette className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Theme</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred color scheme</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Section */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-gray-100">
            <Database className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Local Storage</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Projects are saved locally in your browser</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20">
              Clear All Local Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
