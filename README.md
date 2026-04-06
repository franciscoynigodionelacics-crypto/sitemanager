## 🚀 Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **UI & Styling:** React Native for Web (`<View>`, `<Text>`, `<ScrollView>`)
* **Icons:** Custom Inline SVGs
* **Fonts:** Geist & Geist Mono

## 📦 Prerequisites

* Node.js (v18.17.0 or higher)
* npm, yarn, or pnpm

## 🛠️ Installation & Setup

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/yourusername/hopecard.git
cd hopecard
\`\`\`

**2. Install dependencies**
Install the base Next.js dependencies:
\`\`\`bash
npm install
\`\`\`

**3. Install React Native Web**
This app uses React Native components for a clean, cross-platform UI architecture. You must install this for the app to compile:
\`\`\`bash
npm install react-native-web
\`\`\`

*(Note: Ensure your `next.config.js` is set up to transpile `react-native-web` if prompted by Next.js).*

**4. Start the development server**
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## 📁 Project Structure

\`\`\`text
hopecard/
├── app/
│   ├── (auth)/             # Login, Signup, Forgot Password, OTP
│   ├── home/               # Main donation dashboard and cart overlay
│   ├── profile/            # Editable donor profile settings
│   ├── transactions/       # Donation history and impact statistics
│   ├── layout.tsx          # Root layout and metadata configuration
│   └── globals.css         # Global stylesheets
├── public/                 # Static assets (logos, images)
\`\`\`