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
                        text = stringResource(id = R.string.settings_screen_title)
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigationClick) {
                        Icon(
                            painter = painterResource(id = uiR.drawable.ic_arrow_left),
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
        }
    ) { paddingValues ->
        when (val currentState = state) {
            SettingsMasterState.Loading -> Unit
            is SettingsMasterState.Ready -> {
                SettingsContent(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(state = scrollState)
                        .navigationBarsPadding()
                        .padding(paddingValues = paddingValues)
                        .padding(horizontal = ThemePadding.Medium),
                    state = currentState,
                    onDismissPassBanner = ::onUpdateIsPassBannerDismissed,
                    onBackupsClick = onBackupsClick,
                    onSyncChange = ::onUpdateIsSyncEnabled,
                    onAppLockTypeChange = ::onUpdateAppLockType,
                    onTapToRevealChange = ::onUpdateIsTapToRevealEnabled,
                    onThemeTypeChange = ::onUpdateThemeType,
                    onSearchBarTypeChange = ::onUpdateSearchBarType,
                    onDigitTypeChange = ::onUpdateDigitType,
                    onSortingTypeChange = ::onUpdateSortingType,
                    onCodeChangeAnimationChange = ::onUpdateIsCodeChangeAnimationEnabled,
                    onImportClick = onImportClick,
                    onExportClick = onExportClick,
                    onHowToClick = onHowToClick,
                    onFeedbackClick = onFeedbackClick,
                    onDiscoverAppClick = onDiscoverAppClick,
                    onViewLogsClick = onViewLogsClick,
                    onShareTelemetryChange = ::onToggleShareTelemetry,
                    onShareCrashReportChange = ::onToggleShareCrashReport,
                    onVersionNameClick = onVersionNameClick
                )
            }
        }
    }
