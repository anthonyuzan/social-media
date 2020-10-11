import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import MyButton from '../../util/MyButton';
import DeletePost from './DeletePost';
import PostDialog from './PostDialog';
import LikeButton from './LikeButton';

// MUI Stuff
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import MuiLink from '@material-ui/core/Link';

// Icons
import ChatIcon from '@material-ui/icons/Chat';

// Redux Stuff
import { connect } from 'react-redux';

const styles = {
  card: {
    position: 'relative',
    display: 'flex',
    marginBottom: 20
  },
  image: {
    minWidth: 200
  },
  content: {
    padding: 25,
    objectFit: 'cover'
  }
}

export class Post extends Component {
  render() {
    dayjs.extend(relativeTime);
    const {
      classes,
      post: {
        body,
        date,
        userImage,
        author,
        postId,
        likeCount,
        commentCount
      },
      user: {
        authenticated,
        credentials: { username }
      }
    } = this.props;

    const deleteButton = authenticated && author === username ? (
      <DeletePost postId={postId} />
    ) : null

    return (
      <Card className={classes.card}>
        <CardMedia image={userImage} title="Profile image" className={classes.image} />
        <CardContent className={classes.content}>
          <MuiLink variant="h5" component={Link} to={`/users/${author}`} color="primary">
            @{author}
          </MuiLink>
          {deleteButton}
          <Typography variant="body2" color="textSecondary">
            {dayjs(date).fromNow()}
          </Typography>
          <Typography variant="body1">{body}</Typography>
          <LikeButton postId={postId} />
          <span>{likeCount} Likes</span>
          <MyButton tip="comments" >
            <ChatIcon color="primary" />
          </MyButton>
          <span>{commentCount} Comments</span>
          <PostDialog postId={postId} username={author} openDialog={this.props.openDialog} />
        </CardContent>
      </Card>
    )
  }
}

Post.propTypes = {
  user: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  openDialog: PropTypes.bool
}

const mapStateToProps = (state) => ({
  user: state.user
})

export default connect(mapStateToProps)(withStyles(styles)(Post));
