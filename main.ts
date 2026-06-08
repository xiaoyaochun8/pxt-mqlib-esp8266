/**
 * esp8266 blocks
 */
//% groups=['esp8266']
namespace mqlib {

    // write AT command with CR+LF ending
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266SendAT(command: string, wait: number = 100) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }

    // 基础指令
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTest() {
        Esp8266SendAT("AT")
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtReset() {
        Esp8266SendAT("AT+RST")
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtVersion() {
        Esp8266SendAT("AT+GMR")
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtRestore() {
        Esp8266SendAT("AT+RESTORE")
    }

    // WIFI指令
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtWifiSetMode(i:number) {
        Esp8266SendAT("AT+CWMODE="+i)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtWifiConnect(name: string, pw: string) {
        Esp8266SendAT("AT+CWJAP=" + name + "," + pw)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtWifiUnConnect() {
        Esp8266SendAT("AT+CWQAP")
    }

    // TCP/UDP指令
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTcpSetConnectNum(i: number) {
        Esp8266SendAT("AT+CIPMUX=" + i)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTcpConnectServer(ip: string, port: string) {
        Esp8266SendAT("AT+CIPSTART=TCP," + ip + "," + port)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTcpSendData(s: string, handle: Function) {
        let len = s.length
        Esp8266SendAT("AT+CIPSEND=" + len + 2)
        Esp8266SendAT(s)
        handle()
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTcpClose() {
        Esp8266SendAT("AT+CIPClose")
    }


    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtQuick(
        name: string,
        pw: string,
        ip: string,
        port: string,
        sendData: string,
        handle: Function
    ) {
        // let handle = function () {
        //     let str = serial.readString()
        // }
        Esp8266AtWifiSetMode(1)
        Esp8266AtWifiConnect(name, pw)
        Esp8266AtTcpConnectServer(ip, port)
        Esp8266AtTcpSendData(sendData, handle)
        Esp8266AtTcpClose()
        Esp8266AtWifiUnConnect()
    }
}