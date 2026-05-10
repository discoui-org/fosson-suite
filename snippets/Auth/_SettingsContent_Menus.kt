                    // Accent color stays for future use, but for now only shows Default
                    SelectorRow(
                        titleText = UiText.Dynamic("Accent color"),
                        options = listOf(
                            object : proton.android.authenticator.shared.ui.domain.models.UiSelectorOption<String> {
                                override val isSelected: Boolean = true
                                override val text: UiText = UiText.Dynamic("Default")
                                override val selectedType: String = "default"
                                override val value: String = "default"
                            }
                        ),
                        onSelectedOptionChange = { /* Do nothing for now */ }
                    )
                },
