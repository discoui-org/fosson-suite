package proton.android.authenticator.shared.ui.domain.theme

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color

object CustomThemeManager {
    private const val PREFS_NAME = "custom_theme_prefs"
    
    var backgroundMode by mutableStateOf("Proton Default")
    var accentColorMode by mutableStateOf("Proton Default")
    
    var systemAccent by mutableStateOf<Color?>(null)
    var systemAccentSecondary by mutableStateOf<Color?>(null)
    var systemBackground by mutableStateOf<Color?>(null)

    private var isInitialized = false

    fun init(context: Context) {
        if (isInitialized) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        backgroundMode = prefs.getString("bg_mode", "Proton Default") ?: "Proton Default"
        accentColorMode = prefs.getString("accent_mode", "Proton Default") ?: "Proton Default"
        isInitialized = true
    }

    fun updateBackground(context: Context, mode: String) {
        backgroundMode = mode
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putString("bg_mode", mode).apply()
    }

    fun updateAccent(context: Context, mode: String) {
        accentColorMode = mode
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putString("accent_mode", mode).apply()
    }

    fun getAccentColor(): Color? = when (accentColorMode) {
        "Aesthetic Purple" -> Color(0xFF6D4CFF)
        "Aesthetic Blue" -> Color(0xFF3691FF)
        "Aesthetic Pink" -> Color(0xFFFF6DAB)
        "System (Material You)" -> systemAccent
        else -> null
    }

    fun getAccentSecondaryColor(): Color? = when (accentColorMode) {
        "Aesthetic Purple" -> Color(0xFF573BCC)
        "Aesthetic Blue" -> Color(0xFF2A70C6)
        "Aesthetic Pink" -> Color(0xFFCC5789)
        "System (Material You)" -> systemAccentSecondary
        else -> null
    }

    fun getDarkBgColor(): Color? = when (backgroundMode) {
        "AMOLED" -> Color.Black
        "System (Material You)" -> systemBackground
        else -> null
    }
}
