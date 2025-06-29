exports.handler = async function(event, context) {
  try {
    const data = JSON.parse(event.body);

    console.log("Received data:", data);

    if (!data.name || !data.email || !data.reason || !data.bracket || !data.story) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Form submission successful" })
    };
  } catch (error) {
    console.error("Form submission error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
