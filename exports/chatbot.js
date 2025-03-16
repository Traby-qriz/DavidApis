import axios from 'axios';

const chatbot = {
  send: async (message, model = "gpt-3.5-turbo") => {
    try {
      const modelx = ["gpt-3.5-turbo", "gpt-3.5-turbo-0125", "gpt-4o-mini", "gpt-4o"];
      if (!modelx.includes(model)) {
        throw new Error("Invalid/Unsupported Model: " + modelx.join(', '));
      }
      const payload = {
        messages: [{
          role: "user",
          content: message
        }],
        model: model
      };
      const response = await axios.post("https://mpzxsmlptc4kfw5qw2h6nat6iu0hvxiw.lambda-url.us-east-2.on.aws/process", payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Postify/1.0.0'
        }
      });

      // Extract and return only the content from the response
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

export { chatbot };
