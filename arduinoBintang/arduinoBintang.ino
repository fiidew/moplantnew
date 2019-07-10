#include <SoftwareSerial.h>
#include <stdlib.h>
#include <dht11.h>
//ESP8266 TX is connected to Arduino Digital Pin 8
#define ESP8266_TX_PIN 8
 
//ESP8266 RX is connected to Arduino Digital Pin 7
#define ESP8266_RX_PIN 7
 
                            // Rx        ,        Tx
SoftwareSerial WiFi_Serial(ESP8266_TX_PIN,ESP8266_RX_PIN);
#define WIFI_NAME "@wifi.id lt2"
#define WIFI_PASSWORD "admin123"
//#define WIFI_NAME "MODEM"
//#define WIFI_PASSWORD "idi5y47j"
#define port 3000
#define server "192.168.1.100"
//#define server "192.168.43.26"
#define apiKey "J9TZ97N7E8I53U2W"

String uri="/api/tanaman/5d1ec89dc4c4f322e4fec347/updatedata";

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

//untuk fuzzy 
float kelembabanTanah[3];
float suhuUdara[5];
float rule[3][5];
float rule00, rule01, rule02, rule03, rule04;
float rule10, rule11, rule12, rule13, rule14;
float rule20, rule21, rule22, rule23, rule24;
float defuz, volume, temp;


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
        FuzzySuhu();
        FuzzyKelembabanTanah();
        getVolume();
//        
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

         Serial.print("Kondisi =  ");
        Serial.println(volume);
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
          delay(1000);
          //pengiriman setiap 1 menit 
//          delay(10000);
          
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
      data += "\"suhuUdara\":\""+String(temperature)+"\",";   // Temperature   
      data += "\"kondisi\":\""+String(volume)+"\""; // kebutuhan air
//      data += "\"status\":\""+String(status)+"\"";// Power Status ( ON=1 or OFF=0 )
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
        int sensorValue = analogRead(soilmoisturePin);
        //Output dry = 650 =0% ; Output water=250=100%
        int valueMax = 650;
        int soilMoisture = (valueMax - sensorValue)/3.55;
        return soilMoisture;
}


float getHumidity(int humidityPin)
{
        // Read the sensor value using the dht library read function 
        DHT11.read(humidityPin);


        // After reading the value which is stored in the library variable
        return (int)DHT11.humidity;
}


float getTemperature(int humidityPin)
{
        // Read the sensor value using the dht library read function 
        DHT11.read(humidityPin);


        // After reading the value which is stored in the library variable
        return (int)DHT11.temperature;
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
        if(outputValue<0 || outputValue>10)
          return outputValue=7;
        else
        // There will be 1 Lumen change for every 10mV of output
        return outputValue;
}


//fuzzy
void FuzzySuhu(){
  //untuk suhu dingin
  if(temperature <= 10)
  {
    suhuUdara[0]=1;
  }
  else if(temperature>10 && temperature<=12)
  {
    suhuUdara[0]=(12-temperature)/(12-10);
  }
  else
  {
    suhuUdara[0] = 0; 
  }
  
  //untuk sejuk
  if(temperature<=10)
  {
    suhuUdara[1]=0;
  }
  else if(temperature>10 && temperature<=12){
    suhuUdara[1]=(temperature-10)/(12-10);
  }
  else if(temperature>12 && temperature<=17)
  {
    suhuUdara[1]=1;
  }
  else if(temperature>17 && temperature<=19)
  {
    suhuUdara[1]=(19-temperature)/(19-17);
  }
  else
  {
    suhuUdara[1]=0;
  }
  
  //untuk normal
  if(temperature<=17)
  {
    suhuUdara[2]=0;
  }
  else if(temperature>17 && temperature<=19){
    suhuUdara[2]=(temperature-17)/(19-17);
  }
  else if(temperature>19 && temperature<=22)
  {
    suhuUdara[2]=1;
  }
  else if(temperature>22 && temperature<=24)
  {
    suhuUdara[2]=(24-temperature)/(24-22);
  }
  else
  {
    suhuUdara[2]=0;
  }
  
  //untuk sedang
  if(temperature<=22)
  {
    suhuUdara[3]=0;
  }
  else if(temperature>22 && temperature<=24){
    suhuUdara[3]=(temperature-22)/(24-22);
  }
  else if(temperature>24 && temperature<=27)
  {
    suhuUdara[3]=0.4;
  }
  else if(temperature>27 && temperature<=29)
  {
    suhuUdara[3]=(29-temperature)/(29-27);
  }
  else
  {
    suhuUdara[3]=0;
  }
  
  //untuk panas
  if(temperature<=27)
  {
    suhuUdara[4]=0;
  }
  else if(temperature>27 && temperature<=29)
  {
    suhuUdara[4]=(temperature-27)/(29-27);
  }
  else
  {
    suhuUdara[4]=1;
  }
}

