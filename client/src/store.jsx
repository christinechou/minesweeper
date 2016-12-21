import rootReducer from './reducer/board'
import { createStore } from 'redux'

const store = createStore(rootReducer)

// const connector = reactRedux.connect(mapStateToProps, mapDispatchToProps)
export default store

//For ajax calls / asynchronous code, dispatch an action. inside the action you would call your ajax.
//Dispatch action as a result of the callback, and this dispatch updates the store.