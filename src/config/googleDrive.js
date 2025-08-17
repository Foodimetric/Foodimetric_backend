// utils/googleDrive.js
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");


// Load service account credentials
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: SCOPES,
});

const driveService = google.drive({ version: "v3", auth });

async function uploadFile(filePath, fileName, mimeType) {
    const fileMetadata = {
        name: fileName,
        parents: [process.env.DRIVE_FOLDER_ID]  // put your Google Drive folder ID here
    };

    const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
    };

    const file = await driveService.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
    });

    // Make the file public
    await driveService.permissions.create({
        fileId: file.data.id,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });

    return file.data.webContentLink; // direct link for serving
}

module.exports = { uploadFile };