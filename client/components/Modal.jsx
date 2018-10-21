import React from 'react'
import md from 'marked'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'

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

  Transition (props) {
    return <Slide direction='up' {...props} />
  }

  render () {
    let readme = md.parse(this.props.readme || '', { sanitize: true })
    return (
      <Dialog
        fullScreen
        open={this.props.show}
        onClose={this.props.onClose}
        TransitionComponent={this.Transition}
      >
        <AppBar color='inherit' className={this.classes.appBar}>
          <Toolbar>
            <IconButton color='inherit' onClick={this.props.onClose} aria-label='Close'>
              <CloseIcon />
            </IconButton>
            <Typography type='title' color='inherit' className={this.classes.flex}>
              README
            </Typography>
            <Button color='inherit' onClick={this.props.onClose}>
              Close
            </Button>
          </Toolbar>
        </AppBar>
        <Typography type='body1' component='div' dangerouslySetInnerHTML={{ __html: readme }} className={this.classes.readme} />
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
