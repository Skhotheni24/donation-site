const nodemailer = require("nodemailer");
const { GoogleSpreadsheet } = require("google-spreadsheet");

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body);
    const { name, email, reason, bracket, story } = body;

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
      text: `Name: ${name}\nEmail: ${email}\nReason: ${reason}\nBracket: ${bracket}\nStory: ${story}`,
    });

    const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS, "base64").toString("utf-8");
    const creds = JSON.parse(decoded);

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: creds.client_email,
      private_key: creds.private_key,
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      Name: name,
      Email: email,
      Reason: reason,
      Bracket: bracket,
      Story: story,
    });

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
