const nodemailer = require('nodemailer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
console.log("✅ submit-form function triggered");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON input" })
    };
  }

  const { name = "", email = "", reason = "", story = "", bracket = "" } = data;

  if (!name || !email || !reason || !story || !bracket) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "All fields are required" })
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'generic.yes@hotmail.com',
      subject: 'New Financial Assistance Request',
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Donation Bracket:</strong> ${bracket}</p>
        <p><strong>Story:</strong><br>${story}</p>
      `
    });
  } catch (error) {
    console.error("Email error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to send email" }) };
  }

  try {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({ Name: name, Email: email, Reason: reason, Bracket: bracket, Story: story });
  } catch (error) {
    console.error("Google Sheet error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to log to Google Sheet" }) };
  }

  return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };
};
