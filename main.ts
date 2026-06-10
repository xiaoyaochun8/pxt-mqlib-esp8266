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
    export function Esp8266AtTest(wait: number = 100) {
        Esp8266SendAT("AT", wait)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtReset(wait: number = 100) {
        Esp8266SendAT("AT+RST", wait)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtVersion(wait: number = 100) {
        Esp8266SendAT("AT+GMR", wait)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtRestore(wait: number = 100) {
        Esp8266SendAT("AT+RESTORE", wait)
    }

    // WIFI指令
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtWifiSetMode(i: number, wait: number = 100) {
        Esp8266SendAT("AT+CWMODE=" + i, wait)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtWifiConnect(name: string, pw: string, wait: number = 100) {
        Esp8266SendAT("AT+CWJAP=" + name + "," + pw, wait)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtWifiUnConnect(wait: number = 100) {
        Esp8266SendAT("AT+CWQAP", wait)
    }

    // TCP/UDP指令
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTcpSetConnectNum(i: number, wait: number = 100) {
        Esp8266SendAT("AT+CIPMUX=" + i, wait)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTcpConnectServer(ip: string, port: string, wait: number = 100) {
        Esp8266SendAT("AT+CIPSTART=TCP," + ip + "," + port, wait)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTcpSendData(s: string, handle: Function) {
        let len = s.length
        Esp8266SendAT("AT+CIPSEND=" + len + 2)
        Esp8266SendAT(s, 0)
        handle()
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtTcpClose(wait: number = 100) {
        Esp8266SendAT("AT+CIPClose", wait)
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
        serial.redirect(
            SerialPin.P0,
            SerialPin.P1,
            BaudRate.BaudRate115200
        )
        Esp8266AtRestore(1000)
        Esp8266AtWifiSetMode(1)
        Esp8266AtReset(1000)
        Esp8266AtWifiConnect(name, pw, 0)
        let wifiConnect = waitResponse()
        Esp8266AtTcpConnectServer(ip, port, 0)
        Esp8266AtTcpSendData(sendData, handle)
        let tcpResult = waitResponse2()
        Esp8266AtTcpClose()
        Esp8266AtWifiUnConnect()
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    function waitResponse(): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
            if (serial_str.includes("OK") || serial_str.includes("ALREADY CONNECTED")) {
                result = true
                break
            } else if (serial_str.includes("ERROR") || serial_str.includes("SEND FAIL")) {
                break
            }
            if (input.runningTime() - time > 30000) break
        }
        return result
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    function waitResponse2(): string {
        let serial_str: string = ""
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            if (input.runningTime() - time > 5000) break
        }
        return serial_str
    }
}