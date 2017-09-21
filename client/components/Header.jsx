import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'

const styles = {
  root: {
    marginBottom: 30,
    width: '100%'
  },
  appbar: {
    background: '#cc0000',
    color: '#FFF'
  },
  type: {
    marginLeft: 10
  }
}

function SimpleAppBar (props) {
  const classes = props.classes
  return (
    <div className={classes.root}>
      <AppBar position='static' color='inherit' className={classes.appbar}>
        <Toolbar>
          <img src='/images/logo-small.png' alt='NPM Register' width='30px' height='30px' />
          <Typography type='headline' color='inherit' className={classes.type}>
            NPM Register
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}

SimpleAppBar.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SimpleAppBar)
