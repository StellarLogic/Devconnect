import { GET_POST, POST_ERROR, UPDATE_LIKES } from "../actions/types";

const initialState = {
  posts: [],
  post: null,
  loading: true,
  error: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_POST:
      return { ...state, posts: payload, loading: false };
    case POST_ERROR:
      return { ...state, error: payload, loading: false };
    case UPDATE_LIKES: {
      // console.log(payload);
      return {
        ...state,
        posts: state.posts.map((post) => {
          console.log(post);
          return post._id === payload.id
            ? { ...post, likes: payload.likes }
            : post;
        }),
        loading: false,
      };
    }
    default:
      return state;
  }
}
