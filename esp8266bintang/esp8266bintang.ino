#include <SoftwareSerial.h>
#include <stdlib.h>
#include <dht11.h>
//ESP8266 TX is connected to Arduino Digital Pin 8
#define ESP8266_TX_PIN 8
 
//ESP8266 RX is connected to Arduino Digital Pin 7
#define ESP8266_RX_PIN 7

 
                            // Rx        ,        Tx
SoftwareSerial WiFi_Serial(ESP8266_TX_PIN,ESP8266_RX_PIN);
#define WIFI_NAME "RATU Bakery"
#define WIFI_PASSWORD "ratucake"
#define port 3000
#define server "192.168.0.105"
#define apiKey "J9TZ97N7E8I53U2W"

String uri="/api/tanaman/5cfa6320c6426a1aa8430601/updatedata";

boolean No_IP=false;

String data="";
String request_header_1="";
String request_header_2=""; 

String response="";

/* 
Define the Pins on which the sensors are attached
Temperature Sensor T is attached to A2 on Arduino
Light Sensor L is attached to A3 on Arduino
Humidity Sensor H is attached to A4 on Arduino
*/

int soilmoisturePin= A0;   //kelembabantanah
int phPin = A1;             //ph
int humidityPin = A2;       //ini kelembabanudara dan suhuudara

/* Global Variable to store the temperature value */
float soilmoisture;

/* Global Variable to store the light value */
float ph;

/* Global Variable to store the humidity value */
float humidity;

/* Global Variable to store the temperature value */
float temperature;

/* Global Variable to access the library functions */
dht11 DHT11;


void setup()
{
      Serial.begin(9600);    
      Serial.println("Sending Sensor Data to Web Server"); 

      pinMode(soilmoisturePin, INPUT);
      pinMode(phPin, INPUT);
      pinMode(humidityPin, INPUT);
      WiFi_Serial.begin(9600);
      wifi_init();
      Serial.println("System Ready and connected to WiFi network");
}

void loop()
{
        // Call the function to get the status and store in our global variable
        soilmoisture = getSoilmoisture (soilmoisturePin);
        ph = getPh(phPin);
        humidity = getHumidity(humidityPin);
        temperature = getTemperature(humidityPin);
        
        // Print the output on the Serial Monitor
        Serial.println("");
        Serial.println("******************************");
        
        Serial.print("Kelembaban Tanah =  ");
        Serial.println(soilmoisture);

        Serial.print("Ph Tanah =  ");
        Serial.println(ph);

        Serial.print("Kelembaban Udara =  ");
        Serial.println(humidity);

        Serial.print("Suhu Udara =  ");
        Serial.println(temperature);
        Serial.println("******************************");
        Serial.println("");
  
        postToServer();
}

void postToServer()
{
      Serial.println("Connecting to Server");
      response="";
      
      prepareData();

      Serial.println("AT+CIPSTART=\"TCP\",\"" + String(server)+"\","+ String(port));    
      WiFi_Serial.println("AT+CIPSTART=\"TCP\",\"" + String(server)+"\","+ String(port));
      delay(5000);
      
      if(WiFi_Serial.available())
      {
          response="";
          
          // read the data into a variable as long as the
          while(WiFi_Serial.available())  
            response+= (char)WiFi_Serial.read();
          
          Serial.println(response);
          if(WiFi_Serial.find("CONNECT"))
            Serial.print("AT+CIPSEND=");
          

          WiFi_Serial.print("AT+CIPSEND=");
          WiFi_Serial.println(request_header_1.length() + request_header_2.length() + data.length());
//          delay(1000);
          //pengiriman setiap 1 menit 
          delay(60000);
          
          if(WiFi_Serial.available());
            response="";

          // read the data into a variable as long as the 
          while(WiFi_Serial.available()) 
            response+= (char)WiFi_Serial.read();
           
          Serial.println(response);

          Serial.println(data);  
          if(WiFi_Serial.find(">"));
          {
            WiFi_Serial.print(request_header_1);
            WiFi_Serial.print(request_header_2);
            WiFi_Serial.print(data);
            delay(5000);
          }
          
          if(WiFi_Serial.available())
          {
            delay(100);
            String response="";
            
            // read the data into a variable as long as the 
            while(WiFi_Serial.available()) 
              response+= (char)WiFi_Serial.read();

            Serial.println(response);
            if(WiFi_Serial.find("200"));
            {
              Serial.println("RESPONSE: 200");
              delay(1000);
            }
          }
      }
      else
      {
          Serial.println("Error in Posting");
          delay(1000);
      }     
}


