// import { SettingsPage } from "@/components/settings-page";
import { ThemePickerButton } from "@/components/ThemePickerButton";
import { PushNotificationManager } from "@/components/PushNotificationManager"

export default function Page() {
    return (
        <div>
            <ThemePickerButton />

            <PushNotificationManager />
            {/* <SettingsPage /> */}
        </div>
    )
}