# 萤火钱包[![Build Status](https://travis-ci.org/StellarCN/firefly.svg)](https://travis-ci.org/StellarCN/firefly)

萤火钱包是[恒星网络](https://stellar.org)的手机钱包，支持安卓和IOS平台

## [帮助文档](https://wallet.fchain.io/manual/#0)

## 主要功能:
* 多账户
	* 二维码导入
	* 创建随机账户
	* 账户名片
	* 导出账户二维码
	* 激活账户
	* 支持联邦地址
	* 支持通胀池
* 联系人
	* 二维码导入
	* 导出二维码
* 资产
	* 发送资产
	* 扫描二维码发送资产
	* 接收资产
	* 信任资产
* 充值提现
	* 充值
	* 提现
* 交易
	* 自定义交易对
	* 交易盘面
	* 撤消委单
* 安全
	* PIN
	* 密码
	* 数据保存在本地
* 支持自定义horizon
* 多语言



## 构造
```
npm install -g cordova
npm install
npm run build
cordova prepare
```

### 生成APK需要用到
- android studio
- android sdk 19 +

### 生在IPA需要
- xcode

### 想从源代码构建 Android 应用但又不想配置各种烦琐的环境？来试试我们的代码构建镜像吧。

你需要确认你的计算机已经安装了 Docker ，然后执行下面这条命令
```
docker run -it --rm -v `pwd`/fireflyapk:/fireflyapk overcat/firefly
```
构建完成后你可以在 fireflyapk 文件夹中找到生成的 APK 。


## 开源协议
**萤火钱包** 使用 **MIT License**


