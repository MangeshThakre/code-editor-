const userModel = require("../schema/UserSchema.js");
const contactModel = require("../schema/newContactSchema.js");
var jwt = require("jsonwebtoken");
const md5 = require("md5");

const { response } = require("express");
require("dotenv/config");

class codeeditorController {
  static index = (req, res) => {
    res.send({ data: "data" });
  };

  static register = async (req, res) => {
    try {
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const phoneNo = req.body.phoneNo;
      const password = req.body.password;
      const gender = req.body.gender;
      const saveUserInfo = new userModel({
        firstName: firstName,
        lastName: lastName,
        phoneNo: phoneNo,
        password: password,
        gender: gender,
      });
      const result = await saveUserInfo.save();
      res.send({
        status: 200,
        result: result,
      });
    } catch (error) {
      console.log(error);
      res.send({
        status: 200,
        Error: error,
      });
    }
  };

  static signin = async (req, res) => {
    if (req.body.phoneNo) {
      try {
        const response = await userModel.findOne({
          phoneNo: req.body.phoneNo,
          password: req.body.password,
        });
        if (response) {
          var token = jwt.sign(
            { id: response._id },
            process.env.ACCESS_TOKEN_SECRET
          );
          res.json({ Token: token });
        } else res.send({ Token: "invalid" });
      } catch (error) {
        console.log(error);
        res.send({ Error: error });
      }
    } else if (req.body.email) {
      try {
        const response = await userModel.findOne({
          emailId: req.body.phoneNo,
          password: req.body.password,
        });
        if (response) {
          var token = jwt.sign(
            { id: response._id },
            process.env.ACCESS_TOKEN_SECRET
          );
          res.json({ Token: token });
        } else {
          res.send({ Error: error });
        }
      } catch (error) {
        res.send({ Error: error });
      }
    }
  };

  static verify = async (req, res) => {
    try {
      const user_id = req.user.id;
      const response = await userModel.findById(user_id);
      res.json(response);
    } catch (error) {
      res.send({ statu: 401, error });
    }
  };

  static newContact = async (req, res) => {
    const contactPhoneNo = req.body.contactPhoneNo;
    const userId = req.user.id;
    const userPhoneNo = req.body.phoneNo;
    const newRoomId = md5(userPhoneNo + "_" + contactPhoneNo);
    const existingRoomId = md5(contactPhoneNo + "_" + userPhoneNo);
    var roomIds = [];
    var roomid;
    try {
      // find contact detail using contact phoneNo
      const contactDetail = await contactModel.find({
        phoneNo: contactPhoneNo,
      });

      // find contact detail using user phoneNo (currently logged-In user phone No  )
      const [UserNo_Exist] = await contactModel.find({
        phoneNo: userPhoneNo,
      });

      if (UserNo_Exist && UserNo_Exist.roomId.includes(existingRoomId)) {
        // if user phoneNo [document present in collention "contactschemas"] exist.
        //  If exist, then find the roomid(roomid=existingRoomId)
        roomid = existingRoomId;
        roomIds =
          contactDetail.length != 0
            ? [...contactDetail[0].roomId, existingRoomId]
            : [existingRoomId];
      } else {
        // if the user phoneNo is not present then find
        roomid = newRoomId;
        roomIds =
          contactDetail.length != 0
            ? [...contactDetail[0].roomId, newRoomId]
            : [newRoomId];
        console.log("newRoomId ", newRoomId);
      }

      if (contactDetail.length) {
        if (!contactDetail[0].userIDs.includes(userId)) {
          console.log("update");
          const userIds = contactDetail[0].userIDs;
          userIds.push(userId);
          const response = await contactModel.findByIdAndUpdate(
            contactDetail[0]._id,
            { userIDs: userIds, roomId: roomIds }
          );
          res.json({
            response,
            // roomID:
          });
        } else if (contactDetail[0].userIDs.find((e) => e == userId)) {
          res.json({
            response: "already exist",
          });
        }
      } else {
        console.log("enterNew");
        const newContact = new contactModel({
          userIDs: req.user.id,
          name: req.body.contactName,
          phoneNo: req.body.contactPhoneNo,
          roomId: roomIds,
        });
        const result = await newContact.save();
        res.json({
          result,
        });
      }
    } catch (error) {
      res.send({
        status: 200,
        error,
      });
      console.log("error", error);
    }
  };

  static contactList = async (req, res) => {
    try {
      const response = await contactModel.find();
      const userId = req.user.id;

      var contactList = [];
      for (const contact of response) {
        contact.userIDs.find((e) => {
          if (e === userId) contactList.push(contact);
        });
      }
      res.json(contactList);
    } catch (error) {
      res.sendStatus(403);
      console.log(error);
    }
  };
}

module.exports = codeeditorController;
