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
  apiKey: "AIzaSyA1BtDaUDy6Qle2K0IiJihx4kbIyJoiFY0",
  authDomain: "chlorosense-3e14d.firebaseapp.com",
  databaseURL: "https://chlorosense-3e14d-default-rtdb.firebaseio.com/",
  projectId: "chlorosense-3e14d",
  storageBucket: "chlorosense-3e14d.firebasestorage.app",
  messagingSenderId: "787916269046",
  appId: "1:787916269046:web:3d5a6b6b3e80fa1a7ad3d7",
  measurementId: "G-J8GCB80X6E",
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
