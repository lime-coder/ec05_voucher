import fs from 'fs';
import path from 'path';

// File lưu trữ mục tiêu doanh thu theo từng partner và kỳ
const FILE_PATH = path.join(__dirname, '../../data/revenueTargets.json');

type TimeRange = 'week' | 'month' | 'quarter' | 'year';
type TargetMap = Record<string, Record<TimeRange, number>>;

/** Đọc toàn bộ dữ liệu từ file JSON */
function readAll(): TargetMap {
  try {
    if (!fs.existsSync(FILE_PATH)) return {};
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw) as TargetMap;
  } catch {
    return {};
  }
}

/** Ghi toàn bộ dữ liệu vào file JSON */
function writeAll(data: TargetMap): void {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/** Lấy mục tiêu của 1 partner cho 1 kỳ. Trả null nếu chưa đặt. */
export function getTarget(partnerId: number, timeRange: string): number | null {
  const all = readAll();
  return all[String(partnerId)]?.[timeRange as TimeRange] ?? null;
}

/** Đặt mục tiêu của 1 partner cho 1 kỳ */
export function setTarget(partnerId: number, timeRange: string, target: number): void {
  const all = readAll();
  if (!all[String(partnerId)]) {
    all[String(partnerId)] = {} as Record<TimeRange, number>;
  }
  all[String(partnerId)][timeRange as TimeRange] = target;
  writeAll(all);
}
