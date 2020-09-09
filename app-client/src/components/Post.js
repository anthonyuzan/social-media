import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';

// MUI Stuff
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

const styles = {
  card: {
    display: 'flex'
  }
}

export class Post extends Component {
  render() {
    const { classes, post : { body, date, userImage, author, postId, likeCount, commentCount } } = this.props;
    return (
      <Card>
        <CardMedia image={userImage} title="Profile image"/>
        <CardContent>
          <Typography variant="h5">{author}</Typography>
          <Typography variant="body2" color="textSecondary">{date}</Typography>
          <Typography variant="body1">{body}</Typography>
        </CardContent>
      </Card>
    )
  }
}

export default withStyles(styles)(Post)
