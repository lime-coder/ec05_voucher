import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