void prepareData()
{
      data = "";
      data += "{";
      data += "\"kelembabanTanah\":\""+String(soilmoisture)+"\",";       // Kelembaban tanah 
      data += "\"ph\":\""+String(ph)+"\",";      // Ph
      data += "\"kelembabanUdara\":\""+String(humidity)+"\",";   // Humidity  
      data += "\"suhuUdara\":\""+String(temperature)+"\"";   // Temperature   
//      data += "\"field4\":\""+String(reedStatus)+"\","; // Door Status ( OPEN=1 or CLOSE=0)
//      data += "\"field5\":\""+String(powerStatus)+"\",";// Power Status ( ON=1 or OFF=0 )
//      data += "\"field6\":\""+String(pirStatus)+"\",";  // Person Status ( YES=1 or NO=0 )    
//      data += "\"field7\":\""+String(mobile)+"\",";     // Unique ID
//      data += "\"field8\":\""+String(mobile)+"\"";      // Mobile number
      data += "}";

      request_header_1= "PUT " + uri + " HTTP/1.1\r\n" + "Host: " + String(server) + ":" + String(port) + "\r\n" 
      + "Accept: *" + "/" + "*\r\n" + "Content-Length: " + data.length() + "\r\n" ;
      request_header_2= "Content-Type: application/json\r\n\r\n" ;
}


void wifi_init()
{
      connect_wifi("AT",100);
      connect_wifi("AT+CWMODE=3",100);
      connect_wifi("AT+CWQAP",100);  
      connect_wifi("AT+RST",5000);
      check4IP(5000);
      if(!No_IP)
        connect_wifi("AT+CWJAP=\""+String(WIFI_NAME)+"\",\""+String(WIFI_PASSWORD)+"\"",7000);        
}

void connect_wifi(String cmd, int t)
{
  int temp=0,i=0;
  while(1)
  {
    Serial.println(cmd);
    WiFi_Serial.println(cmd); 
    while(WiFi_Serial.available())
    {
      if(WiFi_Serial.find("OK"))
      i=8;
    }
    delay(t);
    if(i>5)
    break;
    i++;
  }
  if(i==8)
  Serial.println("OK");
  else
  Serial.println("Error");
}



void check4IP(int t1)
{
  int t2=millis();
  while(t2+t1>millis())
  {
    while(WiFi_Serial.available()>0)
    {
      if(WiFi_Serial.find("WIFI GOT IP"))
      {
        No_IP=true;
      }
    }
  }
}




/*********** Analog Read function*********/
float getSoilmoisture(int soilmoisturePin)
{    
        // ananlogRead function converts the input voltage range (0 to 5V), to a digital value between (0 to 1023)
        // This is done by a circuit inside the microcontroller called an analog-to-digital converter or ADC. 
        // Read the value from the Analog Pin and store it to an integer variable
        int sensorValue = analogRead(soilmoisturePin);
        //Output dry = 650 =0% ; Output water=250=100%
        int valueMax = 650;

        // To scale the numbers between 0.0 and 5.0, 
        // divide 5.0 by 1023.0 and multiply that by sensorValue
        // multiply the result with reference milli volts. (1V = 1000mV)
//        float milliVoltsTemp = sensorValue*(5.0/1023.0)*1000;
        float soilMoisture = (valueMax - sensorValue)/3.55;

        // There will be 1°C change for every 10mV of output
//        return milliVoltsTemp/10;
        return soilMoisture;
}


float getHumidity(int humidityPin)
{
        // Read the sensor value using the dht library read function 
        DHT11.read(humidityPin);


        // After reading the value which is stored in the library variable
        return (float)DHT11.humidity;
}


float getTemperature(int humidityPin)
{
        // Read the sensor value using the dht library read function 
        DHT11.read(humidityPin);


        // After reading the value which is stored in the library variable
        return (float)DHT11.temperature;
}


float getPh(int phPin)
{
        // ananlogRead function converts the input voltage range (0 to 5V), to a digital value between (0 to 1023)
        // This is done by a circuit inside the microcontroller called an analog-to-digital converter or ADC. 
        // Read the value from the Analog Pin and store it to an integer variable
        int sensorValue=analogRead(phPin);

        // To scale the numbers between 0.0 and 5.0, 
        // divide 5.0 by 1023.0 and multiply that by sensorValue
        // multiply the result with reference milli volts. (1V = 1000mV)
        float outputValue = (-0.0693*sensorValue)+7.3855;

        // There will be 1 Lumen change for every 10mV of output
        return outputValue;
}
