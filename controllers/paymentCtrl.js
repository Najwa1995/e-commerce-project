const Payments = require('../models/paymentModel')
const Users = require('../models/userModel')
const Products = require('../models/productModel')


const paymentCtrl = {
    getPayments: async (req, res) => {
        try {

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = paymentCtrl