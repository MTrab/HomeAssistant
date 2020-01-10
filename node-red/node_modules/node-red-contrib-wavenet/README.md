# node-red-contrib-wavenet
## Convert text to speech using Google Wavenet voice.

### Update: Added Dutch and Danish voices

Wavenet voice represents a new way of creating synthetic speech, using a **WaveNet** model, the same technology used to produce speech for Google Assistant, Google Search, and Google Translate.

Takes a `string` as an input. Returns a `base64` encoded array buffer. Attach a file node to save it as an MP3 on your disk.

![main flow](https://imgur.com/WyF9hBt.png)
