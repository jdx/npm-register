import axios from 'axios'
import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Paper from 'material-ui/Paper'
import Grid from 'material-ui/Grid'

import Header from './components/Header'

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 30,
    'font-family': ['Roboto', 'Arial', 'sans-serif']
  },
  paper: {
    padding: 16,
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
})

class App extends React.Component {
  constructor (props) {
    super(props)
    this.classes = props.classes
  }

  getPackages () {
    return axios.get('/-/api/v1/packages')
  }

  componentDidMount () {
    this.getPackages().then((response) => {
      console.log(response)
    })
  }

  render () {
    return <div className={this.classes.root}>
      <Header />
      <Grid container spacing={24}>
        <Grid item xs={12} sm={2}>
          <Paper className={this.classes.paper}>Sidebar</Paper>
        </Grid>
        <Grid item xs={12} sm={10}>
          <Paper className={this.classes.paper}>Main Content</Paper>
        </Grid>
      </Grid>
    </div>
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(App)
