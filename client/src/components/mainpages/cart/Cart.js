import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'
import PaypalButton from './PaypalButton'
function Cart() {
  const state = useContext(GlobalState)
  const [cart, setCart] = state.userAPI.cart
  const [token] = state.token
  const [callback, setCallback] = state.userAPI.callback
  const [total, setTotal] = useState(0)

  //Total cart 
  useEffect(() => {
    const getTotal = () => {
      const total = cart.reduce((prev, item) => {
        return prev + (item.price * item.quantity)
      }, 0)
      setTotal(total)
    }
    getTotal()
  }, [cart])

  const addToCart = async () => {
    await axios.patch('/user/addCart', { cart }, {
      headers: { Authorization: token }
    })
  }


  // increment (+)
  const increment = (id) => {
    cart.forEach(item => {
      if (item._id === id) {
        item.quantity += 1
      }
    })
    setCart([...cart])
  }
  // decrement (-)
  const decrement = (id) => {
    cart.forEach(item => {
      if (item._id === id) {
        item.quantity === 1 ? item.quantity = 1 : item.quantity -= 1
      }
    })
    setCart([...cart])
  }

  // Close(X)
  const removeProduct = id => {
    if (window.confirm("Do you to delete this products")) {
      cart.forEach((item, index) => {
        if (item._id === id) {
          cart.splice(index, 1)
        }
      })
      setCart([...cart])
      addToCart()
    }
  }
  const tranSuccess = async (payment) => {
    const { paymentID, address } = payment;

    await axios.post('/api/payment', { cart, paymentID, address }, {
      headers: { Authorization: token }
    })
    setCart()
    addToCart([])
    alert("You have successfuly placed an order")
    setCallback(!callback)

  };

  if (cart.length === 0)
    return <h2 style={{ textAlign: "center", fontSize: "Srem" }}>Cart Empty</h2>
  return (
    <div>
      {
        cart.map(product => (

          <div className='detail cart' key={product._id}>
            <img src={product.images.url} alt='' />

            <div className='box-detail'>
              <h2>{product.title}</h2>

              <h3>${product.price * product.quantity}</h3>
              <p>{product.description}</p>
              <p>{product.content}</p>

              <div className='amount'>
                {/* decrement (-) cart */}
                <button onClick={() => decrement(product._id)}> - </button>
                <span>{product.quantity}</span>
                {/* increment(+) cart */}
                <button onClick={() => increment(product._id)}> + </button>

              </div>
              <div className='delete'
                onClick={() => removeProduct(product._id)}>X</div>
            </div>
          </div>

        ))
      }
      <div className='total'>
        <h3>Total: $ {total}</h3>
        <PaypalButton total={total}
          tranSuccess={
            tranSuccess
          } />

      </div>


    </div>
  )
}

export default Cart
