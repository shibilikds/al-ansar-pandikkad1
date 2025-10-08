// প্রয়োজনীয় പാക്കേജുകൾ import ചെയ്യുന്നു
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');

// Express ആപ്ലിക്കേഷൻ ഉണ്ടാക്കുന്നു
const app = express();
const port = process.env.PORT || 3000;

// Render-ൽ സെറ്റ് ചെയ്ത Environment Variable-ൽ നിന്ന് കണക്ഷൻ സ്ട്രിംഗ് എടുക്കുന്നു
const mongoUrl = process.env.MONGO_URI || 'mongodb+srv://shibilikds133_db_user:fWMByzwkdjsiH8Fj@cluster0.qainwdh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'alAnsarAdmissions';
const client = new MongoClient(mongoUrl);

// ++ പ്രധാന മാറ്റം ഇവിടെ ++
// ഡാറ്റാബേസുമായി കണക്ട് ചെയ്ത ശേഷം മാത്രം സെർവർ പ്രവർത്തിപ്പിക്കുന്നു
async function startServer() {
    try {
        // 1. ഡാറ്റാബേസുമായി കണക്ട് ചെയ്യുന്നു
        await client.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        const db = client.db(dbName);

        // --- മിഡിൽവെയറുകൾ ഇവിടെ ചേർക്കുന്നു ---
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.static(path.join(__dirname, '..', 'main')));
        app.use('/admission-assets', express.static(path.join(__dirname, 'public')));

        // --- റൂട്ടുകൾ (Routes) ഇവിടെ ചേർക്കുന്നു ---
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'main', 'index.html'));
        });

        app.get('/admission', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'form.html'));
        });

        app.post('/submit-form', async (req, res) => {
            const applicationData = {
                studentName: req.body.studentName,
                email: req.body.email,
                phone: req.body.phone,
                dob: req.body.dob,
                address: req.body.address,
                course: req.body.course,
                submittedAt: new Date()
            };

            try {
                const result = await db.collection('applications').insertOne(applicationData);
                console.log(`New application inserted with _id: ${result.insertedId}`);
                res.send(`
                    <div style="font-family: Poppins, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #1D4C4F;">Thank You, ${applicationData.studentName}!</h1>
                        <p style="color: #495057; font-size: 1.2em;">Your application has been successfully submitted and saved.</p>
                        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #27797F; color: white; text-decoration: none; border-radius: 5px;">Go Back to Home</a>
                    </div>
                `);
            } catch (err) {
                console.error('Failed to insert application into MongoDB', err);
                res.status(500).send('Something went wrong. Please try again later.');
            }
        });

        // 2. ഡാറ്റാബേസ് കണക്ഷൻ വിജയകരമാണെങ്കിൽ മാത്രം സെർവർ ഓൺ ആക്കുന്നു
        app.listen(port, () => {
            console.log(`Server is running successfully on port ${port}`);
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB and start server', err);
        process.exit(1); // പിശക് വന്നാൽ സെർവർ നിർത്തുന്നു
    }
}



