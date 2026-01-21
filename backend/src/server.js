import 'dotenv/config';          //  asta încarcă .env automat, înainte de orice alt import
import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
