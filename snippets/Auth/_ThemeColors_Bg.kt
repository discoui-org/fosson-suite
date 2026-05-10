        override val backgroundGradientTop: Color get() = CustomThemeManager.getBackgroundColor(this is ThemeColors.Dark) ?: Color(color = 0xFF2D2A28)

        override val backgroundGradientBottom: Color get() = CustomThemeManager.getBackgroundColor(this is ThemeColors.Dark) ?: Color(color = 0xFF161514)
