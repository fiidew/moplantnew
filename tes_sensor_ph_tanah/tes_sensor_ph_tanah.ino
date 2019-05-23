//tes sensor pH tanah 

/*
wiring:
kabel putih -> GND
kabel hitam -> output to A0
*/

//analog pin 
#include <SoftwareSerial.h>
#define RX 10
#define TX 11
SoftwareSerial esp8266(RX,TX);
#define analogInPin A0  //sambungkan kabel hitam (output) ke pin A0
const int AirValue = 520;   //you need to replace this value with Value_1
const int WaterValue = 260;  //you need to replace this value with Value_2
int intervals = (AirValue - WaterValue)/3;
int soilMoistureValue=0;
//variable
int sensorValue = 0;        //ADC value from sensor
float outputValue = 0.0;        //pH value after conversion
void setup() {
  //initialize serial communications at 9600 bps:
  Serial.begin(9600);
  esp8266.begin(115200);
 //esp8266.println(command);
 esp8266.println("AT+CWMODE=1");
 esp8266.println("AT+CWJAP=\"RATU Bakery\",\"ratucake\"");
}

void loop() {
  //read the analog in value:
  sensorValue = analogRead(analogInPin);

  //Mathematical conversion from ADC to pH
  //rumus didapat berdasarkan datasheet 
  outputValue = (-0.0693*sensorValue)+7.3855;

  //print the results to the serial monitor:
  Serial.print("sensor ADC= ");
  Serial.print(sensorValue);
  Serial.print("  output Ph= ");
  Serial.println(outputValue);
  soilMoistureValue = analogRead(A2); //connect sensor to Analog 0
  Serial.print("Humidity = ");
  Serial.println(soilMoistureValue); //print the value to serial port

if(soilMoistureValue > WaterValue && soilMoistureValue < (WaterValue + intervals))
{
  Serial.println("Very Wet");
}
else if(soilMoistureValue > (WaterValue + intervals) && soilMoistureValue < (AirValue - intervals))
{
  Serial.println("Wet");
}
else if(soilMoistureValue < AirValue && soilMoistureValue > (AirValue - intervals))
{
  Serial.println("Dry");
}
delay(1500);
}
