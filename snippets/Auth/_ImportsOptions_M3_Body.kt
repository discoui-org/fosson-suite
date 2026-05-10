        val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
        Scaffold(
            modifier = Modifier.fillMaxSize().nestedScroll(scrollBehavior.nestedScrollConnection),
            containerColor = MaterialTheme.colorScheme.background,
            topBar = {
                LargeTopAppBar(
                    title = { Text(text = "Import") },
                    navigationIcon = {
                        IconButton(onClick = onNavigationClick) {
                            Icon(painter = painterResource(id = R.drawable.ic_arrow_left), contentDescription = null)
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
            ImportsOptionsContent(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues = innerPaddingValues),
                state = state,
                onOptionSelected = { option ->
                    onImportTypeSelected(option.type.ordinal)
                }
            )
        }
