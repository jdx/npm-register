import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Dialog from 'material-ui/Dialog'
import Slide from 'material-ui/transitions/Slide'
import Button from 'material-ui/Button'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton'
import Typography from 'material-ui/Typography'
import CloseIcon from 'material-ui-icons/Close'

const styles = {
  appBar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  }
}

class Modal extends React.Component {
  constructor (props) {
    super(props)
    this.classes = props.classes
    this.readme = props.readme
    this.show = props.show
    this.onClose = props.onClose
  }

  render () {
    return (
      <Dialog
        fullScreen
        open={this.props.show}
        onRequestClose={this.props.onClose}
        transition={<Slide direction='up' />}
      >
        <AppBar className={this.classes.appBar}>
          <Toolbar>
            <IconButton color='contrast' onClick={this.props.onClose} aria-label='Close'>
              <CloseIcon />
            </IconButton>
            <Typography type='title' color='inherit' className={this.classes.flex}>
              README
            </Typography>
            <Button color='contrast' onClick={this.props.onClose}>
              Close
            </Button>
          </Toolbar>
        </AppBar>
        <div>
          Hello World {this.props.readme}
        </div>
      </Dialog>
    )
  }
}

Modal.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  readme: PropTypes.string,
  show: PropTypes.bool
}

export default withStyles(styles)(Modal)
