const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const categoriesData = await Category.findAll({ include: [{ model: Product }] });
    res.status(200).json(categoriesData);
  } catch (error) {
    res.status(500).json({ message: 'Error! Categories not found!' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, { include: [{ model: Product }] });

    if (!categoryData) {
      res.status(404).json({ message: 'Error! Category not found for the given ID!' });
      return;
    }
    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json({ message: 'Error! Category not found!' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: 'Error! Failed to create category.', error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.update(req.body, { where: { id: req.params.id } });
    !updatedCategory[0]
      ? res.status(404).json({ message: 'Error! No category found for the given ID!' })
      : res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error! Failed to update category.', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.destroy({ where: { id: req.params.id } });
    !deletedCategory
      ? res.status(404).json({ message: 'Error! No category found for the given ID!' })
      : res.status(200).json(deletedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error! Failed to delete category.', error });
  }
});

module.exports = router;
