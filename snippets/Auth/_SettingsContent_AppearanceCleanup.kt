        SettingsSection(
            title = stringResource(id = R.string.settings_appearance_section),
            contents = listOf(
                {
                    SelectorRow(
                        titleText = UiText.Resource(id = R.string.settings_appearance_title_theme),
                        options = settingsModel.themeOptions,
                        onSelectedOptionChange = { themeType ->
                            onThemeTypeChange(settingsModel, themeType)
                        }
                    )
                },
                {
                    SelectorRow(
                        titleText = UiText.Resource(id = R.string.settings_appearance_title_sorting),
                        options = settingsModel.sortingOptions,
                        onSelectedOptionChange = { sortingType ->
                            onSortingTypeChange(settingsModel, sortingType)
                        }
                    )
                }
            )
        )
