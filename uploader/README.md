#  Logbook uploader for iOS

Automates synching of OpenTX logfiles to Logbook service when using wireless card readers such as Kingston MobileLite Wireless.

### Usage instructions

1. Connect you transmitter to MobileLite with USB cable and put it into Boot Loader mode so the contents of the SD-card can be accessed wirelessly.

2. Click Refresh-button

- App checks the timestamp of the latest flight from Logbook service
- Downloads all newer log files

3. Click Sync-button
- App uploads these flights to Logbook
- Existing flights are refreshed with the latest data but metadata (battery info, notes, etc) stays intact.

![screenshot](https://github.com/skarppi/logbook/raw/master/uploader/screenshot.jpg "Screenshot")

### Installation

```carthage update --platform iOS --no-use-binaries```
