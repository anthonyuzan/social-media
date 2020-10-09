import { SET_POSTS, LIKE_POST, UNLIKE_POST, LOADING_DATA, DELETE_POST, POST_POST, SET_POST, SUBMIT_COMMENT } from '../types';

const initialState = {
  posts: [],
  post: {},
  loading: false
}

export default function(state = initialState, action){
  switch(action.type){
    case LOADING_DATA:
      return{
        ...state,
        loading: true
      }
    case SET_POSTS:
      return{
        ...state,
        posts: action.payload,
        loading: false
      }
    case LIKE_POST:
    case UNLIKE_POST:
      let index = state.posts.findIndex((post) => post.postId === action.payload.postId)
      state.posts[index] = action.payload;
      if(state.post.postId === action.payload.postId){
        state.post = action.payload
      }
      return{
        ...state
      }
    case DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter((post) => post.postId !== action.payload )
      }
    case POST_POST:
      return {
        ...state,
        posts: [
          action.payload,
          ...state.posts
        ]
      }
    case SET_POST:
      return {
        ...state,
        post: action.payload
      }
    case SUBMIT_COMMENT:
      return {
        ...state,
        post: {
          ...state.post,
          comments: [action.payload, ...state.post.comments]
        }
      }
    default:
      return state;
  }
}
