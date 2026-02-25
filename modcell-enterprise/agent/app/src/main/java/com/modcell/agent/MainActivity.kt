package com.modcell.agent

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import android.provider.Settings
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.coroutines.*
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    // Set to your policy server base URL (e.g. http://192.168.1.100:7070)
    private val policyBaseUrl = "http://YOUR_SERVER_IP:7070"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startPolicyLoop()
        startTelemetryLoop()
    }

    private fun startPolicyLoop() {
        CoroutineScope(Dispatchers.IO).launch {
            while (true) {
                applyPolicy()
                delay(60000)
            }
        }
    }

    private fun startTelemetryLoop() {
        CoroutineScope(Dispatchers.IO).launch {
            while (true) {
                postTelemetry()
                delay(30000)
            }
        }
    }

    private fun applyPolicy() {
        try {
            val json = URL("$policyBaseUrl/policy").readText()
            val p = JSONObject(json).getJSONObject("apn")

            val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            val admin = ComponentName(this, DeviceAdmin::class.java)

            if (Build.VERSION.SDK_INT >= 28) {
                val apn = DevicePolicyManager.ApnSetting.Builder()
                    .setEntryName(p.optString("name", "MODCELL"))
                    .setApn(p.getString("apn"))
                    .setMcc(p.getString("mcc"))
                    .setMnc(p.getString("mnc"))
                    .build()
                dpm.addOverrideApn(admin, apn)
                dpm.setOverrideApnsEnabled(admin, true)
            }
        } catch (e: Exception) {
            // Policy fetch or apply failed
        }
    }

    /**
     * POST telemetry every 30s. Payload format:
     * { rsrp, rssi, cellId, tac, mcc, mnc, signalBars, batteryPct, timestamp }
     */
    private fun postTelemetry() {
        try {
            val policy = JSONObject(URL("$policyBaseUrl/policy").readText())
            val telemetry = policy.optJSONObject("telemetry") ?: return
            val postUrl = telemetry.optString("postUrl") ?: return
            if (postUrl.isEmpty() || postUrl.contains("YOUR_")) return

            val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown"

            val payload = JSONObject().apply {
                put("rsrp", 0)
                put("rssi", 0)
                put("cellId", 0)
                put("tac", 0)
                put("mcc", "")
                put("mnc", "")
                put("signalBars", 0)
                put("batteryPct", 0)
                put("timestamp", System.currentTimeMillis())
            }

            val url = URL(postUrl.trimEnd('/') + "/$deviceId")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true
            conn.outputStream.use { it.write(payload.toString().toByteArray()) }
            conn.responseCode
            conn.disconnect()
        } catch (e: Exception) {
            // Telemetry post failed
        }
    }
}
