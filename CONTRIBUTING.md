# Contributing to Dhruva

Thank you for your interest in contributing to Dhruva!

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/Asymptote-Horizon/Dhruva.git
   cd Dhruva
   ```

2. Run Frontend:
   ```bash
   cd frontend-app
   npm install
   npm run dev
   ```

3. Run Backend & Tests:
   ```bash
   cd backend
   pip install -r requirements.txt
   pytest tests/ -v
   ```

## Pull Request Guidelines
- Ensure all tests pass (`pytest backend/tests`).
- Ensure the Next.js production build succeeds (`npm run build`).
- Adhere to accessibility and responsive design standards.
