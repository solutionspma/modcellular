const QRCode = require("qrcode")

const data = {
 "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME":
 "com.modcell.agent/.DeviceAdmin",
 "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION":
 "https://YOUR_SERVER/agent.apk"
}

QRCode.toFile("enroll.png", JSON.stringify(data))
