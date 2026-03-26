/**
 * @route   GET /api/checkout/order-status/:piId
 * @desc    Get order details after successful payment redirect
 */
router.get('/order-status/:piId', async (req, res) => {
    try {
        const order = await Order.findOne({ stripePaymentIntentId: req.params.piId })
                                .populate('event', 'title date location');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});