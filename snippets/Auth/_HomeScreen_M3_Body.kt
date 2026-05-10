    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(scrollBehavior.nestedScrollConnection),
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            LargeTopAppBar(
                title = {
                    Text(
                        text = stringResource(id = uiR.string.authenticator_proton_authenticator)
                    )
                },
                actions = {
                    IconButton(onClick = onSettingsClick) {
                        Icon(
                            painter = painterResource(id = uiR.drawable.ic_settings_alt),
                            contentDescription = null
                        )
                    }
                },
                colors = TopAppBarDefaults.largeTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    scrolledContainerColor = MaterialTheme.colorScheme.surfaceColorAtElevation(3.dp)
                ),
                scrollBehavior = scrollBehavior
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNewEntryClick,
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer
            ) {
                Icon(
                    painter = painterResource(id = uiR.drawable.ic_plus),
                    contentDescription = null
                )
            }
        }
    ) { paddingValues ->
        HomeContent(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues = paddingValues),
            state = state,
            listState = lazyListState,
            header = {
                SearchTextField(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    value = state.searchQuery,
                    onValueChange = ::onUpdateEntrySearchQuery
                )
            },
            onNewEntryClick = onNewEntryClick,
            onImportEntriesClick = onImportEntriesClick,
            onEditEntryClick = onEditEntryClick,
            onCopyEntryCodeClick = ::onCopyEntryCode,
            onDeleteEntryClick = onDeleteEntryClick,
            onRefreshEntries = ::onRefreshEntries,
            onEntriesSorted = ::onEntriesSorted
        )
    }
