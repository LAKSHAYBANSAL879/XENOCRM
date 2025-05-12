const Customer = require("../modals/customers");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

exports.parseAndFilterCustomers = async (req, res) => {
  const { rule } = req.body;

  if (!rule) return res.status(400).json({ error: "Rule is required." });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an assistant that converts natural language customer segmentation rules into a MongoDB query object (JSON format). Assume each customer document has the following fields: name (string), email (string), state (string), city (string), lastVisited (Date),inactivity_days(number),totalAmountSpent(number), and orders (array of objects with properties: amount (number), date (Date), items (array of strings)).

For the following rule: "${rule}"

Output ONLY a valid MongoDB query object in JSON format. Do not include any explanations, markdown code blocks (like \`\`\`json ... \`\`\`), or any surrounding text. If the rule cannot be directly translated to a MongoDB query, indicate with a JSON object like: {"error": "Cannot translate rule"}.

Here are some examples to guide you:

Rule: customers in California
Output: {"state": "California"}

Rule: customers who have spent more than 1000
Output: {"orders": {"$elemMatch": {"amount": {"$gt": 1000}}}}

Rule: customers who live in New York or New Jersey
Output: {"$or": [{"state": "New York"}, {"state": "New Jersey"}]}

Rule: customers who placed an order after 2024-01-15
Output: {"orders": {"$elemMatch": {"date": {"$gt": "2024-01-15T00:00:00.000Z"}}}}

Rule: customers who bought 'laptop' or 'mouse'
Output: {"orders": {"$elemMatch": {"items": {"$in": ["laptop", "mouse"]}}}}

Now, generate the MongoDB query object for the rule: "${rule}"`;

    const result = await model.generateContent([prompt]);
    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!responseText) {
      return res.status(500).json({ error: "Failed to get a response from the AI." });
    }

    try {
      const query = JSON.parse(responseText);

      if (query && query.error) {
        return res.status(400).json({ error: query.error });
      }

      // Find customers based on the generated MongoDB query
      const matchedCustomers = await Customer.find(query).lean();
      res.json({ matchedCustomers, query });
    } catch (jsonError) {
      console.error("Error parsing Gemini response as JSON:", jsonError);
      console.error("Gemini Response:", responseText);
      res.status(500).json({ error: "Failed to parse Gemini's response as a valid MongoDB query." });
    }
  } catch (err) {
    console.error("Error communicating with Google Gemini:", err);
    res.status(500).json({ error: "Error communicating with Google Gemini." });
  }
};
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("orders");
    res.status(200).json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("orders");
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
