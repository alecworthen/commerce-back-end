// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

Product.belongsTo(Catergory, {
  foreignKey: 'category_id',
});

Product.belongsToMany(Tag, {
  foreignKey: 'category_id'
});

Tag.belongsToMany(Product, {
  through: ProductTag,
  foreignKey: 'tag_id',
});

Catergory.hasMany(Product, {
  foreignKey: 'category_id',
});

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
