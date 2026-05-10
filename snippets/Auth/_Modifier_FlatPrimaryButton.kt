fun Modifier.backgroundPrimaryButton(isEnable: Boolean = true, blur: Dp = 0.dp) = composed {
    val shape = remember { CircleShape }

    val colors = if (isEnable) {
        listOf(
            Theme.colorScheme.buttonGradientTop,
            Theme.colorScheme.buttonGradientBottom
        )
    } else {
        listOf(
            Theme.colorScheme.buttonGradientTop.copy(alpha = 0.38f),
            Theme.colorScheme.buttonGradientBottom.copy(alpha = 0.38f)
        )
    }

    clip(shape = shape)
        .background(brush = Brush.verticalGradient(colors = colors))
        .border(
            shape = shape,
            width = ThemeThickness.Small,
            color = Theme.colorScheme.whiteAlpha12
        )
}
