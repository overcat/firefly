# firefly wallet [![Build Status](https://travis-ci.org/StellarCN/firefly.svg)](https://travis-ci.org/StellarCN/firefly)

firefly is a mobile wallet for [Stellar](https://stellar.org) network. It supports android and ios platforms

## [Help Document](https://wallet.fchain.io/manual/#0)

## Main features:
* Accounts
	* Import By QRCode
	* Create Random Account
	* NameCard
	* Export Account
	* Funding Account
	* Federation
	* Inflation
* Contacts
	* Import By QRCode
	* Export QRCode
* Assets
	* Send Asset
	* Send Asset By QRCode
	* Receive Asset
	* Trust
* Funding
	* Deposite
	* Withdraw
* Trade
	* Custom Trade Pair
	* Order Book
	* Cancel Trade
* Security
	* PIN
	* Password
	* Data Saved Locally
* Custom horizon
* Multi Language


## Building
```
npm install -g cordova
npm install
npm run build
cordova prepare
```

### Build APK Need
- android studio
- android sdk 19 +

### Build IPA Need
- xcode

### Want to build Android application from source code in a easy way?

You need to make sure your computer has Docker installed, then run the following command
```
docker run -it --rm -v `pwd`/fireflyapk:/fireflyapk overcat/firefly
```
you can find the generated APK in the fireflyapk folder.


## License
**firefly** is released under **MIT License**


