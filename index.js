import { registerFont, createCanvas } from 'canvas';
import { SerialPort } from 'serialport';

const HEIGHT = 0x0C;
const WIDTH = 0xE3;

// protocol-dependent
const PACKET_SIZE = 122;
const PREFIX = [0x10, 0xFF, 0xFE, 0x01, 0x10, 0xFF, 0xFE, 0x40, 0x1D, 0x76, 0x30, HEIGHT >> 8, HEIGHT & 0xFF, WIDTH >> 8, WIDTH & 0xFF, 0x00];
const POSTFIX = [0x1B, 0x4A, 0x40, 0x10, 0xFF, 0xFE, 0x45];

const FONT_SIZE = 32;

const bitArrayToByte = (arr) => {
  let val = 0;
  for (let i = 0; i <= 7; ++i) {
    if (arr[i] === 1) {
      val = val | (1 << i);
    }
  }

  return val;
};

const createImage = (firstLine, secondLine, thirdLine) => {
  registerFont('norwester.ttf', { family: 'Norwester Condensed' });

  const canvas = createCanvas(WIDTH, HEIGHT * 8);
  const ctx = canvas.getContext('2d');

  ctx.antialias = 'none';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  ctx.font = `${FONT_SIZE}px "Norwester" normal`;
  ctx.fillText(firstLine, 0, FONT_SIZE);
  ctx.fillText(secondLine, 0, FONT_SIZE * 2);
  if (thirdLine) {
    ctx.fillText(thirdLine, 0, FONT_SIZE * 3);
  }

  const { stride } = canvas;
  const pixels = canvas.toBuffer('raw');
  const img = [];
  for (let x = 0; x < WIDTH; ++x) {
    const chunk = [];
    for (let y = (HEIGHT * 8) - 1; y >= 0; --y) {
      const B = pixels[y * stride + x * 4];
      chunk.unshift(B === 0xFF ? 0 : 1);
      if (chunk.length === 8) {
        img.push(bitArrayToByte(chunk));
        chunk.length = 0;
      }
    }
  }

  return img;
};

const [portPath, firstLine, secondLine, thirdLine] = process.argv.slice(2);

const port = new SerialPort({ path: portPath, baudRate: 57600 });

port.on('open', async () => {
  console.log('Port opened, ready to send data!');

  const img = createImage(firstLine, secondLine, thirdLine);
  const msg = [...PREFIX, ...img, ...POSTFIX];
  for (let i = 0; i < msg.length; i += PACKET_SIZE) {
    const chunk = msg.slice(i, i + PACKET_SIZE);
    await port.write(Buffer.from(chunk));
  }

  setTimeout(() => process.exit(0), 2000);
});
