/**
 * esp8266 blocks
 */
//% groups=['esp8266']
namespace mqlib {

    let stateWifiConnected = false
    let stateTcp = false
    let stateTcpData = false
    let rxData = ''
    
    export enum NetFunc{
        //% block="测试"
        test,
        //% block="获取时间"
        gettime,
        //% block="获取ts数据"
        getts
    }
    
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function connectWifi(ssid:string, pw:string) {
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
        basic.pause(10000) //!!!
        stateWifiConnected = true
    }
    
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function requestServerData(ip:string, port:string) {
        //reset state
        stateTcp = false
        stateTcpData = false
        rxData = ''
        if(!stateWifiConnected){
            return
        }
        //start request
        Esp8266SendAT('AT+CIPSTART="TCP","' + ip + '",' + port, 0) // connect to website server
        waitTcpResponse(1)
        basic.pause(100)
        //tcp-start
        let str: string = "data=getts,data1,0"
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
        //basic.pause(1000)
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function getWifiState(){
        return stateWifiConnected
    }

    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    export function disConnectWifi(){
        basic.pause(100)
        Esp8266SendAT("AT+CWQAP")
    }
    //% subcategory="esp8266"
    //% group='esp8266'
    //% block
    //% id.min=1 id.max=4
    export function getServerDataById(id:number){
        if(!stateWifiConnected){
            return '<wifi err>'
        }
        if(!stateTcp){
            return '<tcp err>'
        }
        if(!stateTcpData){
            return '<tcp data err>'
        }
        if(!rxData || rxData == ''){
            return '<rx data err>'
        }
        //check rsp
        let aryBuf = rxData.split('=')
        if(!aryBuf[0] || aryBuf[0] != 'rsp'){
            return '<rsp data err>'
        }
        if (!aryBuf[1]) {
            return '<rsp data err2>'
        }
        let aryData = aryBuf[1].split(',')
        let val = aryData[id-1] || ''
        return val
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
                break
            } else if (serial_str.includes("WIFI DISCONNECT")) {
                break
            }
            //  else if (serial_str.includes("ERROR") || serial_str.includes("SEND FAIL")) {
            //     break
            // }
            if (input.runningTime() - time > 5000) {
                break
            }
        }
        stateWifiConnected = true
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
            //     break
            // } else if (serial_str.includes("WIFI DISCONNECT")) {
            //     break
            // }
            //  else if (serial_str.includes("ERROR") || serial_str.includes("SEND FAIL")) {
            //     break
            // }
            if (input.runningTime() - time > 5000) {
                break
            }
        }
        stateTcp = true
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
            //     break
            // } else if (serial_str.includes("WIFI DISCONNECT")) {
            //     break
            // }
            //  else if (serial_str.includes("ERROR") || serial_str.includes("SEND FAIL")) {
            //     break
            // }
            if (input.runningTime() - time > 5000) {
                break
            }
        }
        rxData = processTcpData(serial_str)
        stateTcpData = true
        return result
    }
    function processTcpData(inputStr: string): string {
        let ary = inputStr.split(':')
        let tmp = ary[1].replaceAll("\r", "").replaceAll("\n", "")
            .replaceAll('[', '').replaceAll(']', '').replaceAll('CLOSED', '')
        return tmp
    }

}