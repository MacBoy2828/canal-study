#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk/jdk-17.0.20+8}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

if [[ ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "JAVA_HOME is invalid: $JAVA_HOME"
  echo "Install JDK 17 or set JAVA_HOME to your JDK path."
  exit 1
fi

cd "$ROOT/android"
./gradlew assembleRelease "$@"
mkdir -p "$ROOT/dist"
cp -f "$ROOT/android/app/build/outputs/apk/release/app-release.apk" "$ROOT/dist/Canal-Study.apk"
echo "APK ready: $ROOT/dist/Canal-Study.apk"
