import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../util/MyButton';

// MUI stuff
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

// Redux stuff
import { connect } from 'react-redux';
import { postPost } from '../redux/actions/dataActions';

// Icons
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme) => ({
  ...theme.spreadThis,
  submitButton: {
    position: 'relative'
  },
  progressSpinner: {
    position: 'absolute'
  },
  closeButton: {
    position: 'absolute',
    left: '90%',
    top: '10%'
  }
})

class PostPost extends Component {
  state = {
    open: false,
    body: '',
    errors: {}
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.UI.errors) {
      this.setState({ errors: nextProps.UI.errors });
    }
    if(!nextProps.UI.errors && !nextProps.UI.loading){
      this.setState({ body: ''});
      this.userClose()
    }
  }
  userOpen = () => {
    this.setState({ open: true })
  }
  userClose = () => {
    this.setState({ open: false, errors: {} })
  }
  userChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }
  userSubmit = (event) => {
    event.preventDefault();
    this.props.postPost({ body: this.state.body })
  }
  render() {
    const { errors } = this.state;
    const { classes, UI: { loading } } = this.props;
    return (
      <Fragment>
        <MyButton onClick={this.userOpen} tip="Create a Post!">
          <AddIcon />
        </MyButton>
        <Dialog open={this.state.open} onClose={this.state.close} fullWidth maxWidth="sm">
          <MyButton tip="Close" onClick={this.userClose} tipClassName={classes.closeButton}>
            <CloseIcon />
          </MyButton>
          <DialogTitle>
            Create a new post
          </DialogTitle>
          <DialogContent>
            <form onSubmit={this.userSubmit}>
              <TextField
                name="body"
                type="text"
                label="Post!"
                multiline
                rows="3"
                placeholder="What's up today?"
                error={errors.body ? true : false}
                helperText={errors.body}
                className={classes.textField}
                onChange={this.userChange}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitButton}
                disabled={loading}
              >
                Submit
                {loading && (
                  <CircularProgress size={30} className={classes.progressSpinner} />
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Fragment>
    )
  }
}

PostPost.propTypes = {
  postPost: PropTypes.func.isRequired,
  UI: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  UI: state.UI
});

export default connect(mapStateToProps, { postPost })(withStyles(styles)(PostPost))