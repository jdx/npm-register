import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Paper from 'material-ui/Paper'
import Grid from 'material-ui/Grid'
import Typography from 'material-ui/Typography'

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

function AutoGrid (props) {
  const classes = props.classes

  return (
    <div className={classes.root}>
      <Typography type='display1' gutterBottom>
        NPM Register
      </Typography>
      <Grid container spacing={24}>
        <Grid item xs={12} sm={2}>
          <Paper className={classes.paper}>Sidebar</Paper>
        </Grid>
        <Grid item xs={12} sm={10}>
          <Paper className={classes.paper}>Main Content</Paper>
        </Grid>
      </Grid>
    </div>
  )
}

AutoGrid.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(AutoGrid)
