require('dotenv').config();
const express = require('express');
const simpleGit = require('simple-git');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const git = simpleGit();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.use(cors());
app.use(bodyParser.json());

app.post('/upload', async (req, res) => {
  const { filePath, commitMessage } = req.body;

  try {
    await git.add(filePath);
    await git.commit(commitMessage);
    await git.push('origin', 'main');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Git Commit Notification',
      text: `A new commit has been made: ${commitMessage}`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.status(500).send('Failed to send email');
      } else {
        console.log('Email sent: ' + info.response);
        res.send('File uploaded, committed to Git, and email sent successfully');
      }
    });
  } catch (error) {
    console.error('Failed to upload file to Git:', error);
    res.status(500).send('Failed to upload file to Git');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