void FuzzyKelembabanTanah(){
  //untuk kering
  if(soilmoisture <= 25)
  {
    kelembabanTanah[0]=1;
  }
  else if(soilmoisture>25 && soilmoisture<=30)
  {
    kelembabanTanah[0]=(30-soilmoisture)/(30-25);
  }
  else
  {
    kelembabanTanah[0] = 0; 
  }
  
  //untuk lembab
  if(soilmoisture<=25)
  {
    kelembabanTanah[1]=0;
  }
  else if(soilmoisture>25 && soilmoisture<=30){
    kelembabanTanah[1]=(soilmoisture-25)/(30-25);
  }
  else if(soilmoisture>30 && soilmoisture<=55)
  {
    kelembabanTanah[1]=1;
  }
  else if(soilmoisture>55 && soilmoisture<=60)
  {
    kelembabanTanah[1]=(60-soilmoisture)/(60-55);
  }
  else
  {
    kelembabanTanah[1]=0;
  }
  
  //untuk basah
  if(soilmoisture<=55)
  {
    kelembabanTanah[2]=0;
  }
  else if(soilmoisture>55 && soilmoisture<=60)
  {
    kelembabanTanah[2]=(soilmoisture-55)/(60-55);
  }
  else
  {
    kelembabanTanah[2]=1;
  }
}

void RuleVolume(){
  
  int i, j;
  for(i=0; i<=2;i=i+1)
  {
      for(j=0;j<=4;j=j+1)
      {
        temp=min(kelembabanTanah[i], suhuUdara[j]);
        rule[i][j] = temp;
      }
  }
  
  rule00=rule[0][0];  //(kering,dingin = sangat sedikit)
  rule01=rule[0][1];  //(kering,sejuk = sedikit)
  rule02=rule[0][2];  //(kering,normal = agak sedikit)
  rule03=rule[0][3];  //(kering,sedang = sedang)
  rule04=rule[0][4];  //(kering,panas = agak banyak)
  
  rule10=rule[1][0];  //(lembab,dingin = sedikit)
  rule11=rule[1][1];  //(lembab,sejuk = agak sedikit)
  rule12=rule[1][2];  //(lembab,normal = sedang)
  rule13=rule[1][3];  //(lembab,sedang = agak banyak)
  rule14=rule[1][4];  //(lembab,panas = banyak)
  
  rule20=rule[2][0];  //(basah,dingin = agak sedikit)
  rule21=rule[2][1];  //(basah,sejuk = sedang)
  rule22=rule[2][2];  //(basah,normal = agak banyak)
  rule23=rule[2][3];  //(basah,sedang = banyak)
  rule24=rule[2][4];  //(basah,panas = sangat banyak)
  
}

void getVolume(){

//  metode sugeno
  float sangat_sedikit= 200;
  float sedikit=300;
  float agak_sedikit=500;
  float sedang=600;
  float agak_banyak=700;
  float banyak=900;
  float sangat_banyak=1000;

//  float sangat_sedikit= 1000;
//  float sedikit=900;
//  float agak_sedikit=700;
//  float sedang=600;
//  float agak_banyak=500;
//  float banyak=300;
//  float sangat_banyak=200;

  RuleVolume();
  //volume=0;
  volume=(rule00*agak_sedikit)+(rule01*sedang)+(rule02*agak_sedikit)+(rule03*banyak)+(rule04*sangat_banyak)+
       (rule10*sedikit)+(rule11*agak_sedikit)+(rule12*sedang)+(rule13*agak_banyak)+(rule14*banyak)+
       (rule20*sangat_sedikit)+(rule21*sedikit)+(rule22*agak_sedikit)+(rule23*sedang)+(rule24*agak_banyak);
//(rule00*sangat_sedikit)+(rule01*sedikit)+(rule02*agak_sedikit)+(rule03*sedang)+(rule04*agak_banyak)+

  defuz=0;
  int i ,j;
  for(i=0;i<=2;i=i+1)
  {
    for(j=0;j<=4;j=j+1)
    {
      defuz=defuz+rule[i][j];
    }
  }
  volume=volume/defuz;
//    volume = defuz;
}
