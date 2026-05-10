#!/bin/bash

# Configuration
KEYSTORE_FILE="/Users/upndown/protonsignkey/my-release-key.jks"
KEYSTORE_PASSWORD="Hug8-Confidant4-Snoring9-Stylishly1-Curly0"
KEY_ALIAS="my-alias"
KEY_PASSWORD="Hug8-Confidant4-Snoring9-Stylishly1-Curly0"

# Parse arguments
TARGET_APP=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app) TARGET_APP="$2"; shift ;;
        *) 
            if [[ "$1" != --* ]]; then
                TARGET_APP="$1"
            else
                echo "Unknown parameter passed: $1"; exit 1
            fi
            ;;
    esac
    shift
done

echo "Starting local build process..."

# 1. Reset everything
echo "--- Resetting source code ---"
npm run reset

# 2. Patch
echo "--- Applying patches ---"
if [ -n "$TARGET_APP" ]; then
    npm run patch -- --app "$TARGET_APP"
else
    npm run patch
fi

# 3. Build function
build_app() {
    local json_file=$1
    # Extract appPath and appName from JSON using node (simple and available)
    local app_path=$(node -e "console.log(require('./$json_file').appPath)")
    local app_name=$(node -e "console.log(require('./$json_file').appName)")
    
    echo ""
    echo "===================================================="
    echo "BUILDING: $app_name (at $app_path)"
    echo "===================================================="
    echo ""
    
    cd "$app_path" || return
    
    ./gradlew assembleFdroidProdRelease \
      -PMYAPP_RELEASE_STORE_FILE="$KEYSTORE_FILE" \
      -PMYAPP_RELEASE_STORE_PASSWORD="$KEYSTORE_PASSWORD" \
      -PMYAPP_RELEASE_KEY_ALIAS="$KEY_ALIAS" \
      -PMYAPP_RELEASE_KEY_PASSWORD="$KEY_PASSWORD"
      
    if [ $? -eq 0 ]; then
        echo "SUCCESS: $app_name build completed!"
    else
        echo "ERROR: $app_name build failed!"
        exit 1
    fi
    
    cd - > /dev/null || exit
}

# 4. Iterate and build
cd "$(dirname "$0")" || exit
if [ -n "$TARGET_APP" ]; then
    # Find the matching json file
    JSON_FILE=$(find patches -maxdepth 1 -iname "${TARGET_APP}.json" | head -n 1)
    if [ -f "$JSON_FILE" ]; then
        build_app "$JSON_FILE"
    else
        echo "Error: Config for $TARGET_APP not found."
        exit 1
    fi
else
    # Build all
    for f in patches/*.json; do
        build_app "$f"
    done
fi

echo ""
echo "All done! APKs should be in their respective build/outputs/apk folders."
