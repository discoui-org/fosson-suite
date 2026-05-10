fun Theme(isDarkTheme: Boolean = isNightMode(), content: @Composable () -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val dynamicColorScheme = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
        if (isDarkTheme) androidx.compose.material3.dynamicDarkColorScheme(context) else androidx.compose.material3.dynamicLightColorScheme(context)
    } else {
        if (isDarkTheme) androidx.compose.material3.darkColorScheme() else androidx.compose.material3.lightColorScheme()
    }

    // Provide Material 3 Theme directly
    androidx.compose.material3.MaterialTheme(
        colorScheme = dynamicColorScheme
    ) {
        // We still need to provide Proton's locals to prevent crashes, 
        // but we can just use defaults as everything will now use M3 colors
        androidx.compose.runtime.CompositionLocalProvider(
            LocalThemeColorScheme provides (if (isDarkTheme) ThemeColors.Dark else ThemeColors.Light),
            LocalThemeTypographyScheme provides ThemeTypography
        ) {
            content()
        }
    }
}
