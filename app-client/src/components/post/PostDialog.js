import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import MyButton from '../../util/MyButton';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';
import Comments from './Comments';
import CommentForm from './CommentForm';

// MUI Stuff
import withStyles from '@material-ui/core/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';

// Icons 
import CloseIcon from '@material-ui/icons/Close';
import UnfoldMore from '@material-ui/icons/UnfoldMore';
import ChatIcon from '@material-ui/icons/Chat';

// Redux stuff
import { connect } from 'react-redux';
import { getPost, clearErrors } from '../../redux/actions/dataActions';

const styles = theme => ({
  ...theme.spreadThis,
  profileImage: {
    maxWidth: 200,
    height: 200,
    borderRadius: '50%',
    objectFit: 'cover'
  },
  dialogContent: {
    padding: 20
  },
  closeButton: {
    position: 'absolute',
    left: '90%',
    top: '2%'
  },
  expandButton: {
    position: 'absolute',
    left: '90%',
  },
  spinnerDiv: {
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 50
  }
})

class PostDialog extends Component {
  state = {
    open: false,
    oldPath: '',
    newPath: ''
  }

  componentDidMount(){
    if(this.props.openDialog){
      this.userOpen();
    }
  }

  userOpen = () => {
    let oldPath = window.location.pathname;
    const { username, postId } = this.props;
    const newPath = `/users/${username}/post/${postId}`;
    if(oldPath === newPath) oldPath = `/users/${username}`;
    window.history.pushState(null, null, newPath);
    this.setState({ open: true, oldPath, newPath })
    this.props.getPost(this.props.postId)
  }

  userClose = () => {
    window.history.pushState(null, null, this.state.oldPath)
    this.setState({ open: false })
    this.props.clearErrors()
  }

  render() {
    const {
      classes,
      post: {
        postId,
        body,
        date,
        likeCount,
        commentCount,
        userImage,
        author,
        comments
      },
      UI: { loading }
    } = this.props

    const dialogMarkup = loading ? (
      <div className={classes.spinnerDiv}>
        <CircularProgress size={200} thickness={2} />
      </div>
    ) : (
        <Grid container spacing={16}>
          <Grid item sm={5}>
            <img src={userImage} alt="Profile" className={classes.profileImage} />
          </Grid>
          <Grid item sm={7}>
            <MuiLink component={Link} color="primary" variant="h5" to={`/users/${author}`}>
              @{author}
            </MuiLink>
            <hr className={classes.invisibleSeparator} />
            <Typography variant="body2" color="textSecondary">
              {dayjs(date).format('h:mm a, MMM DD YYYY')}
            </Typography>
            <hr className={classes.invisibleSeparator} />
            <Typography variant="body1">
              {body}
            </Typography>
            <LikeButton postId={postId} />
            <span>{likeCount} Likes</span>
            <MyButton tip="comments">
              <ChatIcon color="primary" />
            </MyButton>
            <span>{commentCount} Comments</span>
          </Grid>
          <hr className={classes.visibleSeparator}/>
          <CommentForm postId={postId} />
          <Comments comments={comments}/>
        </Grid>
      )

    return (
      <Fragment>
        <MyButton onClick={this.userOpen} tip="Expand post" tipClassName={classes.expandButton}>
          <UnfoldMore color="primary" />
        </MyButton>
        <Dialog open={this.state.open} onClose={this.state.close} fullWidth maxWidth="sm">
          <MyButton tip="Close" onClick={this.userClose} tipClassName={classes.closeButton}>
            <CloseIcon />
          </MyButton>
          <DialogContent className={classes.dialogContent}>
            {dialogMarkup}
          </DialogContent>
        </Dialog>
      </Fragment>
    )
  }
}

PostDialog.propTypes = {
  getPost: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  postId: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  post: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  post: state.data.post,
  UI: state.UI
})

const mapActionsToProps = {
  getPost,
  clearErrors
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(PostDialog))
