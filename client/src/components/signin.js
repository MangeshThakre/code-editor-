import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { TOKEN } from "../redux/reduxToken/currentUserSplice.js";
function Signin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phoneNo, setphoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState(false);
  async function signIn() {
    var data;
    if (phoneNo.includes(".com")) {
      data = {
        email: phoneNo,
        password: password,
      };
    } else {
      data = {
        phoneNo: phoneNo,
        password: password,
      };
    }
    try {
      const response = await axios({
        method: "post",
        url: "http://localhost:8081/signin",
        header: { "content-type": "application/jsn" },
        data: data,
      });
      const responseData = await response.data.Token;
      if (responseData === "invalid") {
        setWarning(true);
      } else {
        localStorage.setItem("Token", responseData);
        dispatch(TOKEN(responseData));

        setphoneNo("");
        setPassword("");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      <Card>
        <CardContent>
          <div>
            <TextField
              error={warning}
              id="filled-error-helper-text"
              label="Phone no. or Email"
              defaultValue={phoneNo}
              placeholder="phone No or Email"
              autoComplete="false"
              variant="filled"
              onChange={(e) => {
                setphoneNo(e.target.value);
                setWarning(false);
              }}
            />
          </div>
          <div>
            <TextField
              error={warning}
              id="filled-error-helper-text"
              label="Password"
              type="password"
              defaultValue={password}
              placeholder="password"
              autoComplete="false"
              variant="filled"
              onChange={(e) => {
                setPassword(e.target.value);
                setWarning(false);
              }}
            />
          </div>
          <Button
            variant=""
            disabled={(phoneNo !== "") & (password !== "") ? false : true}
            onClick={signIn}
          >
            Sign in
          </Button>
          <div>
            <p>
              Create a new account
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signin;
