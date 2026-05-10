data class SettingsMasterSettingsModel(
    val isSyncEnabled: Boolean,
    private val _isCodeChangeAnimationEnabled: Boolean,
    val isTapToRevealEnabled: Boolean,
    val appLockType: AppLockType,
    private val _digitType: DigitType,
    val sortingType: SortingType,
    val themeType: ThemeType,
    private val _searchBarType: UpdateSearchBarType,
    val isPassBannerDismissed: Boolean,
    val appConfig: AppConfig
) {
    val isCodeChangeAnimationEnabled: Boolean = true
    val digitType: DigitType = DigitType.Plain
    val searchBarType: UpdateSearchBarType = UpdateSearchBarType.Top
