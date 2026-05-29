# Mobile Build Guide

## Install dependencies

npm install

## Android

npx cap add android
npm run android:build
npx cap open android

Then build APK/AAB inside Android Studio.

## iOS

npx cap add ios
npm run ios:build
npx cap open ios

Then archive inside Xcode.
