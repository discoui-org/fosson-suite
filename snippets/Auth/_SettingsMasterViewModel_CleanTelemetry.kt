    internal fun onConsumeEvent(event: SettingsMasterEvent) {
        eventFlow.compareAndSet(expect = event, update = SettingsMasterEvent.Idle)
    }

    internal fun onUpdateIsPassBannerDismissed(settingsModel: SettingsMasterSettingsModel) {
