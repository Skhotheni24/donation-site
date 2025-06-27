
const nodemailer = require('nodemailer');
const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SHEET_ID = process.env.SHEET_ID;

exports.handler = async function(event) {
  console.log("✅ submit-form function triggered");
  try {
    const body = JSON.parse(event.body);
    const { name, email, amount, story } = body;

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: EMAIL_USER,
      subject: "New Donation Request",
      text: \`Name: \${name}\nEmail: \${email}\nAmount: \${amount}\nStory: \${story}\`,
    });

    // Write to Google Sheet
    const credsJSON = Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf-8');
    const creds = JSON.parse(credsJSON);

    const doc = new GoogleSpreadsheet(SHEET_ID);
    const client = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await client.authorize();
    await doc.useJwtAuth(client);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({ Name: name, Email: email, Amount: amount, Story: story });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error", error: err.message }),
    };
  }
};
