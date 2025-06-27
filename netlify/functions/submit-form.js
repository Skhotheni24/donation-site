const nodemailer = require("nodemailer");
const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");
console.log("Parsed formData:", formData);

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body);
    const { name, email, amount, story } = body;

    // Email Transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Donation Request",
      text: `Name: ${name}\nEmail: ${email}\nAmount: ${amount}\nStory: ${story}`,
    });

    // Google Credentials from base64
    const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS, "base64").toString("utf-8");
    const creds = JSON.parse(decoded);

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    const client = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    await client.authorize();
    await doc.useServiceAccountAuth({
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    });
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
