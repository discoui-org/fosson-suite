    internal fun asSettings(): Settings = Settings(
        isSyncEnabled = isSyncEnabled,
        appLockType = appLockType,
        isHideCodesEnabled = isHideCodesEnabled,
        themeType = themeType,
        searchBarType = searchBarType, // Arayüzden kalktı ama mevcut değer korunuyor
        digitType = proton.android.authenticator.business.settings.domain.SettingsDigitType.Plain,
        sortingType = sortingType,
        isCodeChangeAnimationEnabled = true, // Statik olarak ON
        isPassBannerDismissed = isPassBannerDismissed,
        isUndecryptableEntriesWarningDismissed = isUndecryptableEntriesWarningDismissed,
        hasUndecryptableEntries = hasUndecryptableEntries,
        isFirstRun = isFirstRun,
        installationTime = installationTime
    )
