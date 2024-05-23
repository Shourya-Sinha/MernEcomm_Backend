const Product = require('../Models/ProductModel');
const cloudinary = require('cloudinary').v2;

//Adding Product 

exports.addProduct = async (req, res) => {
    try {
        const { Product_name, price, rating, description, category,quantity } = req.body;

        const user = req.user;
        console.log('Request Body', req.body);
        if (user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: "You are not authorized to perform this action",
            });
        }

        if (!Product_name || !price || !rating || !description || !category || !quantity) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required',
            });
        }

        const data = {
            Product_name,
            price,
            rating,
            description,
            category,
            quantity,
        };

        if (req.files && req.files.images) {
            let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            let imagesLink = [];
            console.log('images', images);
            for (let image of images) {
                const result = await cloudinary.uploader.upload(image.tempFilePath, {
                    folder: "Product_Images",
                });

                imagesLink.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
            data.images = imagesLink;
        }

        const product = await Product.create(data);

        return res.status(201).json({
            status: 'success',
            message: 'Product successfully added',
            data: product,
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};

// Deleting Product
exports.deleteProduct = async (req, res) => {
    try {
        const { product_id } = req.body;

        const product = await Product.findById(product_id);

        const user = req.userId;

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'You are not authorize to perform this action',
            });
        }

        if (!product) {
            return res.status(400).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        const publicIds = product.images.map(image => image.public_id);

        for (let publicId of publicIds) {
            await cloudinary.uploader.destroy(publicId);
        }

        await Product.findByIdAndDelete(product_id);

        return res.status(200).json({
            status: "success",
            message: 'Product adn associated images Successfully Deleted',
            product
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

// Updating Product
exports.updateProduct = async (req, res) => {
    try {
        const { product_id, Product_name, price, rating, comment, description, category } = req.body;

        const user = req.userId;

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'You are not authorize to perform this action',
            });
        }

        const existingProduct = await Product.findById(product_id);

        if (!updatedProduct) {
            return res.status(404).json({
                status: "error",
                message: "Product Not found",
            });
        }

        existingProduct.Product_name = Product_name;
        existingProduct.price = price;
        existingProduct.rating = rating;
        existingProduct.comment = comment;
        existingProduct.description = description;
        existingProduct.category = category;

        if (req.files && req.files.images) {
            // Delete existing images from Cloudinary
            for (let image of existingProduct.images) {
                await cloudinary.uploader.destroy(image.public_id);
            }

            // Upload and save new images
            let imagesLink = [];
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            for (let image of images) {
                const result = await cloudinary.uploader.upload(image.tempFilePath, {
                    folder: "Product_Images",
                });
                imagesLink.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
            existingProduct.images = imagesLink;
        }

        // Save the updated product details
        const updatedProduct = await existingProduct.save();


        return res.status(201).json({
            status: 'success',
            message: 'Product Updated Successfully',
            updatedProduct,
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}

//search product by category
exports.searchbyCategory = async (req, res) => {
    try {
        const { catName } = req.body;

        if (!catName) {
            return res.status(400).json({
                status: 'error',
                message: 'Enter Field'
            })
        }

        const catNameRegex = new RegExp(catName, "i");

        const products = await Product.find({ category: { $regex: catNameRegex } });

        if (products.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product Not Found'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Products found successfully',
            products,
        });


    } catch (error) {
        return res.status({
            status: 'error',
            message: error.message
        });
    }
}

// search product by product name
exports.searchByName = async (req, res) => {
    try {
        const { proName } = req.body;

        if (!proName) {
            return res.status(400).json({
                status: 'error',
                message: 'Enter Product Name',
            });
        }

        const regexProductName = new RegExp(proName, "i");

        const product = await Product.find({ Product_name: { $regex: regexProductName } });

        if (product.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product Not Found'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Product Found',
            product,
        })
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}

// filter product price with 
exports.filterProbyPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        const filter = {}

        if (minPrice !== undefined) {
            filter.price = { $gte: minPrice };
        }

        if (maxPrice !== undefined) {
            filter.price = { ...filter.price, $lte: maxPrice }
        }

        const products = await Product.find(filter);

        return res.status(200).json({
            status: 'success',
            message: "Product Filtered",
            products,
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.allProducts = async (req, res) => {
    try {
        const product = await Product.find();

        return res.status(200).json({
            status: 'success',
            message: 'Products Found',
            product,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.filterWithPriceAndCategory = async (req, res) => {
    try {
        const { catName, minPrice, maxPrice } = req.body;

        const filter = {};


        if (catName) {
            const catNameRegex = new RegExp(catName, 'i');
            filter.category = catNameRegex;
        }
        // Constructing the price filter based on minPrice and maxPrice
        if (minPrice !== undefined && maxPrice !== undefined) {
            // If both minPrice and maxPrice are provided, filter within the price range
            filter.price = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice !== undefined) {
            // If only minPrice is provided, filter products with price greater than or equal to minPrice
            filter.price = { $gte: minPrice };
        } else if (maxPrice !== undefined) {
            // If only maxPrice is provided, filter products with price less than or equal to maxPrice
            filter.price = { $lte: maxPrice };
        }

        // Constructing the sort order based on minPrice and maxPrice
        let sortOrder = {};
        if (minPrice !== undefined && maxPrice !== undefined) {
            // If both minPrice and maxPrice are provided, sort in descending order
            sortOrder.price = -1; // High to low price
        } else {
            // If only one of minPrice or maxPrice is provided, or no price range is provided, sort in ascending order
            sortOrder.price = 1; // Low to high price
        }
        const products = await Product.find(filter).sort(sortOrder);

        return res.status(200).json({
            status: 'success',
            message: 'Products Filtered',
            products
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}

