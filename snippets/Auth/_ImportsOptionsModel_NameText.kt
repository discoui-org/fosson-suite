    internal val nameText: UiText = if (type == EntryImportType.ProtonAuthenticator) {
        UiText.Dynamic("Proton Authenticator")
    } else {
        UiText.Resource(id = nameResId)
    }
