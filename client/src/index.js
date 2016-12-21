import React from 'react'
import { render } from 'react-dom'

// React Router dependencies
import { Router, Route, hashHistory } from 'react-router'
import { Provider } from 'react-redux'

// Components
import App from './components/App'
import store from './store'

const router = (
  <Provider store={store}>
    <div className='app'>
      <Router history={hashHistory}>
        <Route path='/' component={App}>
        </Route>
      </Router>
    </div>
  </Provider>
)

render(router, document.getElementById('app'))
