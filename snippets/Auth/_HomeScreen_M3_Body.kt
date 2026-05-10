    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
    var isSearchActive by remember { mutableStateOf(false) }

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
                    IconButton(onClick = { isSearchActive = !isSearchActive }) {
                        Icon(
                            painter = painterResource(id = uiR.drawable.ic_magnifier),
                            contentDescription = null
                        )
                    }
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
            onNewEntryClick = onNewEntryClick,
            onImportEntriesClick = onImportEntriesClick,
            onEditEntryClick = onEditEntryClick,
            onCopyEntryCodeClick = ::onCopyEntryCode,
            onDeleteEntryClick = onDeleteEntryClick,
            onRefreshEntries = ::onRefreshEntries,
            onEntriesSorted = ::onEntriesSorted
        )
    }
