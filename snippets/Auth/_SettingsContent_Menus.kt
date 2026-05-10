                    SelectorRow(
                        titleText = UiText.Resource(id = R.string.settings_appearance_title_theme),
                        options = settingsModel.themeOptions,
                        onSelectedOptionChange = { themeType ->
                            onThemeTypeChange(settingsModel, themeType)
                        }
                    )
                },
                {
                    val context = LocalContext.current
                    val bgOptions = remember(CustomThemeManager.backgroundMode) {
                        listOf("Default", "Black & White", "System (Material You)").map { label ->
                            object : UiSelectorOption<String> {
                                override val isSelected = (label == CustomThemeManager.backgroundMode)
                                override val text = UiText.Dynamic(label)
                                override val value = label
                                override val selectedType = label
                            }
                        }
                    }
                    SelectorRow(
                        titleText = UiText.Dynamic(value = "Background"),
                        options = bgOptions,
                        onSelectedOptionChange = { newMode -> CustomThemeManager.updateBackground(context, newMode) }
                    )
                },
                {
                    val context = LocalContext.current
                    val colorOptions = remember(CustomThemeManager.accentColorMode) {
                        listOf("Default", "Aesthetic Purple", "Aesthetic Blue", "Aesthetic Pink", "System (Material You)").map { label ->
                            object : UiSelectorOption<String> {
                                override val isSelected = (label == CustomThemeManager.accentColorMode)
                                override val text = UiText.Dynamic(label)
                                override val value = label
                                override val selectedType = label
                            }
                        }
                    }
                    SelectorRow(
                        titleText = UiText.Dynamic(value = "Accent Color"),
                        options = colorOptions,
                        onSelectedOptionChange = { newMode -> CustomThemeManager.updateAccent(context, newMode) }
                    )
                },
