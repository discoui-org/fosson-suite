                    header = {
                        SearchTextField(
                            modifier = androidx.compose.ui.Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            value = state.searchQuery,
                            onValueChange = ::onUpdateEntrySearchQuery
                        )
                    }
