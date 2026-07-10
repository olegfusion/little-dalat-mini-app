import { Router, Request, Response } from 'express';
import { CATEGORIES } from '../data/categories';
import { INITIAL_MENU_ITEMS, getItemsByCategory } from '../data/menu';

const router = Router();

router.get('/categories', (_req: Request, res: Response) => {
  res.json(CATEGORIES);
});

router.get('/menu', (_req: Request, res: Response) => {
  res.json(INITIAL_MENU_ITEMS);
});

router.get('/menu/:categoryId', (req: Request, res: Response) => {
  const categoryId = req.params.categoryId as string;
  const items = getItemsByCategory(categoryId);
  if (items.length === 0) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(items);
});

export default router;
