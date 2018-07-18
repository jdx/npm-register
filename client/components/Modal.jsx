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
import md from 'marked'

const styles = {
  appBar: {
    position: 'relative',
    background: '#282828',
    color: '#FFF'
  },
  flex: {
    flex: 1
  },
  readme: {
    overflow: 'auto',
    padding: 16
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
    let readme = md.parse(this.props.readme || '', {sanitize: true})
    return (
      <Dialog
        fullScreen
        open={this.props.show}
        onRequestClose={this.props.onClose}
        transition={<Slide direction='up' />}
      >
        <AppBar color='inherit' className={this.classes.appBar}>
          <Toolbar>
            <IconButton onClick={this.props.onClose} aria-label='Close'>
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
        <Typography type='body1' component='div' dangerouslySetInnerHTML={{__html: readme}} className={this.classes.readme} />
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
