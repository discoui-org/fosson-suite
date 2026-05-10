                    SelectorRow(
                        titleText = UiText.Resource(id = R.string.settings_appearance_title_theme),
                        options = settingsModel.themeOptions,
                        onSelectedOptionChange = { themeType ->
                            onThemeTypeChange(settingsModel, themeType)
                        }
                    )
