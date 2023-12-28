const EmailModel = require('../models/email.model');
const UserModel = require('../models/userModel');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.saveSendEmails = async (req, res) => {
  try {
    const { to, from, subject, body, date, image, name, type } = req.body;

    if (!to || !from) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newEmail = new EmailModel({
      to,
      from,
      subject,
      body,
      date,
      image,
      name,
      type,
      folders: [
        { user: to, starred: false, bin: false, read: false },
        { user: from, starred: false, bin: false, read: false },
      ],
    });

    await newEmail.save();

    await UserModel.updateOne(
      { email: from },
      { $push: { sentEmails: newEmail._id } }
    );

    await UserModel.updateOne(
      { email: to },
      { $push: { receivedEmails: newEmail._id } }
    );

    // Send a success response to the client
    return res.status(201).json({ message: 'Email saved and sent successfully.' });
  } catch (error) {
    // Handle errors, log them, and send an appropriate response to the client
    console.error('Error saving and sending email:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.getSentEmails = async (req, res) => {
  try {
 
    const loggedInUserPseudo = req.params.email; 
    const loggedInUser = await UserModel.findOne({ email: loggedInUserPseudo });

    const sentEmails = loggedInUser.sentEmails || [];

    const detailedSentEmails = await EmailModel.find({ _id: { $in: sentEmails } });

    res.json(detailedSentEmails);
  } catch (error) {
    console.error('Error retrieving sent emails:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports.getReceivedEmails = async (req, res) => {
  try {
 
    const loggedInUserPseudo = req.body.email; 
    const loggedInUser = await UserModel.findOne({ email: loggedInUserPseudo });

    const Emails = loggedInUser.receivedEmails || [];

    const receivedEmails = await EmailModel.find({ _id: { $in: Emails } });

    res.json(receivedEmails);
  } catch (error) {
    console.error('Error retrieving sent emails:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports.toggleStarredEmail = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Missing emailId field.' });
    }

    const updatedEmail = await EmailModel.findOneAndUpdate(
      { _id: emailId, 'folders.user': req.params.email },
      { 'folders.$.starred': true },
      { new: true }
    );

    if (!updatedEmail) {
      return res.status(404).json({ error: 'Email not found or not authorized.' });
    }

    res.json(updatedEmail);
  } catch (error) {
    console.error('Error toggling starred status:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports.untoggleStarredEmail = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Missing emailId field.' });
    }

    const updatedEmail = await EmailModel.findOneAndUpdate(
      { _id: emailId, 'folders.user': req.params.email },
      { 'folders.$.starred': false },
      { new: false }
    );

    if (!updatedEmail) {
      return res.status(404).json({ error: 'Email not found or not authorized.' });
    }

    res.json(updatedEmail);
  } catch (error) {
    console.error('Error toggling starred status:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports.getStarredEmails = async (req, res) => {
  try {
    const loggedInUserEmail = req.params.email;

    // Find all emails where the user is starred
    const starredEmails = await EmailModel.find({
      'folders.user': loggedInUserEmail,
      'folders.starred': true,
    });

    res.json(starredEmails);
  } catch (error) {
    console.error('Error retrieving starred emails:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


module.exports.moveEmailsToBin = async (req, res) => {
  try {
    const { emailIds } = req.body;

    // Validate if required fields are present
    if (!emailIds || !Array.isArray(emailIds)) {
      return res.status(400).json({ error: 'Invalid emailIds field.' });
    }

    const loggedInUserEmail = req.params.email; 

    // Update binEmails, pull from sentEmails, and pull from receivedEmails
    await UserModel.updateOne(
      { email: loggedInUserEmail },
      {
        $push: { binEmails: { $each: emailIds } },
        $pull: {
          sentEmails: { $in: emailIds },
          receivedEmails: { $in: emailIds },
        },
      }
    );

    res.json({ message: 'Emails moved to bin successfully.' });
  } catch (error) {
    console.error('Error moving emails to bin:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports.removeEmailsFromBin = async (req, res) => {
  try {
    const { emailIds } = req.body;

    // Validate if required fields are present
    if (!emailIds || !Array.isArray(emailIds)) {
      return res.status(400).json({ error: 'Invalid emailIds field.' });
    }

    const loggedInUserEmail = req.params.email;

    // Find the user with the given email
    const user = await UserModel.findOne({ email: loggedInUserEmail });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Find the emails where loggedInUserEmail is in the 'to' or 'from' field
    const emails = await EmailModel.find({
      _id: { $in: emailIds },
      $or: [{ to: loggedInUserEmail }, { from: loggedInUserEmail }],
    });

    // Separate emailIds into sentEmailIds and receivedEmailIds based on the user's role
    const sentEmailIds = emails
      .filter((email) => email.from === loggedInUserEmail)
      .map((email) => email._id);

    const receivedEmailIds = emails
      .filter((email) => email.to === loggedInUserEmail)
      .map((email) => email._id);

    // Remove emailIds from binEmails and move to the respective sentEmails or receivedEmails field
    await UserModel.updateOne(
      { email: loggedInUserEmail },
      {
        $pull: { binEmails: { $in: emailIds } },
        $addToSet: { sentEmails: { $each: sentEmailIds }, receivedEmails: { $each: receivedEmailIds } },
      }
    );

    res.json({ message: 'Emails removed from bin successfully.' });
  } catch (error) {
    console.error('Error removing emails from bin:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports.displayBinEmails = async (req, res) => {
  try {
 
    const loggedInUserPseudo = req.params.email; 
    const loggedInUser = await UserModel.findOne({ email: loggedInUserPseudo });

    const Emails = loggedInUser.binEmails || [];

    const binEmails = await EmailModel.find({ _id: { $in: Emails } });

    res.json(binEmails);
  } catch (error) {
    console.error('Error retrieving sent emails:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports.deleteEmail = async (req, res) => {
  try {
    // Assuming you have a user ID associated with the logged-in user
    const loggedInUserPseudo = req.params.email; // Adjust this based on your authentication setup
    const emailIdToDelete = req.body.emailId; // Assuming you pass the email ID as a parameter in the request

    // Find the logged-in user
    const loggedInUser = await UserModel.findOne({ email: loggedInUserPseudo });

    // Remove the email ID from the sentEmails array
    loggedInUser.sentEmails = loggedInUser.sentEmails.filter(id => id.toString() !== emailIdToDelete);

    // Save the updated user model
    await loggedInUser.save();

    res.json({ message: 'Email deleted successfully.' });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
