# opentok-react-native

To give it a try:

0. Install [cocoapods][cocoapods] if you haven't already (`gem install cocoapods` should do)
1. `pod install`
2. Install watchman (e.g. `brew install watchman`)
3. Run `npm install` in the same directory as this readme.
4. Open `rtnb.xcworkspace`
5. Run (use a simulator)

Things to watch out for:

1. react-native expects to be able to run a server on port `8081` - watch out for that failing to
   start because you have something else running.
2. "Refresh" in the simulator (command+r) will cause the app to crash.
3. To run the app on your device open `AppDelegate.m` and find `localhost` and replace it with
   your the IP address of your machine (making sure your device can reach that IP!)

To make a build that will run on your device without being able to connect to your computer:

1. Run `npm run build` in the same directory as this readme.
2. If you've commented out the line ```jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];```
   now is the time to uncomment it.
3. Build & Run on a device to make sure rntb launch correctly in this build mode.
4. Archive, and then export to distribute via your desired mechanism. 
