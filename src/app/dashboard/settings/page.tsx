import { getUserProfile } from "@/app/dashboard/settings/actions"
import { ProfileForm, BrandingForm, DangerZone } from "@/components/settings/settings-forms"
import { Separator } from "@/components/ui/separator"

export default async function SettingsPage() {
  const user = await getUserProfile()

  if (!user) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Unable to load user profile.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <div className="space-y-6">
        <ProfileForm user={user} />
        <BrandingForm user={user} />
        <DangerZone />
      </div>
    </div>
  )
}
