/*
 * Copyright (c) 2025 Proton AG
 * This file is part of Proton AG and Proton Authenticator.
 */

package proton.android.authenticator.shared.ui.domain.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import android.os.Build

@Composable
fun isNightMode(): Boolean = isSystemInDarkTheme()

@Composable
fun isDarkTheme(themeType: ThemeType): Boolean = isSystemInDarkTheme() // Forced to System

/**
 * A proxy ThemeColors implementation that maps Proton's color properties 
 * to Material 3's dynamic color scheme.
 */
class MaterialYouThemeColors(val m3: ColorScheme, val isDark: Boolean) : ThemeColors() {
    override val accent: Color get() = m3.primary
    override val actionButtonBackgroundGradientTop: Color get() = m3.primaryContainer
    override val actionButtonBackgroundGradientBottom: Color get() = m3.primaryContainer
    override val actionButtonBorderGradientTop: Color get() = m3.outline
    override val actionButtonBorderGradientBottom: Color get() = m3.outlineVariant
    override val backgroundButtonBorderWeak: Color get() = m3.outline.copy(alpha = 0.5f)
    override val backgroundDropdown: Color get() = m3.surfaceContainerHigh
    override val backgroundGradientTop: Color get() = m3.background
    override val backgroundGradientBottom: Color get() = m3.background
    override val backgroundTopBar: Color get() = m3.surface
    override val buttonGradientTop: Color get() = m3.primary
    override val buttonGradientBottom: Color get() = m3.primary
    override val containerBackground: Color get() = m3.surfaceContainerLow
    override val containerBorder: Color get() = m3.outlineVariant
    override val containerInnerShadow: Color get() = Color.Transparent
    override val gradientBannerColor1: Color get() = m3.tertiary
    override val gradientBannerColor2: Color get() = m3.tertiary
    override val gradientBannerColor3: Color get() = m3.tertiary
    override val gradientBannerColor4: Color get() = m3.tertiary
    override val gradientBannerColor5: Color get() = m3.tertiary
    override val gradientBannerColor6: Color get() = m3.tertiary
    override val gradientBannerColor7: Color get() = m3.tertiary
    override val gradientBannerColor8: Color get() = m3.tertiary
    override val gradientBannerColor9: Color get() = m3.tertiary
    override val gradientBannerColor10: Color get() = m3.tertiary
    override val gradientButtonColor1: Color get() = m3.primary
    override val gradientButtonColor2: Color get() = m3.primary
    override val gradientTopBarColor1: Color get() = m3.surface
    override val gradientTopBarColor2: Color get() = m3.surface
    override val iconBackground: Color get() = m3.surfaceVariant
    override val iconBorder: Color get() = m3.outline
    override val inputBackground: Color get() = m3.surfaceContainerLowest
    override val inputBorder: Color get() = m3.outline
    override val inputBorderFocused: Color get() = m3.primary
    override val interactionPurple: Color get() = m3.primary.copy(alpha = 0.2f)
    override val interactionPurpleNorm: Color get() = m3.primary
    override val menuListBackground: Color get() = m3.surfaceContainerHigh
    override val menuListBorder: Color get() = m3.outlineVariant
    override val signalError: Color get() = m3.error
    override val signalDanger: Color get() = m3.error
    override val signalSuccess: Color get() = Color(0xFF4AB89A)
    override val signalWarning: Color get() = Color(0xFFFFB879)
    override val surface: Color get() = m3.onSurface
    override val surfaceContainerHigh: Color get() = m3.surfaceContainerHigh
    override val surfaceVariant: Color get() = m3.onSurfaceVariant
    override val textHint: Color get() = m3.onSurfaceVariant
    override val textNorm: Color get() = m3.onSurface
    override val textPlaceholder: Color get() = m3.onSurfaceVariant.copy(alpha = 0.6f)
    override val textWeak: Color get() = m3.onSurfaceVariant
}

/**
 * A proxy Typography implementation that maps Proton's types to standard Material 3
 */
fun createM3TypographyBridge(m3: Typography): ThemeTypography = object : ThemeTypography() {
    override val title: TextStyle @Composable get() = m3.headlineMedium
    override val subtitle: TextStyle @Composable get() = m3.titleMedium
    override val headline: TextStyle @Composable get() = m3.headlineSmall
    override val bodyRegular: TextStyle @Composable get() = m3.bodyLarge
    override val bodyBold: TextStyle @Composable get() = m3.bodyLarge
    override val body1Regular: TextStyle @Composable get() = m3.bodyLarge
    override val body1Medium: TextStyle @Composable get() = m3.bodyLarge
    override val body2Regular: TextStyle @Composable get() = m3.bodyMedium
    override val body2Medium: TextStyle @Composable get() = m3.bodyMedium
    override val body3Regular: TextStyle @Composable get() = m3.labelSmall
    override val body3Bold: TextStyle @Composable get() = m3.labelSmall
    override val captionRegular: TextStyle @Composable get() = m3.labelLarge
    override val header: TextStyle @Composable get() = m3.labelSmall
}

@Composable
fun Theme(isDarkTheme: Boolean = isNightMode(), content: @Composable () -> Unit) {
    val context = LocalContext.current
    // We ignore the isDarkTheme parameter and always follow system
    val forcedDark = isNightMode()
    val dynamicColorScheme = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        if (forcedDark) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
    } else {
        if (forcedDark) darkColorScheme() else lightColorScheme()
    }
    
    val m3Typography = Typography()

    MaterialTheme(
        colorScheme = dynamicColorScheme,
        typography = m3Typography
    ) {
        CompositionLocalProvider(
            LocalThemeColorScheme provides MaterialYouThemeColors(dynamicColorScheme, forcedDark),
            LocalThemeTypographyScheme provides createM3TypographyBridge(m3Typography),
            androidx.compose.material3.LocalContentColor provides dynamicColorScheme.onSurface,
            androidx.compose.material3.LocalAbsoluteTonalElevation provides 0.dp
        ) {
            content()
        }
    }
}

object Theme {
    val colorScheme: ThemeColors
        @Composable
        @ReadOnlyComposable
        get() = LocalThemeColorScheme.current

    val typography: ThemeTypography
        @Composable
        @ReadOnlyComposable
        get() = LocalThemeTypographyScheme.current
}
