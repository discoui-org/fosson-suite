    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
    Scaffold(
        modifier = Modifier.fillMaxSize().nestedScroll(scrollBehavior.nestedScrollConnection),
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            LargeTopAppBar(
                title = { Text(text = stringResource(id = R.string.backups_screen_title)) },
                navigationIcon = {
                    IconButton(onClick = onNavigationClick) {
                        Icon(painter = painterResource(id = uiR.drawable.ic_arrow_left), contentDescription = null)
                    }
                },
                colors = TopAppBarDefaults.largeTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    scrolledContainerColor = MaterialTheme.colorScheme.surfaceColorAtElevation(3.dp)
                ),
                scrollBehavior = scrollBehavior
            )
        }
    ) { innerPaddingValues ->
        BackupsMasterContent(
            modifier = Modifier
                .fillMaxWidth()
                .padding(paddingValues = innerPaddingValues)
                .padding(horizontal = ThemePadding.Medium),
            state = state,
            onDisableBackup = onDisableBackup,
            onFolderPicked = onFolderPicked,
            onFrequencyChange = onUpdateFrequencyType,
            onBackupNowClick = onCreateBackup
        )
    }
