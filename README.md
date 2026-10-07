# ReWP
> **WARNING!! ReWP and malivewp aren't created/sponsored/developed by/related with Microsoft Corporation**

> Used Gemini to create this. Used in [`DeviceCertificates`](/Services/DeviceCertificates.js).

A server of malivewp

> malivewp - an __unofficial__ Microsoft services on Windows Phone 8.1 revival.

## Status
> Version status: **ALPHA**

### Primary services
- [x] "Discovery" service
- [x] "Device certification" service (based on [ReLiveWP code](https://github.com/ReLiveWP/ReLiveWP))
- [ ] Login (needs `/ppsecure/InlineConnect.srf` / `InlineLogin.srf` WP8.1 page)
    - [ ] Database integration
    - [ ] `RST`
- [ ] Exchange (emails, contacts, calendar, profile picture)
### Foreign services
- [ ] OneDrive
- [ ] Rooms
    - [ ] Messaging
    - [ ] Sync
- [ ] Marketplace (store)
    - [ ] Licensing service
- [ ] `Find My Phone` service
- [ ] Settings sync
### Maybe
- [ ] Xbox Live services
- [ ] Maps and geolocation
### Not planned
- [ ] Malive / ReWP patcher

## How to contribute?
- For services add:
    1. Add `<your service name>.js` to [`Services` folder](/Services/).
        > __`module.exports` is Express app__
    2. Add service in [`List.json`](/Services/List.json) by including record like this in `List`'s array:
        |Name|Value type|Description|
        |-|-|-|
        |`name`|`string`|Name of service|
        |`domains`|`array` of `string`s|Array of domains (can be `*.*`/`*.*.*.*`/etc)|
        |`monikers`|**OPTIONAL**. `array` of "moniker"s|Array of monikers - aliases for domains, used by `discoveryservice` (see [`Discovery` service](/Services/Discovery.js))| 

## How to connect my WP8.1 device to this service?
TODO.

## Credits
- [ReLiveWP](https://github.com/ReLiveWP/ReLiveWP)
    - For certificate generation code.