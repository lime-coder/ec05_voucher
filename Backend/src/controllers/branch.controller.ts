import { Request, Response } from 'express';
import { BranchService } from '../services/branch.service';

export const getBranchesByPartner = async (req: Request, res: Response) => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: 'error.invalid_partner_id' });
    }
    const branches = await BranchService.getBranchesByPartner(partnerId);
    res.json(branches);
  } catch (error) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: 'error.invalid_partner_id' });
    }
    const { tenChiNhanh, sdt, diaChi } = req.body;
    if (!tenChiNhanh) {
      return res.status(400).json({ message: 'error.branch_name_required' });
    }
    const newBranch = await BranchService.createBranch(partnerId, { tenChiNhanh, sdt, diaChi });
    res.status(201).json(newBranch);
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const branchId = parseInt(req.params.id);
    if (isNaN(branchId)) {
      return res.status(400).json({ message: 'error.invalid_branch_id' });
    }
    const { tenChiNhanh, sdt, diaChi } = req.body;
    const updatedBranch = await BranchService.updateBranch(branchId, { tenChiNhanh, sdt, diaChi });
    res.json(updatedBranch);
  } catch (error) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const branchId = parseInt(req.params.id);
    if (isNaN(branchId)) {
      return res.status(400).json({ message: 'error.invalid_branch_id' });
    }
    await BranchService.deleteBranch(branchId);
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};
