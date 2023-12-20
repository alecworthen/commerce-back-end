const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{model: Category}, {model: Tag}],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({message: 'No Products found!'});
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{model: Category}, {model: Tag}],
    });
    !product ? res.status(404).json({message: 'No product found!'}) :
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({message: 'No product found!'})
  }
});

// create new product
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIds = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIds);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      res.status(400).json({message: 'Failed', error: err});
    });
});

// update product
router.put('/:id', async (req, res) => {
  try {
    await Product.update(req.body, {where: {id: req.params.id}});

    if (req.body.tags && req.body.tags.length > 0) {
      const productTags = await ProductTag.findAll({where: {product_id: req.params.id}});
      const productTagIds = productTags.map(({tag_id}) => tag_id);
      const newProductTags = req.body.tags
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        }
      });
      const productTagToRemove = productTags
      .filter(({tag_id}) => !req.body.tags.includes(tag_id))
      .map(({id}) => id);

      await Promise.all([
        ProductTag.destroy({where: {id: productTagToRemove}}),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }
    const product = await Product.findByPk(req.params.id,{include: [{model: Tag}]});
    return res.json(product);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({where: {id: req.params.id}});
    !deleted
      ? res.status(404).json({message: 'no id found'})
      : res.status(200).json(deleted);
  } catch (err){
    res.status(500).json({message: 'Error! Product not deleted!', error: err});
  }
});

module.exports = router;
