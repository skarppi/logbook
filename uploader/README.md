#  Logbook uploader for iOS 13

Automates synching of OpenTX logfiles to Logbook service. Just connect transmitter to iOS device's usb port or wirelessly via card reader such as Kingston MobileLite Wireless. All new flights are synched to Logbook server in a click of a button.

### Usage instructions

1. Put your transmitter it into Boot Loader mode

2. a) Connect usb cable to your iOS 13 device either directly via USB-C or Camera connection kit. The source folder is selected when clicking Refresh-button the first time and stored for later use. The folder can be changed by editing the source field. 

2. b) For wireless USB/SD-card readers configure name or ip address into source field (e.g. smb://MOBILITE)

2. Click Refresh-button

- App checks the timestamp of the latest flight from configured Logbook service
- Downloads all newer log files

3. Click Sync-button
- App uploads these flights to Logbook
- Existing flights are refreshed with the latest data but metadata (battery info, notes, etc) stays intact.

![screenshot](https://github.com/skarppi/logbook/raw/master/uploader/screenshot.jpg "Screenshot")

### Installation

```carthage update --platform iOS --no-use-binaries```
