import React, { Fragment } from 'react';
import NoImg from '../images/no-img.png';
import PropTypes from 'prop-types';

// MUI Stuff
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  ...theme.spreadThis,
  card: {
    display: 'flex',
    marginBottom: 20
  },
  cardContent: {
    width: '100%',
    flexDirection: 'column',
    padding: 25
  },
  cover: {
    minWidth: 200,
    objectFit: 'cover'
  },
  username: {
    width: 60,
    height: 18,
    backgroundColor: theme.palette.primary.main,
    marginBottom: 7
  },
  date: {
    height: 14,
    width: 100,
    marginBottom: 10,
    backgroundColor: 'rgb(0,0,0,0.3)'
  },
  fullLine: {
    height: 15,
    width: '90%',
    marginBottom: 10,
    backgroundColor: 'rgb(0,0,0,0.6)'
  },
  halfLine: {
    height: 15,
    width: '50%',
    marginBottom: 10,
    backgroundColor: 'rgb(0,0,0,0.6)'
  }
})

const PostSkeleton = (props) => {
  const { classes } = props;
  const content = Array.from({ length: 5 }).map((item, index) => (
    <Card className={classes.card} key={index}>
      <CardMedia className={classes.cover} image={NoImg}/>
      <CardContent className={classes.cardContent}>
        <div className={classes.username}/>
        <div className={classes.date}/>
        <div className={classes.fullLine}/>
        <div className={classes.fullLine}/>
        <div className={classes.halfLine}/>
      </CardContent>

    </Card>
  ))

  return <Fragment>{content}</Fragment>
}

PostSkeleton.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(PostSkeleton);