import React, { useContext, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import Login from './auth/Login'
import Register from './auth/Register'
import Cart from './cart/Cart'
import Products from './products/Products'
import NotFound from './products/utils/not_found/NotFound'
import DetailProduct from './detailProduct/DetailProduct'
import { GlobalState } from '../../GlobalState'
import OrderHistory from './History/OrderHistory'
import OrderDetails from './History/OrderDetails'
import Categories from './categories/Categories'

const Pages = () => {
  const state = useContext(GlobalState)
  const [isLogged] = state.userAPI.isLogged
  const [isAdmin] = state.userAPI.isAdmin

  return (
    <Switch>

      <Route path='/' exact component={Products} />
      <Route path='/detail/:id' exact component={DetailProduct} />

      <Route path='/login' exact component={isLogged ? NotFound : Login} />
      <Route path='/register' exact component={isLogged ? NotFound : Register} />

      <Route path='/category' exact component={isAdmin ? Categories:NotFound } />
  

      <Route path='/history' exact component={isLogged ? OrderHistory : NotFound} />
      <Route path='/history/:id' exact component={isLogged ? OrderDetails : NotFound} />
      <Route path='/cart' exact component={Cart} />

      <Route path='*' exact component={NotFound} />

    </Switch>

  )
}

export default Pages
