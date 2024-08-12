# MakeID L1 Label Printer

This small script allows to send text, that should be printed.

Usage:

```bash
node ./index.js COM_PORT FIRST_LINE SECOND_LINE THIRD_LINE
```

`COM_PORT` is virtual COM port associated with printer paired via bluetooth. 
For Windows you can use [Bluetooth Command Line Tools](https://bluetoothinstaller.com/bluetooth-command-line-tools) to connect to the printer.

It is just an example and you can customize source code by changing font and/or font size.
