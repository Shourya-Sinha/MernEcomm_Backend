const express = require('express');
const { addProduct, deleteProduct, updateProduct, searchbyCategory, searchByName, filterProbyPrice, allProducts, filterWithPriceAndCategory } = require('../Controller/productController');
const { getUser } = require('../Controller/userController');
const router = express.Router();

router.post('/add-product', getUser, addProduct);
router.delete('/delete-product', getUser, deleteProduct);
router.put('/update-delete', getUser, updateProduct);
router.post('/search-cat-product', searchbyCategory);
router.post('/search-product-name', searchByName);
router.post('/filter-price', filterProbyPrice);
router.get('/allproduct', allProducts);
router.post('/all-filter', filterWithPriceAndCategory);

module.exports = router;