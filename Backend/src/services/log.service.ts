import prisma from '../config/db';

export class LogService {
  static async createLog(data: {
    IDTaiKhoan?: number;
    HanhDong: string;
    DoiTuong?: string;
    ChiTiet?: string;
    DiaChiIP?: string;
    TrangThai?: string;
  }) {
    try {
      // Using executeRaw to ensure it works even before prisma db pull is run
      await prisma.$executeRaw`
        INSERT INTO SystemLog (IDTaiKhoan, HanhDong, DoiTuong, ChiTiet, DiaChiIP, TrangThai)
        VALUES (
          ${data.IDTaiKhoan || null}, 
          ${data.HanhDong}, 
          ${data.DoiTuong || null}, 
          ${data.ChiTiet || null}, 
          ${data.DiaChiIP || null}, 
          ${data.TrangThai || null}
        )
      `;
    } catch (error) {
      console.error('Failed to create system log:', error);
    }
  }

  static async getLogs(filters: {
    search?: string;
    action?: string;
  }) {
    try {
      // Basic filtering with queryRaw
      let query = 'SELECT * FROM SystemLog WHERE 1=1';
      
      // We will fetch all and filter in JS to avoid complex raw SQL injection issues 
      // for this simple student project.
      const logs: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM SystemLog ORDER BY ThoiGian DESC`);
      
      let filteredLogs = logs;
      
      if (filters.action && filters.action !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.HanhDong === filters.action);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          (log.ChiTiet && log.ChiTiet.toLowerCase().includes(searchLower)) ||
          (log.DoiTuong && log.DoiTuong.toLowerCase().includes(searchLower)) ||
          (log.HanhDong && log.HanhDong.toLowerCase().includes(searchLower))
        );
      }
      
      return filteredLogs;
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      return [];
    }
  }
}
