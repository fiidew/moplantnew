#include <ESP8266WiFi.h>

// Network Configuration
const char* ssid     = "RATU Bakery";
const char* password = "ratucake";
const char* api_key  = "5cdcf2e89678b41350a623ce";
const char* host     = "192.168.0.105";
const int host_port  = 3000;

// Sensor Pin Configuration
uint8_t Sensors[] = {A0};

/**
 * Initial Setup
 */
void setup() {
  Serial.begin(115200);
  pinMode(0, OUTPUT);
  Serial.println("bintang ");
  connectToWifi();
}

/**
 * Required Loop
 */
void loop() {
  sendSensorDataToHost();
  delay(600000); // TODO: Replace with Sleep state
}

/**
 * Send the data from attached sensors to the host as JSON.
 */
void sendSensorDataToHost() {

  int i;
  
  Serial.print("Connecting To ");
  Serial.println(host);
  
  WiFiClient client;
  if ( !client.connect(host, host_port) ) {
    Serial.println("Connection Failed.");
    return;
  }

  // Create JSON Data
  String JsonData = "{\"kelembaban\":{";
  for (i=0; i < sizeof(Sensors); i = i + 1) {
    
    int sensorNumber = i + 1;
    
    JsonData = JsonData + "\"sensor"+sensorNumber+"\":"+analogRead(Sensors[i]);

    // Add Comma if there are more Items to add.
    if ( sensorNumber != sizeof(Sensors) ) {
      JsonData = JsonData + ",";
    }
    
  }
  JsonData = JsonData + "}}";  

  // Send JSON to API
  client.println("PUT /tanaman/" + String(api_key) + "/updatedata" + " HTTP/1.1");
  client.println("Host: " + String(host));
  client.println("User Agent: Arduino/1.0");
  client.println("Cache-Control: no-cache");
  client.println("Connnection: close");
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(JsonData.length());
  client.println();
  client.println(JsonData);

  Serial.println("Sensor Data submitted to API.");
}
/**
 * Connect to the Host.
 */
void connectToWifi() {
  delay(100);

  Serial.println();
  Serial.println();
  Serial.println("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while ( WiFi.status() != WL_CONNECTED ) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.println("IP Address: ");
  Serial.println(WiFi.localIP());
}
//
//tes sensor pH tanah 
//
///*
//wiring:
//kabel putih -> GND
//kabel hitam -> output to A0
//*/

////analog pin 
//#include <SoftwareSerial.h>
//#define RX 10
//#define TX 11
//SoftwareSerial esp8266(RX,TX);
//#define analogInPin A0  //sambungkan kabel hitam (output) ke pin A0
//const int AirValue = 520;   //you need to replace this value with Value_1
//const int WaterValue = 260;  //you need to replace this value with Value_2
//int intervals = (AirValue - WaterValue)/3;
//int soilMoistureValue=0;
////variable
//int sensorValue = 0;        //ADC value from sensor
//float outputValue = 0.0;        //pH value after conversion
//void setup() {
//  //initialize serial communications at 9600 bps:
//  Serial.begin(9600);
//  esp8266.begin(115200);
// //esp8266.println(command);
// esp8266.println("AT+CWMODE=1");
// esp8266.println("AT+CWJAP=\"RATU Bakery\",\"ratucake\"");
//}
//
//void loop() {
//  //read the analog in value:
//  sensorValue = analogRead(analogInPin);
//
//  //Mathematical conversion from ADC to pH
//  //rumus didapat berdasarkan datasheet 
//  outputValue = (-0.0693*sensorValue)+7.3855;
//
//  //print the results to the serial monitor:
//  Serial.print("sensor ADC= ");
//  Serial.print(sensorValue);
//  Serial.print("  output Ph= ");
//  Serial.println(outputValue);
//  soilMoistureValue = analogRead(A2); //connect sensor to Analog 0
//  Serial.print("Humidity Bintang= ");
//  Serial.println(soilMoistureValue); //print the value to serial port
//
//if(soilMoistureValue > WaterValue && soilMoistureValue < (WaterValue + intervals))
//{
//  Serial.println("Very Wet");
//}
//else if(soilMoistureValue > (WaterValue + intervals) && soilMoistureValue < (AirValue - intervals))
//{
//  Serial.println("Wet");
//}
//else if(soilMoistureValue < AirValue && soilMoistureValue > (AirValue - intervals))
//{
//  Serial.println("Dry");
//}
//delay(1500);
//}
