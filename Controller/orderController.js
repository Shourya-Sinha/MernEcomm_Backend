const Order = require("../Models/OrderModel");

exports.createOrder = async (req, res) => {
  try {
    const { shippingInfo, orderItems, paymentInfo, totalPrice } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      user:req.user._id,
      paymentInfo,
      totalPrice,
      paidAt:Date.now(),
    });

    res.status(201).json({
        status:'success',
        message:'Order created successfully',
        order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getAllOrder = async (req,res) =>{
    try {
        const order = await Order.find();

        return res.status(200).json({
            status:'success',
            message:'Order Found',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            status:'error',
            message:error.message,
        });
    }
}
