// district phed

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: process.env.API,
  authDomain: process.env.AUTHDOMAIN,
  databaseURL: process.env.DBURL,
  projectId: process.env.PROJID,
  storageBucket: process.env.STORAGEBUC,
  messagingSenderId: process.env.MSGID,
  appId: process.env.APPID,
  measurementId: process.env.MID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const authorizedEmailphedRef = ref(db, "authorizedEmailphed");

document.getElementById("signin-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const snapshot = await get(authorizedEmailphedRef);
      const authorizedEmails = snapshot.val();

      if (authorizedEmails && authorizedEmails[email.replace(".", "_")]) {
        window.location.href = "districtphed.html";
      } else {
        document.getElementById("error-message").innerText =
          "Email is not authorized!";

        auth.signOut();
      }
    })
    .catch((error) => {
      const errorMessage = error.message;
      document.getElementById("error-message").innerText = errorMessage;
    });
});
