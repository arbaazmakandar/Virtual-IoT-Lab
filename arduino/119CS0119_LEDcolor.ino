int red= 11;
int green= 10;
int blue= 9;

void setup() {
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(blue, OUTPUT);
}

void loop() {
  RGB_color(255, 0, 0); // Red
  delay(1000);
  RGB_color(0, 255, 0); // Green
  delay(1000);
  RGB_color(0, 0, 255); // Blue
  delay(1000);
  RGB_color(41, 190, 208); 
  delay(1000);
  RGB_color(208, 208, 41); 
  delay(1000);
  RGB_color(255, 0, 255); 
  delay(1000);
  RGB_color(255, 255, 0); 
  delay(1000);
  RGB_color(255, 255, 255); 
  delay(1000);
}

void RGB_color(int red_light_value, int green_light_value, int blue_light_value)
 {
  analogWrite(red, red_light_value);
  analogWrite(green, green_light_value);
  analogWrite(blue, blue_light_value);
}
