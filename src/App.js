import React, { useState } from 'react';
import './App.css';
import firebaseConfig from './firebase.config';
import firebase from "firebase/app";
import "firebase/auth";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  }

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user,setUser] = useState({
    isSignedIn:  false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false
  })

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignedIn =() =>{
    firebase.auth()
        .signInWithPopup(googleProvider)
        .then(res =>{
          const {displayName, email,photoURL} = res.user;
          console.log(displayName, email, photoURL);
          const signInInfo ={
            isSignedIn: true,
            name : displayName,
            email : email,
            photo: photoURL
          }
          setUser(signInInfo);
        })
        .catch(err =>console.log(err));
  }

  const handleFbSignIn = () =>{
    firebase
    .auth()
    .signInWithPopup(fbProvider)
    .then((result) => {
     console.log(result.user )
    })
    .catch((error) => {
      console.log(error)
  });
  }

  const handleSignedOut = () => {
    firebase.auth().signOut()
          .then(res => {
          const signOutInfo = {
            isSignedIn : false,
            name: '',
            email: '',
            photo: ''
          } 
          setUser(signOutInfo);
          })
          .catch(err => console.log(err));
        }

   
    const handleBlur = (event) => {
      let isValid = true;
      if(event.target.name === 'email'){
        isValid = /\S+@\S+\.\S+/.test(event.target.value)
      }
      if(event.target.name === 'password'){
        const passwordValid = event.target.value.length > 6;
        const passwordHasNumber = /\d{1}/.test(event.target.value)
        isValid = passwordValid && passwordHasNumber;
      }
      if(isValid){
        const newUserInfo = {...user};
        newUserInfo[event.target.name] = event.target.value;
        setUser(newUserInfo);
      }
    }
  const handleSubmit = (event) => {
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then((res) => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name)

      })
      .catch((error) => {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = {...user};
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("sign in " ,res)
        })
        .catch((error) => {
          const newUserInfo = {...user};
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }  
          event.preventDefault();
        }
      const updateUserName = name =>{
        var user = firebase.auth().currentUser;
          user.updateProfile({
            displayName: name,
          }).then(function() {
            console.log("updated successfully");
          }).catch(function(error) {
            console.log(error);
          });
      }


  return (
    <div className="App">
      
      {
        user.isSignedIn ? <button onClick= {handleSignedOut}>Sign out</button>:
        <button onClick= {handleSignedIn}>Sign In</button>
      }
      <br/>
      <button onClick={handleFbSignIn}>Sign in With Facebook</button>
      {
        user.isSignedIn && <div>
            <h1>Name: {user.name}</h1>
            <p>email: {user.email}</p>
            <img src={user.photo} alt="" width="50%"/>
          </div>
      }

      <h1>Our own authentication</h1>
      <input type="checkbox" name="newUser" onChange= {() => setNewUser(!newUser)} id=""/>
      <label htmlFor="newUser">New user sign Up</label>
      <form onSubmit={handleSubmit}>
        { 
          newUser && <input type="text" name="name" onBlur={handleBlur} placeholder = "Enter Your Name"/>
        }
        <br/>
        <input type="text" name="email" onBlur={handleBlur} placeholder="Enter your Email" required/>
        <br/>
        <input type="password" name="password" onBlur={handleBlur} placeholder="Enter your password" required/>
        <br/>
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
      </form>
      <p style={{color: 'red'}}>{user.error}</p>
      {
        user.success && <p style={{color: 'green'}}>Email {newUser ? 'created' : 'logged In'} successfully</p>
      }
    </div>
  );
}

export default App;
