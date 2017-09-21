import http from 'axios'
import Button from 'material-ui/Button'
import { CircularProgress } from 'material-ui/Progress'
import Grid from 'material-ui/Grid'
import Icon from 'material-ui/Icon'
import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table'
import { withStyles } from 'material-ui/styles'

import Header from './components/Header'

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 30,
    'font-family': ['Roboto', 'Arial', 'sans-serif']
  },
  button: {
    margin: theme.spacing.unit
  },
  paper: {
    padding: 16,
    margin: 16,
    width: '100%',
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  loader: {
    color: '#282828'
  }
})

class App extends React.Component {
  constructor (props) {
    super(props)
    this.classes = props.classes
    this.state = {
      packages: [],
      loading: false
    }
  }

  getPackages () {
    this.setState({
      loading: true
    })
    return http.get('/-/api/v1/packages')
  }

  refreshPackages () {
    this.getPackages().then((response) => {
      if (response && response.data) {
        this.setState({
          packages: response.data,
          loading: false
        })
      }
    })
  }

  componentDidMount () {
    this.refreshPackages()
  }

  render () {
    return <div className={this.classes.root}>
      <Header />
      <Grid container spacing={24}>
        <Paper className={this.classes.paper}>
          <Grid item xs={12} sm={12}>
            {this.state.loading && <CircularProgress size={120} className={this.classes.loader} />}
            {!this.state.loading &&
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Package Name</TableCell>
                  <TableCell>Author(s)</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Latest Version</TableCell>
                  <TableCell>Tarball</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.packages.map((item, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.author.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.current_version}</TableCell>
                    <TableCell>
                      <IconButton color='default' aria-label='Download Tarball'><Icon>get_app</Icon></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            }
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button raised className={this.classes.button} onClick={this.refreshPackages.bind(this)}>
              Refresh Packages
            </Button>
          </Grid>
        </Paper>
      </Grid>
    </div>
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(App)
