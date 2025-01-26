# Marketing Tool

A full-stack AI-powered marketing tool that helps generate product content, manage social media campaigns, and provide chatbot interactions for e-commerce products.

## Features

- **Product Management**
  - Add and manage product listings
  - Track inventory and pricing
  - Monitor competitor information

- **AI Content Generation**
  - Generate SEO-optimized product titles
  - Create compelling product descriptions
  - Generate relevant SEO keywords
  - Create full product listings
  - Customizable content sentiment

- **Social Media Campaign Management**
  - Create targeted social media campaigns
  - Generate platform-specific content
  - Schedule posts
  - Track campaign performance

- **Product Chatbot**
  - Interactive product information
  - Answer customer queries
  - Customizable responses
  - Context-aware conversations

## Tech Stack

### Frontend
- React.js
- CSS3
- Axios for API calls
- React Router for navigation
- React Icons

### Backend
- Python
- FastAPI
- MongoDB
- JWT Authentication
- OpenAI Integration

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- MongoDB
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/raghavtalink/marketingTool.git
cd marketingTool
```

2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend Setup
```bash
cd frontend
npm install
```

4. Environment Variables

Backend (.env):
```env
MONGODB_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:8000
```

### Running the Application

1. Start the Backend Server
```bash
cd backend
uvicorn app.main:app --reload
```

2. Start the Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when running the backend server.

### Main Endpoints

- `/auth` - Authentication endpoints
- `/products` - Product management
- `/content` - AI content generation
- `/campaigns` - Social media campaign management
- `/chat` - Product chatbot interactions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Raghav - [@raghavtalink](https://github.com/raghavtalink)

Project Link: [https://github.com/raghavtalink/marketingTool](https://github.com/raghavtalink/marketingTool)
```
