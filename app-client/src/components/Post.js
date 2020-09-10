import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

// MUI Stuff
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

const styles = {
  card: {
    display: 'flex',
    marginBottom: 20
  },
  image: {
    minWidth: 200,
  },
  content: {
    padding: 25,
    objectFit: 'cover',
  }
}

export class Post extends Component {
  render() {
    const { classes, post : { body, date, userImage, author, postId, likeCount, commentCount } } = this.props;
    return (
      <Card className={classes.card}>
        <CardMedia image={userImage} title="Profile image" className={classes.image}/>
        <CardContent className={classes.content}>
          <Typography variant="h5" component={Link} to={`/users/${author}`} color="primary">{author}</Typography>
          <Typography variant="body2" color="textSecondary">{date}</Typography>
          <Typography variant="body1">{body}</Typography>
        </CardContent>
      </Card>
    )
  }
}

export default withStyles(styles)(Post)
