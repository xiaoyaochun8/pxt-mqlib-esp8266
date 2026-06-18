/**
 * esp8266 blocks
 */
//% groups=['esp8266']
namespace mqlib {

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
        let wifiConnect = Esp8266AtWaitResponse()
        Esp8266AtTcpConnectServer(ip, port, 0)
        Esp8266AtTcpSendData(sendData, handle)
        let tcpResult = Esp8266AtWaitResponse2()
        Esp8266AtTcpClose()
        Esp8266AtWifiUnConnect()
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function Esp8266AtWaitResponse(): boolean {
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
    export function Esp8266AtWaitResponse2(): string {
        let serial_str: string = ""
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            if (input.runningTime() - time > 5000) break
        }
        return serial_str
    }












    /************************************************************/
    
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function connectWifi(ssid:string, pw:string) {
        OLED12864_I2C.init(60)
        OLED12864_I2C.clear()
        OLED12864_I2C.showString('display')

        serial.redirect(
            SerialPin.P0,
            SerialPin.P1,
            BaudRate.BaudRate115200
        )
        serial.setRxBufferSize(180)
        // Esp8266SendAT("AT+CWAUTOCONN=1")
        // Esp8266SendAT("AT+CWRECONNCFG=1,1")
        Esp8266SendAT("AT+RESTORE", 1000) // restore to factory settings
        Esp8266SendAT("AT+CWMODE=1") // set to STA mode
        Esp8266SendAT("AT+RST", 1000) // reset
        // serial.readString()
        Esp8266SendAT("AT+CWJAP=\"" + ssid + "\",\"" + pw + "\"", 0) // connect to Wifi router

        basic.pause(100) //!!!
        basic.pause(10000)
    }
    
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function getServerData(ip:string, port:string) {
        Esp8266SendAT('AT+CIPSTART="TCP","' + ip + '",' + port, 0) // connect to website server
        waitTcpResponse(1)
        basic.pause(100)
        //tcp-start
        let str: string = "data=get,field1,0"
        Esp8266SendAT("AT+CIPSEND=" + (str.length + 2))
        Esp8266SendAT(str, 0) // upload data
        //tcp-end
        //http-start
        // const request = `GET /index.html HTTP/1.1\r\nHost: 192.168.2.162\r\nConnection: close\r\n\r\n`;
        // Esp8266SendAT(`AT+CIPSEND=${request.length}`)
        // Esp8266SendAT(request, 0) // upload data
        //http-end
        // serial.readString()
        waitTcpDataResponse(1)
        basic.pause(100)
        Esp8266SendAT("AT+CIPCLOSE")
        basic.pause(1000)
    }

    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function disConnectWifi(){
        basic.pause(100)
        Esp8266SendAT("AT+CWQAP")
    }

    
    
    
    // write AT command with CR+LF ending
    export function Esp8266SendAT(command: string, wait: number = 100) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }
    function waitWifiResponse(y: number): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            // if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
            if (serial_str.includes("WIFI CONNECTED")) {
                result = true
                OLED12864_I2C.showString('break2', 0, 0)
                OLED12864_I2C.showString(serial_str, 0, y)
                break
            } else if (serial_str.includes("WIFI DISCONNECT")) {
                OLED12864_I2C.showString('break3', 0, 0)
                OLED12864_I2C.showString(serial_str, 0, y)
                break
            }
            //  else if (serial_str.includes("ERROR") || serial_str.includes("SEND FAIL")) {
            //     OLED12864_I2C.showString(serial_str, 0, y)
            //     break
            // }
            if (input.runningTime() - time > 5000) {
                OLED12864_I2C.showString('break', 0, 0)
                OLED12864_I2C.showString(serial_str, 0, y)
                break
            }
        }
        OLED12864_I2C.clear()
        OLED12864_I2C.showString('endWifi', 0, 0)
        OLED12864_I2C.showString(serial_str, 0, y)
        OLED12864_I2C.showString('#' + processTcpData(serial_str), 0, 7)
        return result
    }
    function waitTcpResponse(y: number): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            // if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
            // if (serial_str.includes("WIFI CONNECTED")) {
            //     result = true
            //     OLED12864_I2C.showString('break2', 0, 0)
            //     OLED12864_I2C.showString(serial_str, 0, y)
            //     break
            // } else if (serial_str.includes("WIFI DISCONNECT")) {
            //     OLED12864_I2C.showString('break3', 0, 0)
            //     OLED12864_I2C.showString(serial_str, 0, y)
            //     break
            // }
            //  else if (serial_str.includes("ERROR") || serial_str.includes("SEND FAIL")) {
            //     OLED12864_I2C.showString(serial_str, 0, y)
            //     break
            // }
            if (input.runningTime() - time > 5000) {
                OLED12864_I2C.showString('break', 0, 0)
                OLED12864_I2C.showString(serial_str, 0, y)
                break
            }
        }
        OLED12864_I2C.clear()
        OLED12864_I2C.showString('endTcp', 0, 0)
        OLED12864_I2C.showString(serial_str, 0, y)
        OLED12864_I2C.showString('#' + processTcpData(serial_str), 0, 7)
        return result
    }
    function waitTcpDataResponse(y: number): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            // if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
            // if (serial_str.includes("WIFI CONNECTED")) {
            //     result = true
            //     OLED12864_I2C.showString('break2', 0, 0)
            //     OLED12864_I2C.showString(serial_str, 0, y)
            //     break
            // } else if (serial_str.includes("WIFI DISCONNECT")) {
            //     OLED12864_I2C.showString('break3', 0, 0)
            //     OLED12864_I2C.showString(serial_str, 0, y)
            //     break
            // }
            //  else if (serial_str.includes("ERROR") || serial_str.includes("SEND FAIL")) {
            //     OLED12864_I2C.showString(serial_str, 0, y)
            //     break
            // }
            if (input.runningTime() - time > 5000) {
                OLED12864_I2C.showString('break', 0, 0)
                OLED12864_I2C.showString(serial_str, 0, y)
                break
            }
        }
        OLED12864_I2C.clear()
        OLED12864_I2C.showString('endTcpData', 0, 0)
        OLED12864_I2C.showString(serial_str, 0, y)
        OLED12864_I2C.showString('#' + processTcpData(serial_str), 0, 7)
        return result
    }
    function processTcpData(inputStr: string): string {
        let ary = inputStr.split(':')
        let tmp = ary[1].replaceAll("\r", "").replaceAll("\n", "")
            .replaceAll('[', '').replaceAll(']', '').replaceAll('CLOSED', '')
        return tmp
    }

}