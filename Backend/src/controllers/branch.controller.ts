import { Request, Response } from 'express';
import { BranchService } from '../services/branch.service';

export const getBranchesByPartner = async (req: Request, res: Response) => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: 'Mã đối tác không hợp lệ' });
    }
    const branches = await BranchService.getBranchesByPartner(partnerId);
    res.json(branches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách chi nhánh' });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: 'Mã đối tác không hợp lệ' });
    }
    const { tenChiNhanh, sdt, diaChi } = req.body;
    if (!tenChiNhanh) {
      return res.status(400).json({ message: 'Tên chi nhánh là bắt buộc' });
    }
    const newBranch = await BranchService.createBranch(partnerId, { tenChiNhanh, sdt, diaChi });
    res.status(201).json(newBranch);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tạo chi nhánh', error: error.message });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const branchId = parseInt(req.params.id);
    if (isNaN(branchId)) {
      return res.status(400).json({ message: 'Mã chi nhánh không hợp lệ' });
    }
    const { tenChiNhanh, sdt, diaChi } = req.body;
    const updatedBranch = await BranchService.updateBranch(branchId, { tenChiNhanh, sdt, diaChi });
    res.json(updatedBranch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật chi nhánh' });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const branchId = parseInt(req.params.id);
    if (isNaN(branchId)) {
      return res.status(400).json({ message: 'Mã chi nhánh không hợp lệ' });
    }
    await BranchService.deleteBranch(branchId);
    res.json({ message: 'Xóa chi nhánh thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi xóa chi nhánh' });
  }
};
