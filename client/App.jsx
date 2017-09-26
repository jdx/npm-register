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
  }

  getPackages () {
    this.setState({
      loading: true
    })
    return http.get('/-/api/v1/packages')
  }

  toggleReadMeModal (readme) {
    let content = readme || ''
    this.setState({
      readmeOpen: !this.state.readmeOpen,
      readmeContent: content
    })
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
      <Grid container spacing={16}>
        <Paper className={this.classes.paper}>
          <Grid item xs={12} sm={12}>
            {this.state.loading && <CircularProgress size={120} className={this.classes.loader} />}
            {!this.state.loading &&
            <Table className={this.classes.table}>
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
              <TableBody>
                {this.state.packages.map((item, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.author.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.currentVersion}</TableCell>
                    <TableCell>
                      <IconButton color='default' aria-label='Open read me' onClick={this.toggleReadMeModal.bind(this, item.readme)}>
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
      <Modal show={this.state.readmeOpen} onClose={this.toggleReadMeModal.bind(this, null)} readme={this.state.readmeContent} />
    </div>
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(App)
