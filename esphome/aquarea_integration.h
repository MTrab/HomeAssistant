#include "esphome.h"

class AquareaSensor : public Component {
    public:
        Sensor *sensor1 = new Sensor();
        Sensor *sensor2 = new Sensor();

        AquareaSensor() : PollingComponent(5000) { }

        bool sending = false; // mutex for sending data
        #define MAXDATASIZE 256
        char data[MAXDATASIZE];
        int data_length = 0;

        struct command_struct {
            byte value[128];
            unsigned int length;
            command_struct *next;
        };
        command_struct *commandBuffer;
        unsigned int commandsInBuffer = 0;
        #define MAXCOMMANDSINBUFFER 5
bool readSerial()
{
  while (Serial.available()) {
    data[data_length] = Serial.read(); //read available data and place it after the last received data
    data_length++;
  }
  //only enable this if you really want to see how the data is gathered in multiple tries
  //sprintf(log_msg, "received size : %d", data_length); log_message(log_msg);

  if (data_length > 203) return false; //panasonic never returns more than 203 bytes, so this is bad data

  if (data_length == 203) { //panasonic read is always 203 on valid receive, if not yet there wait for next read
    log_message((char*)"Received 203 bytes data");
    sending = false; //we received an answer after our last command so from now on we can start a new send request again
    if (outputHexDump) logHex(data, data_length);
    byte chk = 0;
    for ( int i = 0; i < data_length; i++)  {
      chk += data[i];
    }
    if ( chk == 0 ) {
      log_message((char*)"Checksum received ok!");
      data_length = 0; //for next attempt
      return true;
    }
    else {
      log_message((char*)"Checksum received false!");
      data_length = 0; //for next attempt
      return false;
    }
  }
  return false;
}

void popCommandBuffer() {
  if (commandBuffer) { //to make sure we can pop a command from the buffer
    send_command(commandBuffer->value, commandBuffer->length);
    command_struct* nextCommand = commandBuffer->next;
    free(commandBuffer);
    commandBuffer = nextCommand;
    commandsInBuffer--;
  }
}

void pushCommandBuffer(byte* command, int length) {
  if (commandsInBuffer < MAXCOMMANDSINBUFFER) {
    command_struct* newCommand = new command_struct;
    newCommand->length = length;
    for (int i = 0 ; i < length ; i++) {
      newCommand->value[i] = command[i];
    }
    newCommand->next = commandBuffer;
    commandBuffer = newCommand;
    commandsInBuffer++;
  }
  else {
    log_message((char*)"Too much commands already in buffer. Ignoring this commands.");
  }
}


bool send_command(byte* command, int length)
{
  if ( sending ) {
    log_message((char*)"Already sending data. Buffering this send request");
    pushCommandBuffer(command, length);
    return false;
  }
  sending = true;

  byte chk = calcChecksum(command, length);
  int bytesSent = Serial.write(command, length);
  bytesSent += Serial.write(chk);

  sprintf(log_msg, "sent bytes: %d with checksum: %d ", bytesSent, int(chk)); log_message(log_msg);
  if (outputHexDump) logHex((char*)command, length);
  readtime = millis() + SERIALTIMEOUT; //set readtime when to timeout the answer of this command
  return true;
}

        void setup() override {

        }

        void loop() override {

        }
};