import React from 'react'
import * as ReactDOM from 'react-dom'
import 'typeface-roboto'
import App from './App'

const renderApp = () => {
  ReactDOM.render(
    <App />,
    document.getElementById('app')
  )
}

renderApp()

if (module.hot) {
  module.hot.accept('./App', renderApp)
}
