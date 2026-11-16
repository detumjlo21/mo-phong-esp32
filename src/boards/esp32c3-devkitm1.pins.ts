// ESP32-C3-DevKitM-1 (module ESP32-C3-MINI-1) — dữ liệu chân.
// Nguồn: Espressif, "ESP32-C3-DevKitM-1 User Guide", mục Header Block (bảng J1 và J3).
// https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c3/esp32-c3-devkitm-1/user_guide.html
//
// CẦN KIỂM TRA bằng ảnh "Pin Layout" của Espressif trước khi phát hành:
//  1) J1 nằm bên trái hay bên phải khi USB hướng xuống (HEADER_Z bên dưới là giả định).
//  2) Chân số 1 của mỗi hàng nằm gần đầu USB hay gần đầu ăng-ten (PIN_X0 bên dưới là giả định).
// Thứ tự và tên chân trong bảng J1/J3 là đúng theo tài liệu; chỉ vị trí hình học là giả định.

export type PinKind = 'gnd' | '3v3' | '5v' | 'gpio' | 'reset';

export type C3Pin = {
  id: string;            // duy nhất, dùng làm khóa nối dây: "J1-04"
  header: 'J1' | 'J3';
  no: number;            // số thứ tự trong bảng của Espressif (1–15)
  label: string;         // nhãn in trên bo: IO2, TX, GND...
  kind: PinKind;
  gpio?: number;
  fn: string[];          // chức năng phụ theo tài liệu
  strapping?: boolean;   // GPIO2, GPIO8, GPIO9 là chân strapping
  x: number;             // vị trí cục bộ trên mô hình 3D
  z: number;
};

// Hình học (đơn vị cảnh 3D, không phải mm). Khoảng cách giữa 2 hàng = 9 bước chân (0,9 inch).
export const PITCH = 0.14;
export const PIN_X0 = -0.95;
export const HEADER_Z = { J1: -0.63, J3: 0.63 } as const;

// [nhãn, loại, gpio, chức năng...]
type Row = [string, PinKind, number | null, ...string[]];

const J1: Row[] = [
  ['GND', 'gnd', null],
  ['3V3', '3v3', null],
  ['3V3', '3v3', null],
  ['IO2', 'gpio', 2, 'ADC1_CH2', 'FSPIQ'],
  ['IO3', 'gpio', 3, 'ADC1_CH3'],
  ['GND', 'gnd', null],
  ['RST', 'reset', null, 'CHIP_PU'],
  ['GND', 'gnd', null],
  ['IO0', 'gpio', 0, 'ADC1_CH0', 'XTAL_32K_P'],
  ['IO1', 'gpio', 1, 'ADC1_CH1', 'XTAL_32K_N'],
  ['IO10', 'gpio', 10, 'FSPICS0'],
  ['GND', 'gnd', null],
  ['5V', '5v', null],
  ['5V', '5v', null],
  ['GND', 'gnd', null],
];

const J3: Row[] = [
  ['GND', 'gnd', null],
  ['TX', 'gpio', 21, 'U0TXD'],
  ['RX', 'gpio', 20, 'U0RXD'],
  ['GND', 'gnd', null],
  ['IO9', 'gpio', 9],
  ['IO8', 'gpio', 8, 'RGB LED'],
  ['GND', 'gnd', null],
  ['IO7', 'gpio', 7, 'FSPID', 'MTDO'],
  ['IO6', 'gpio', 6, 'FSPICLK', 'MTCK'],
  ['IO5', 'gpio', 5, 'ADC2_CH0', 'FSPIWP', 'MTDI'],
  ['IO4', 'gpio', 4, 'ADC1_CH4', 'FSPIHD', 'MTMS'],
  ['GND', 'gnd', null],
  ['IO18', 'gpio', 18, 'USB_D-'],
  ['IO19', 'gpio', 19, 'USB_D+'],
  ['GND', 'gnd', null],
];

const STRAPPING = new Set([2, 8, 9]);

function build(header: 'J1' | 'J3', rows: Row[]): C3Pin[] {
  return rows.map(([label, kind, gpio, ...fn], i) => ({
    id: `${header}-${String(i + 1).padStart(2, '0')}`,
    header,
    no: i + 1,
    label,
    kind,
    gpio: gpio ?? undefined,
    fn,
    strapping: gpio !== null && STRAPPING.has(gpio) ? true : undefined,
    x: PIN_X0 + i * PITCH,
    z: HEADER_Z[header],
  }));
}

export const C3_PINS: C3Pin[] = [...build('J1', J1), ...build('J3', J3)];
export const C3_PIN_BY_ID = new Map(C3_PINS.map(p => [p.id, p]));

// Tra cứu chân theo số GPIO, để bộ mô phỏng map digitalWrite(2, HIGH) → chân J1-04.
export const C3_GPIO_BY_NUMBER = new Map(
  C3_PINS.filter(p => p.gpio !== undefined).map(p => [p.gpio as number, p]),
);
