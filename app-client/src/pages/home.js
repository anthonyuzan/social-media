import React, { Component } from 'react';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';

import Post from '../components/Post'

export class home extends Component {
  state = {
    posts: null
  }
  componentDidMount() {
    axios.get('/posts')
      .then((res) => {
        console.log(res.data)
        this.setState({
          posts: res.data
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }
  render() {
    let recentPostsMarkup = this.state.posts ? (
    this.state.posts.map((post) => <Post key={post.postId} post={post}/>)
    ) : <p>Loading...</p>
    return (
      <Grid container spacing={2}>
        <Grid item sm={8} xs={12}>
          {recentPostsMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          <p>Profile...</p>
        </Grid>
      </Grid>

    )
  }
}

export default home
