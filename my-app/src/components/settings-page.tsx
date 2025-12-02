'use client'

import { Bell, Lock, User, Keyboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function SettingsPage() {
  return (
    <div className="flex h-screen dark:bg-muted">
      {/* Sidebar */}
      <aside className="w-64   p-4">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            Account
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Lock className="mr-2 h-4 w-4" />
            Privacy
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Keyboard className="mr-2 h-4 w-4" />
            Accessibility
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 dark:bg-foreground overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <h1 className="text-3xl font-bold mb-6">UNDER DEVELOPMENT</h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Your email" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="public-profile">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                </div>
                <Switch id="public-profile" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-email">Show Email</Label>
                  <p className="text-sm text-muted-foreground">Display your email to other users</p>
                </div>
                <Switch id="show-email" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch id="email-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                </div>
                <Switch id="push-notifications" />
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Settings */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>Customize your accessibility preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch id="high-contrast" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="large-text">Large Text</Label>
                  <p className="text-sm text-muted-foreground">Increase text size throughout the app</p>
                </div>
                <Switch id="large-text" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}