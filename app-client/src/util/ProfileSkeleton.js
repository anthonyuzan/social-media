import React from 'react';
import PropTypes from 'prop-types';
import NoImg from '../images/no-img.png';

// MUI Stuff
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';

// Icons
import LocationOn from '@material-ui/icons/LocationOn';
import LinkIcon from '@material-ui/icons/Link';
import CalendarToday from '@material-ui/icons/CalendarToday';

const styles = theme => ({
  ...theme.spreadThis,
  username: {
    height: 20,
    width: 60,
    backgroundColor: theme.palette.primary.main,
    margin: '0 auto 7px auto'
  },
  fullLine: {
    height: 15,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginBottom: 10
  },
  halfLine: {
    height: 15,
    width: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginBottom: 10
  }
})

const ProfileSkeleton = (props) => {
  const { classes } = props;
  return (
    <Paper className={classes.paper}>
      <div className={classes.profile}>
        <div className="image-wrapper">
          <img src={NoImg} alt="profile" className="profile-image"/>
        </div>
        <hr/>
        <div className="profile-details">
          <div className={classes.username}/>
          <hr/>
          <div className={classes.fullLine}/>
          <div className={classes.fullLine}/>
          <hr/>
          <LocationOn color="primary"/> <span>Location</span>
          <hr/>
          <LinkIcon color="primary"/> https://website.com
          <hr/>
          <CalendarToday color="primary"/> Joined date
        </div>
      </div>
    </Paper>
  )
}

ProfileSkeleton.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ProfileSkeleton);