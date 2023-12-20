const router = require('express').Router();
const { Tag, Product} = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tagsData = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(tagsData);
  } catch (error) {
    res.status(500).json({ message: 'Error! Tags not found!' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!tagData) {
      res.status(404).json({ message: 'Error! No tag found for the given ID!' });
      return;
    }
    res.status(200).json(tagData);
  } catch (error) {
    res.status(500).json({ message: 'Error! No tag found!' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
  } catch (error) {
    res.status(400).json({ message: 'Error! Failed to create a new tag.', error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedTag = await Tag.update(req.body, {
      where: { id: req.params.id },
    });
    !updatedTag[0]
      ? res.status(400).json({ message: 'Error! No tag found for the given ID!' })
      : res.status(200).json(updatedTag);
  } catch (error) {
    res.status(500).json({ message: 'Error! Failed to update tag.', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedTag = await Tag.destroy({ where: { id: req.params.id } });
    !deletedTag
      ? res.status(400).json({ message: 'Error! No tag found for the given ID!' })
      : res.status(200).json(deletedTag);
  } catch (error) {
    res.status(500).json({ message: 'Error! Failed to delete tag.', error });
  }
});

module.exports = router;
