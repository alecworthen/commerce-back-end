const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productsData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(productsData);
  } catch (error) {
    res.status(500).json({ message: 'Unable to retrieve products.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    !productData
      ? res.status(404).json({ message: 'Product not found.' })
      : res.status(200).json(productData);
  } catch (error) {
    res.status(500).json({ message: 'Unable to retrieve product.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const createdProduct = await Product.create(req.body);

    if (req.body.tagIds.length) {
      const productTagIds = req.body.tagIds.map((tag_id) => ({
        product_id: createdProduct.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIds);
    }

    res.status(200).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product.', error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });

    if (req.body.tags && req.body.tags.length > 0) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tags
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));
      const productTagToRemove = productTags
        .filter(({ tag_id }) => !req.body.tags.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: Tag }],
    });
    return res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Failed to update product.', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({ where: { id: req.params.id } });
    !deletedProduct
      ? res.status(404).json({ message: 'Product not found.' })
      : res.status(200).json(deletedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.', error });
  }
});

module.exports = router;
