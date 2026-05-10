#!/bin/bash

# 1. Run the build first
./local.build.sh "$@"

if [ $? -ne 0 ]; then
    echo "Error: Build failed, skipping installation."
    exit 1
fi

echo ""
echo "--- Searching for newly generated APKs ---"

# Find APK files modified in the last 5 minutes
APK_FILES=$(find apps -name "*.apk" -mmin -5 | grep "release")

if [ -z "$APK_FILES" ]; then
    echo "No recent release APKs found to install."
    exit 0
fi

for apk in $APK_FILES; do
    echo "Installing: $apk"
    adb install -r "$apk"
    if [ $? -eq 0 ]; then
        echo "SUCCESS: Installed $apk"
    else
        echo "ERROR: Failed to install $apk"
    fi
done

echo ""
echo "Installation process finished!"
