import http from 'axios'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { withStyles } from '@material-ui/core/styles'

import Header from './components/Header'
import Modal from './components/Modal'

const styles = theme => ({
  root: {
    marginTop: 30,
    'font-family': ['Roboto', 'Arial', 'sans-serif']
  },
  button: {
    margin: theme.spacing.unit
  },
  anchor: {
    'text-decoration': 'none'
  },
  paper: {
    padding: 16,
    margin: 16,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto'
  },
  table: {
    overflow: 'auto',
    'word=break': 'keep-all'
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
      loading: false,
      readmeOpen: false,
      readmeContent: null
    }
    this.toggleReadMeModal = this.toggleReadMeModal.bind(this)
    this.refreshPackages = this.refreshPackages.bind(this)
  }

  getPackages () {
    this.setState({
      loading: true
    })
    return http.get('/-/api/v1/packages')
  }

  toggleReadMeModal (readmeContent) {
    return () => {
      this.setState({
        readmeOpen: !this.state.readmeOpen,
        readmeContent
      })
    }
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

  tableHeader () {
    return (
      <TableHead>
        <TableRow>
          <TableCell>Package Name</TableCell>
          <TableCell>Author(s)</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Latest Version</TableCell>
          <TableCell>Readme</TableCell>
          <TableCell>Tarball</TableCell>
        </TableRow>
      </TableHead>
    )
  };

  tableBody () {
    return (
      <TableBody>
        {this.state.packages.map((item, idx) => (
          <TableRow key={idx} hover>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.author.name}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>{item.currentVersion}</TableCell>
            <TableCell>
              <IconButton color='default' aria-label='Open read me' onClick={this.toggleReadMeModal(item.readme)}>
                <Icon>class</Icon>
              </IconButton>
            </TableCell>
            <TableCell>
              <a href={item.tarball.tarball} className={this.classes.anchor}>
                <IconButton color='default' aria-label='Download Tarball'><Icon>get_app</Icon></IconButton>
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    )
  }

  refreshButton () {
    return (
      <Grid item xs={12} sm={12}>
        <Button variant='raised' className={this.classes.button} onClick={this.refreshPackages}>
          Refresh Packages
        </Button>
      </Grid>
    )
  }

  render () {
    return (
      <div className={this.classes.root}>
        <Header />
        <Grid container spacing={16}>
          <Paper className={this.classes.paper}>
            <Grid item xs={12} sm={12}>
              {this.state.loading && <CircularProgress size={120} className={this.classes.loader} />}
              {!this.state.loading &&
                <Table className={this.classes.table}>
                  {this.tableHeader()}
                  {this.tableBody()}
                </Table>
              }
            </Grid>
            {this.refreshButton()}
          </Paper>
        </Grid>
        <Modal show={this.state.readmeOpen} onClose={this.toggleReadMeModal()} readme={this.state.readmeContent} />
      </div>
    )
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(App)
