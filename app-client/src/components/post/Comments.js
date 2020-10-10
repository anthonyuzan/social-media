import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

// MUI Stuff
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';

const styles = theme => ({
  ...theme.spreadThis,
  commentImage: {
    maxWidth: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover'
  },
  commentData: {
    marginLeft: 25
  }
})

class Comments extends Component {
  render() {
    const { comments, classes } = this.props
    return (
      <Grid container>
        {comments.map((comment, index) => {
          const { body, username, userImage, createdAt } = comment
          return (
            <Fragment key={createdAt}>
              <Grid item sm={12}>
                <Grid container>
                  <Grid item sm={2}>
                    <img src={userImage} alt="comment" className={classes.commentImage} />
                  </Grid>
                  <Grid item sm={9}>
                    <div className={classes.commentData}>
                      <MuiLink
                        variant="h5"
                        component={Link}
                        to={`/users/${username}`}
                        color="primary">
                        @{username}
                      </MuiLink>
                      <Typography variant="body2" color="textSecondary">
                        {dayjs(createdAt).format('h:mm a, MMM DD YYYY')}
                      </Typography>
                      <hr className={classes.invisibleSeparator} />
                      <Typography variant="body1">{body}</Typography>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
              {index !== comments.length - 1 && (
                <hr className={classes.visibleSeparator} />
              )}
            </Fragment>
          )
        })}
      </Grid>
    )
  }
}

Comments.propTypes = {
  comments: PropTypes.array.isRequired
}

export default withStyles(styles)(Comments)
