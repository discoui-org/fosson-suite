fun Theme(isDarkTheme: Boolean = isNightMode(), content: @Composable () -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val dynamicColorScheme = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
        if (isDarkTheme) androidx.compose.material3.dynamicDarkColorScheme(context) else androidx.compose.material3.dynamicLightColorScheme(context)
    } else null
    
    androidx.compose.runtime.LaunchedEffect(CustomThemeManager.accentColorMode, CustomThemeManager.backgroundMode, isDarkTheme, dynamicColorScheme) {
        CustomThemeManager.init(context)
        dynamicColorScheme?.let {
            CustomThemeManager.systemAccent = it.primary
            CustomThemeManager.systemAccentSecondary = it.secondary
            CustomThemeManager.systemBackground = it.surface // Use system surface color for background
        }
    }
