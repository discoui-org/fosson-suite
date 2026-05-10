/*
 * Copyright (c) 2025 Proton AG
 * This file is part of Proton AG and Proton Authenticator.
 */

package proton.android.authenticator.shared.ui.domain.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ProvidableCompositionLocal
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

open class ThemeTypography {
    @Stable open val bodyRegular: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Normal, fontSize = 18.sp, lineHeight = 22.sp)
    @Stable open val bodyBold: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Bold, fontSize = 18.sp, lineHeight = 22.sp)
    @Stable open val body1Bold: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Bold, fontSize = 16.sp, lineHeight = 22.sp)
    @Stable open val body3Bold: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Bold, fontSize = 13.sp, lineHeight = 16.sp)
    @Stable open val body1Regular: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Normal, fontSize = 15.sp, lineHeight = 22.sp)
    @Stable open val body2Regular: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 18.sp)
    @Stable open val body3Regular: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Normal, fontSize = 13.sp, lineHeight = 16.sp)
    @Stable open val body1Medium: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 22.sp)
    @Stable open val body2Medium: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, lineHeight = 18.sp)
    @Stable open val captionRegular: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 14.sp)
    @Stable open val compactMedium: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, lineHeight = 18.sp)
    @Stable open val header: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 14.sp)
    @Stable open val headline: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Bold, fontSize = 20.sp, lineHeight = 26.sp)
    @Stable open val title: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Bold, fontSize = 32.sp, lineHeight = 38.sp)
    @Stable open val subtitle: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Bold, fontSize = 26.sp, lineHeight = 38.sp)
    
    // Mono styles
    @Stable open val monoMedium1: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.SemiBold, fontSize = 28.sp)
    @Stable open val monoMedium2: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 14.sp)
    @Stable open val monoNorm1: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 20.sp, lineHeight = 20.sp)
    @Stable open val monoNorm2: TextStyle @Composable @ReadOnlyComposable get() = TextStyle(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 18.sp)

    companion object Default : ThemeTypography()
}

internal val LocalThemeTypographyScheme: ProvidableCompositionLocal<ThemeTypography> =
    staticCompositionLocalOf {
        ThemeTypography.Default
    }
